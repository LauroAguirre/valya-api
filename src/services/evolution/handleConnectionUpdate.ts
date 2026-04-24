import { Prisma } from '@prisma/client'
import prisma from '@/config/database'

export const handleConnectionUpdate = async (
  instanceName: string,
  state: string
) => {
  // Ignore transitional states like 'connecting' — only persist terminal states
  if (state !== 'open' && state !== 'close') return

  const connected = state === 'open'

  try {
    await prisma.evolutionConfig.update({
      where: { instanceName },
      data: { connected }
    })
    return { instanceName, connected }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      // Record not found — instance was deleted; nothing to update
      return
    }
    console.error('[handleConnectionUpdate] Unexpected database error:', error)
    throw error
  }
}
