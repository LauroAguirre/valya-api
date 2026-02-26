import prisma from '../config/database.js';

export const aiConfigService = {
  async get(userId: string) {
    const config = await prisma.aiConfig.findUnique({ where: { userId } });
    if (!config) {
      // Criar config padrao se nao existir
      return prisma.aiConfig.create({
        data: { userId },
      });
    }
    return config;
  },

  async update(userId: string, data: { customPrompt?: string; isActive?: boolean }) {
    const config = await prisma.aiConfig.upsert({
      where: { userId },
      create: {
        userId,
        customPrompt: data.customPrompt,
        isActive: data.isActive ?? true,
      },
      update: {
        customPrompt: data.customPrompt,
        isActive: data.isActive,
      },
    });

    return config;
  },
};
