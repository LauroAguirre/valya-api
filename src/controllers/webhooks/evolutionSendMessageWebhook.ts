import { Request, Response } from 'express'
import { MessageSender } from '@prisma/client'
import prisma from '@/config/database'
import { normalizeJid } from '@/utils/helpers'
import { findConfigByInstanceName } from '@/services/evolution/evolutionService'
import { findOrCreateByPhone } from '@/services/leads/findOrCreateByPhone'

export const evolutionSendMessageWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const instanceName = body.instance || body.instanceName
    const data = body.data

    if (!instanceName || !data) return

    const remoteJid: string = data.key?.remoteJid
    if (!remoteJid?.includes('@s.whatsapp.net')) return

    const content: string =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      data.message?.imageMessage?.caption ||
      ''
    if (!content) return

    const config = await findConfigByInstanceName(instanceName)
    if (!config) return

    const { userId } = config
    const phone = normalizeJid(remoteJid)
    const lead = await findOrCreateByPhone(userId, phone)

    const evolutionMessageId: string | undefined = data.key?.id
    await prisma.message.create({
      data: { leadId: lead.id, sender: MessageSender.BROKER, content, evolutionMessageId }
    })
  } catch (error) {
    console.error('[Webhook Evolution SendMessage] Erro:', error)
  }
}
