import { Request, Response } from 'express'
import { handleConnectionUpdate } from '@/services/evolution/handleConnectionUpdate'

export const evolutionConnectionWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const instanceName = body.instance || body.instanceName
    const state = body.data?.state

    if (instanceName && state) {
      await handleConnectionUpdate(instanceName, state)
    }
  } catch (error) {
    console.error('[Webhook Evolution Connection] Erro:', error)
  }
}
