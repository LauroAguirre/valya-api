import { processIncomingMessage } from '@/services/attendance/processIncomingMessage'
import { handleConnectionUpdate } from '@/services/evolution/handleConnectionUpdate'
import { Request, Response } from 'express'

export const evolutionWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body
    const event = body.event

    if (event === 'messages.upsert') {
      const messageData = body.data
      if (messageData?.key?.remoteJid?.includes('@g.us')) {
        res.status(200).json({ received: true })
        return
      }

      const messageContent =
        messageData?.message?.conversation ||
        messageData?.message?.extendedTextMessage?.text ||
        messageData?.message?.imageMessage?.caption ||
        ''
      if (!messageContent) {
        res.status(200).json({ received: true })
        return
      }

      const instanceName = body.instance || body.instanceName

      setImmediate(async () => {
        try {
          await processIncomingMessage({
            instanceName,
            remoteJid: messageData.key.remoteJid,
            fromMe: messageData.key.fromMe || false,
            message: messageContent,
            pushName: messageData.pushName
          })
        } catch (error) {
          console.error(
            '[Webhook Evolution] Erro ao processar mensagem:',
            error
          )
        }
      })
    }

    if (event === 'connection.update') {
      const instanceName = body.instance || body.instanceName
      const state = body.data?.state
      if (instanceName && state)
        await handleConnectionUpdate(instanceName, state)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('[Webhook Evolution] Erro:', error)
    res.status(200).json({ received: true })
  }
}
