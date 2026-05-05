import { MessageSender } from '@prisma/client'
import { evolutionApi } from '@/providers/evolutionApi'
import prisma from '@/config/database'

interface EvolutionHistoryMessage {
  key: { remoteJid: string; fromMe: boolean; id: string }
  message?: {
    conversation?: string
    extendedTextMessage?: { text?: string }
    imageMessage?: { caption?: string }
  }
  messageTimestamp?: number
}

function extractContent(msg: EvolutionHistoryMessage): string {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    ''
  )
}

export async function hydrateHistory(
  instanceName: string,
  jid: string,
  leadId: string
): Promise<void> {
  let raw: unknown

  try {
    const response = await evolutionApi.get(
      `/chat/fetchMessages/${instanceName}`,
      {
        params: { where: { key: { remoteJid: jid } }, limit: 40 }
      }
    )
    raw = response.data
  } catch (error) {
    console.error('[hydrateHistory] Falha ao buscar histórico Evolution:', error)
    return
  }

  const messages: EvolutionHistoryMessage[] = Array.isArray(raw)
    ? (raw as EvolutionHistoryMessage[])
    : Array.isArray((raw as { messages?: unknown })?.messages)
      ? ((raw as { messages: EvolutionHistoryMessage[] }).messages)
      : []

  const records = messages.reduce<
    {
      leadId: string
      evolutionMessageId: string
      sender: MessageSender
      content: string
      createdAt: Date
    }[]
  >((acc, msg) => {
    const content = extractContent(msg)
    if (!content) return acc

    acc.push({
      leadId,
      evolutionMessageId: msg.key.id,
      sender: msg.key.fromMe ? MessageSender.BROKER : MessageSender.LEAD,
      content,
      createdAt: msg.messageTimestamp
        ? new Date(msg.messageTimestamp * 1000)
        : new Date()
    })
    return acc
  }, [])

  if (records.length > 0) {
    await prisma.message.createMany({ data: records, skipDuplicates: true })
    console.log(
      `[hydrateHistory] ${records.length} mensagens salvas para lead ${leadId}`
    )
  }
}
