import { Request, Response } from 'express'
import { syncContact } from '@/services/evolution/syncContact'

export const evolutionContactsWebhook = async (req: Request, res: Response) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const instanceName = body.instance || body.instanceName
    const contacts = body.data

    // console.log({ contacts })

    if (!instanceName || !Array.isArray(contacts) || contacts.length === 0)
      return

    await syncContact(instanceName, contacts)
  } catch (error) {
    console.error('[Webhook Evolution Contacts] Erro:', error)
  }
}
