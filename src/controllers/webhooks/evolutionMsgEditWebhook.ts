import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '@/config/database'

export const evolutionMsgEditWebhook = async (req: Request, res: Response) => {
  res.status(200).json({ received: true })

  try {
    const data = req.body.data
    if (!data) return

    const evolutionMessageId: string | undefined = data.key?.id
    if (!evolutionMessageId) return

    // console.log('Mensagem: ', data.message)

    const newContent: string =
      data.message?.protocolMessage?.editedMessage?.conversation ||
      data.message?.editedMessage?.message?.conversation ||
      data.message?.conversation ||
      ''

    console.log({ newContent })
    if (!newContent) return

    await prisma.message.update({
      where: { evolutionMessageId },
      data: { content: newContent }
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return
    }
    console.error('[Webhook Evolution MsgEdit] Erro:', error)
  }
}
