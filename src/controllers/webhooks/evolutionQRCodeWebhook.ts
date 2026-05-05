import { Request, Response } from 'express'
import { findConfigByInstanceName } from '@/services/evolution/evolutionService'
import { emitToUser } from '@/config/socket'

export const evolutionQRCodeWebhook = async (req: Request, res: Response) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const instanceName = body.instance || body.instanceName
    const qrCodeData = body.data

    if (!instanceName || !qrCodeData) return

    const config = await findConfigByInstanceName(instanceName)
    console.log({ config })
    console.log({ qrCodeData })
    if (config) {
      emitToUser(config.userId, 'qr_code_v2', qrCodeData)
      // emitToUser(config.userId, 'qr_code_v2', qrCodeData)
    }
  } catch (error) {
    console.error('[Webhook Evolution QRCode] Erro:', error)
  }
}
