import { Request, Response } from 'express'
import { BaileysStatus } from '@prisma/client'
import prisma from '@/config/database'
import { emitToUser } from '@/config/socket'
import { findConfigByInstanceName } from '@/services/evolution/evolutionService'

export const evolutionLogoutWebhook = async (req: Request, res: Response) => {
  res.status(200).json({ received: true })

  try {
    const instanceName = req.body.instance || req.body.instanceName
    if (!instanceName) return

    const config = await findConfigByInstanceName(instanceName)
    if (!config) return

    await prisma.evolutionConfig.update({
      where: { instanceName },
      data: { connected: false, status: BaileysStatus.DISCONNECTED }
    })

    emitToUser(config.userId, 'logout_instance', { status: 'disconnected' })
  } catch (error) {
    console.error('[Webhook Evolution Logout] Erro:', error)
  }
}
