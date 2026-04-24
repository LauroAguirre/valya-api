import prisma from '@/config/database'
import { normalizePhone } from '@/utils/helpers'
import { LeadOrigin, LeadStage, MessageSender } from '@prisma/client'
import { sendMessage } from '../evolution/sendMessage'
import { runSdrAgent } from '../openAi/sdrAgent'

// Matches http/https URLs; trailing punctuation is stripped after match
const URL_REGEX = /https?:\/\/[^\s]+/g

function extractAndCleanUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? []
  return matches
    .map(raw => raw.replace(/[.,;!?)"']+$/, ''))
    .flatMap(url => {
      try {
        const { protocol, host, pathname } = new URL(url)
        return [`${protocol}//${host}${pathname}`]
      } catch {
        return []
      }
    })
}

export interface ProcessCompleteMessageInput {
  instanceName: string
  remoteJid: string
  fullMessage: string
}

export interface ProcessCompleteMessageResult {
  processed: boolean
  aiResponse: boolean
  action?: 'reply' | 'handover' | 'discard'
  error?: string
}

export const processCompleteMessage = async (
  data: ProcessCompleteMessageInput
): Promise<ProcessCompleteMessageResult> => {
  const { instanceName, remoteJid, fullMessage } = data

  // ── 1. Multi-tenant routing: resolve broker from instanceName ──────────────
  const evolutionConfig = await prisma.evolutionConfig.findUnique({
    where: { instanceName },
    include: { user: { select: { id: true, name: true } } }
  })

  if (!evolutionConfig?.user) {
    console.error(`[SDR] Instance not found: ${instanceName}`)
    return { processed: false, aiResponse: false }
  }

  const brokerId = evolutionConfig.user.id
  const brokerName = evolutionConfig.user.name
  const leadPhone = normalizePhone(remoteJid.replace('@s.whatsapp.net', ''))

  // ── 2. Find or create lead — composite key: (userId, phone) ───────────────
  // A phone number can exist across multiple brokers; isolate by brokerId.
  let lead = await prisma.lead.findFirst({
    where: { userId: brokerId, phone: leadPhone }
  })

  const isNewLead = !lead

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        userId: brokerId,
        phone: leadPhone,
        name: leadPhone,
        origin: LeadOrigin.WHATSAPP,
        stage: LeadStage.QUALIFICATION,
        aiEnabled: true
      }
    })
  }

  // ── 3. Persist the incoming message ───────────────────────────────────────
  await prisma.message.create({
    data: { leadId: lead.id, sender: MessageSender.LEAD, content: fullMessage }
  })

  await prisma.lead.update({
    where: { id: lead.id },
    data: { lastReplyAt: new Date() }
  })

  // ── 4. AI gate: skip if a broker has taken over this lead ─────────────────
  if (!lead.aiEnabled && !isNewLead) {
    console.log(`[SDR] AI disabled for lead ${lead.id} — broker is handling`)
    return { processed: true, aiResponse: false }
  }

  // ── 5. Broker-level AI toggle ──────────────────────────────────────────────
  const aiConfig = await prisma.aiConfig.findUnique({
    where: { userId: brokerId }
  })

  if (!aiConfig?.isActive) {
    console.log(`[SDR] AI globally disabled for broker ${brokerId}`)
    return { processed: true, aiResponse: false }
  }

  // ── 6. URL interception: find properties matching any shared links ─────────
  const cleanedUrls = extractAndCleanUrls(fullMessage)
  let linkedPropertyContext = ''

  if (cleanedUrls.length > 0) {
    const adLinks = await prisma.propertyAdLink.findMany({
      where: {
        url: { in: cleanedUrls },
        property: { userId: brokerId, deletedAt: null }
      },
      include: {
        property: {
          select: {
            name: true,
            type: true,
            address: true,
            neighborhood: true,
            city: true,
            bedrooms: true,
            bathrooms: true,
            privateArea: true,
            totalPrice: true,
            minDown: true,
            installmentValue: true,
            paymentConditions: true
          }
        }
      }
    })

    if (adLinks.length > 0) {
      const descriptions = adLinks.map(link => {
        const p = link.property
        return [
          `Property: ${p.name}`,
          p.type ? `Type: ${p.type}` : null,
          p.address ? `Address: ${p.address}` : null,
          p.neighborhood ? `Neighborhood: ${p.neighborhood}` : null,
          p.city ? `City: ${p.city}` : null,
          p.bedrooms != null ? `Bedrooms: ${p.bedrooms}` : null,
          p.bathrooms != null ? `Bathrooms: ${p.bathrooms}` : null,
          p.privateArea != null
            ? `Private Area: ${p.privateArea.toNumber()} m²`
            : null,
          p.totalPrice != null
            ? `Total Price: R$ ${p.totalPrice.toNumber().toLocaleString('pt-BR')}`
            : null,
          p.minDown != null
            ? `Min Down Payment: R$ ${p.minDown.toNumber().toLocaleString('pt-BR')}`
            : null,
          p.installmentValue != null
            ? `Monthly Installment: R$ ${p.installmentValue.toNumber().toLocaleString('pt-BR')}`
            : null,
          p.paymentConditions
            ? `Payment Conditions: ${p.paymentConditions}`
            : null
        ]
          .filter(Boolean)
          .join('\n')
      })

      linkedPropertyContext = `System Context: The lead shared a property listing URL. Here are the details of the matched listing(s):\n\n${descriptions.join('\n\n')}`
    }
  }

  // ── 7. Retrieve chat history for this lead ────────────────────────────────
  // The message we just persisted is already included since it was created above.
  const rawMessages = await prisma.message.findMany({
    where: { leadId: lead.id },
    orderBy: { createdAt: 'asc' },
    take: 60
  })

  // Exclude broker-sent messages; map to OpenAI role format
  const chatHistory = rawMessages
    .filter(m => m.sender !== MessageSender.BROKER)
    .map(m => ({
      role: (m.sender === MessageSender.AI ? 'assistant' : 'user') as
        | 'user'
        | 'assistant',
      content: m.content
    }))

  // ── 8. Run SDR agent ───────────────────────────────────────────────────────
  try {
    const result = await runSdrAgent({
      brokerName,
      chatHistory,
      linkedPropertyContext
    })

    // When qualification is complete (either direction), disable AI for this lead
    if (result.action === 'handover' || result.action === 'discard') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { aiEnabled: false }
      })

      console.log(
        `[SDR] Lead ${lead.id} ${result.action === 'handover' ? 'handed over to broker' : 'discarded'}`
      )
    }

    if (result.message) {
      await prisma.message.create({
        data: {
          leadId: lead.id,
          sender: MessageSender.AI,
          content: result.message
        }
      })

      await sendMessage({ instanceName, to: leadPhone, message: result.message })

      console.log(
        `[SDR] AI response (${result.action}) sent to ${leadPhone} via ${instanceName}`
      )
    }

    return { processed: true, aiResponse: !!result.message, action: result.action }
  } catch (error) {
    console.error(`[SDR] Error generating AI response:`, error)
    return { processed: true, aiResponse: false, error: String(error) }
  }
}
