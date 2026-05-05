import { MessageSender } from '@prisma/client'
import prisma from '@/config/database'
import { normalizeJid } from '@/utils/helpers'
import { findOrCreateByPhone } from '../leads/findOrCreateByPhone'
import { hydrateHistory } from '../evolution/hydrateHistory'
import { sendMessage } from '../evolution/sendMessage'
import { buildAndRespond } from '../promptBuilder/buildAndRespond'
import { emitToUser } from '@/config/socket'

export const processIncomingMessage = async (data: {
  instanceName: string
  remoteJid: string
  evolutionMessageId?: string
  fromMe: boolean
  message: string
  pushName?: string
}) => {
  const { instanceName, remoteJid, evolutionMessageId, fromMe, message, pushName } = data
  const leadPhone = normalizeJid(remoteJid)

  const evolutionConfig = await prisma.evolutionConfig.findUnique({
    where: { instanceName },
    include: { user: { select: { id: true, name: true, phone: true } } }
  })

  if (!evolutionConfig?.user) {
    console.error(`[Attendance] Instancia nao encontrada: ${instanceName}`)
    return
  }

  const userId = evolutionConfig.user.id
  const lead = await findOrCreateByPhone(userId, leadPhone, pushName)

  const messageCount = await prisma.message.count({
    where: { leadId: lead.id }
  })
  if (messageCount === 0) {
    await hydrateHistory(instanceName, remoteJid, lead.id)
  }

  const sender = fromMe ? MessageSender.BROKER : MessageSender.LEAD
  const savedMessage = await prisma.message.create({
    data: { leadId: lead.id, sender, content: message, evolutionMessageId }
  })
  emitToUser(userId, 'new_message', savedMessage)

  if (sender === MessageSender.LEAD) {
    await prisma.lead.update({
      where: { id: lead.id },
      data: { lastReplyAt: new Date() }
    })
  }

  if (fromMe) return { processed: true, aiResponse: false }

  if (!lead.aiEnabled) {
    console.log(`[Attendance] IA desativada para lead ${lead.id}`)
    return { processed: true, aiResponse: false }
  }

  const aiConfig = await prisma.aiConfig.findUnique({ where: { userId } })
  if (!aiConfig?.isActive) {
    console.log(`[Attendance] IA global desativada para corretor ${userId}`)
    return { processed: true, aiResponse: false }
  }

  try {
    const { message: aiMessage } = await buildAndRespond(userId, lead.id)
    if (!aiMessage) {
      console.error('[Attendance] Resposta vazia do prompt builder')
      return { processed: true, aiResponse: false }
    }

    const aiSavedMessage = await prisma.message.create({
      data: { leadId: lead.id, sender: MessageSender.AI, content: aiMessage }
    })
    emitToUser(userId, 'new_message', aiSavedMessage)
    await sendMessage({ instanceName, to: leadPhone, message: aiMessage })

    console.log(
      `[Attendance] Resposta IA enviada para ${leadPhone} via ${instanceName}`
    )
    return { processed: true, aiResponse: true, message: aiMessage }
  } catch (error) {
    console.error('[Attendance] Erro ao gerar resposta IA:', error)
    return { processed: true, aiResponse: false, error: String(error) }
  }
}
