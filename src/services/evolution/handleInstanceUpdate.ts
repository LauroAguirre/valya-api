import { BaileysStatus, Prisma } from '@prisma/client'
import prisma from '@/config/database'
import { emitToUser } from '@/config/socket'

export const handleInstanceUpdate = async (instanceName: string) => {
  try {
    const config = await prisma.evolutionConfig.update({
      where: { instanceName },
      data: { status: BaileysStatus.CONNECTING, connected: false }
    })

    emitToUser(config.userId, 'instance_status', {
      status: BaileysStatus.CONNECTING,
      connected: false
    })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return
    }
    console.error('[handleInstanceUpdate] Unexpected database error:', error)
    throw error
  }
}
