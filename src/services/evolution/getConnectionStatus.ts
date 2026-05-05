import prisma from '@/config/database'

export const getConnectionStatus = async (userId: string) => {
  return prisma.evolutionConfig.findFirst({
    where: {
      userId
    }
  })
}
