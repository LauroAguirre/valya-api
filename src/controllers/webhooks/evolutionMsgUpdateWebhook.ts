import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '@/config/database'
import { mapMessageStatus } from '@/services/evolution/mapMessageStatus'

export const evolutionMsgUpdateWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const raw = body.data

    // Evolution sends either a single object or an array of updates
    const updates: {
      key?: { id?: string }
      update?: { status?: string | number }
    }[] = Array.isArray(raw) ? raw : raw ? [raw] : []

    for (const item of updates) {
      const evolutionMessageId = item.key?.id
      const status = mapMessageStatus(item.update?.status)

      if (!evolutionMessageId || !status) continue

      await prisma.message.update({
        where: { evolutionMessageId },
        data: { status }
      })
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return
    }
    console.error('[Webhook Evolution MsgUpdate] Erro:', error)
  }
}
