import { Request, Response } from 'express'
import { handlePaymentWebhook } from '@/services/asaas/handlePaymentWebhook'

export const asaasWebhook = async (req: Request, res: Response) => {
  try {
    const { event, payment } = req.body
    if (!event || !payment) {
      res.status(200).json({ received: true })
      return
    }

    setImmediate(async () => {
      try {
        await handlePaymentWebhook(event, payment)
      } catch (error) {
        console.error('[Webhook Asaas] Erro ao processar:', error)
      }
    })

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('[Webhook Asaas] Erro:', error)
    res.status(200).json({ received: true })
  }
}
