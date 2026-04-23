import prisma from '@/config/database'
import { classifyIntent } from './classifyIntent'
import { API_SYSTEM_PROMPT, DB_INTENTS } from './configConstants'
import { summarizeConversation } from './summarizeConversation'
import { openaiChat } from '../openAi/chat'
import { extractFilters } from './extractFilters'
import { queryProperties } from './queryProperties'
import { formatPropertiesForPrompt } from './formatPropertiesForPrompt'
import { buildFinalPrompt } from './buildFinalPrompt'

export const buildAndRespond = async (
  corretorId: string,
  leadId: string
): Promise<{ message: string }> => {
  const messages = await prisma.message.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  const sortedMessages = messages.reverse()

  const [aiConfig, broker] = await Promise.all([
    prisma.aiConfig.findUnique({ where: { clientId: corretorId } }),
    prisma.client.findUnique({
      where: { id: corretorId },
      select: { name: true, phone: true }
    })
  ])

  const conversationSummary = summarizeConversation(sortedMessages)
  const intent = await classifyIntent(conversationSummary)

  let propertyData = ''
  if (DB_INTENTS.includes(intent)) {
    const filters = await extractFilters(conversationSummary)
    const properties = await queryProperties(corretorId, filters).then(
      rawProperties => {
        return rawProperties.map(p => ({
          ...p,
          totalPrice: p.totalPrice?.toNumber() ?? null,
          minDown: p.minDown?.toNumber() ?? null,
          installmentValue: p.installmentValue?.toNumber() ?? null,
          privateArea: p.privateArea?.toNumber() ?? null
        }))
      }
    )

    if (properties.length > 0)
      propertyData = formatPropertiesForPrompt(properties)
  }

  const finalPrompt = buildFinalPrompt({
    apiPrompt: API_SYSTEM_PROMPT,
    customPrompt: aiConfig?.customPrompt || '',
    conversationSummary,
    intent,
    propertyData,
    brokerName: broker?.name || 'Corretor'
  })

  const lastLeadMessage =
    sortedMessages.filter(m => m.sender === 'LEAD').pop()?.content || ''

  const response = await openaiChat(finalPrompt, lastLeadMessage, {
    temperature: 0.7,
    maxTokens: 500
  })
  return { message: response }
}
