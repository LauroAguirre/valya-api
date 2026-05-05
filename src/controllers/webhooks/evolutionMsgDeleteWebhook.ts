import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '@/config/database'

export const evolutionMsgDeleteWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const data = req.body.data
    if (!data) return

    const evolutionMessageId: string | undefined = data.key?.id
    if (!evolutionMessageId) return

    await prisma.message.update({
      where: { evolutionMessageId },
      data: { deletedAt: new Date() }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return
    }
    console.error('[Webhook Evolution MsgDelete] Erro:', error)
  }
}
