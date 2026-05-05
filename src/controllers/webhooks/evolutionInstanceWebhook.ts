import { Request, Response } from 'express'
import { handleInstanceUpdate } from '@/services/evolution/handleInstanceUpdate'

export const evolutionInstanceWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const instanceName = req.body.instance || req.body.instanceName

    if (instanceName) {
      await handleInstanceUpdate(instanceName)
    }
  } catch (error) {
    console.error('[Webhook Evolution Instance] Erro:', error)
  }
}
