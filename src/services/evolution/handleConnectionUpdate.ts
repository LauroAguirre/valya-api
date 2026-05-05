import { BaileysStatus, Prisma } from '@prisma/client'
import prisma from '@/config/database'
import { emitToUser } from '@/config/socket'

function toStatus(state: string): BaileysStatus {
  const map: Record<string, BaileysStatus> = {
    open: BaileysStatus.OPEN,
    connected: BaileysStatus.CONNECTED,
    connecting: BaileysStatus.CONNECTING,
    close: BaileysStatus.CLOSED,
    closed: BaileysStatus.CLOSED,
    disconnected: BaileysStatus.DISCONNECTED,
    refused: BaileysStatus.REFUSED
  }
  return map[state.toLowerCase()] ?? BaileysStatus.DISCONNECTED
}

export const handleConnectionUpdate = async (
  instanceName: string,
  state: string
) => {
  const status = toStatus(state)
  const connected =
    status === BaileysStatus.OPEN || status === BaileysStatus.CONNECTED

  try {
    const config = await prisma.evolutionConfig.update({
      where: { instanceName },
      data: { connected, status }
    })
    emitToUser(config.userId, 'connection_update', { status, connected })
    return { instanceName, connected, status }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return
    }
    console.error('[handleConnectionUpdate] Unexpected database error:', error)
    throw error
  }
}
