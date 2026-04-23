import prisma from '@/config/database'

export const getAiConfig = async (userId: string) => {
  const config = await prisma.aiConfig.findUnique({ where: { userId } })
  if (!config) return prisma.aiConfig.create({ data: { userId } })
  return config
}
