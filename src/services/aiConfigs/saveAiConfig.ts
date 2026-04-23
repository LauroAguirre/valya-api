import prisma from '@/config/database'

export const saveAiConfig = async (
  userId: string,
  data: { customPrompt?: string; isActive?: boolean }
) => {
  return prisma.aiConfig.upsert({
    where: {
      userId
    },
    create: {
      userId,
      customPrompt: data.customPrompt,
      isActive: data.isActive ?? true
    },
    update: {
      customPrompt: data.customPrompt,
      isActive: data.isActive
    }
  })
}
