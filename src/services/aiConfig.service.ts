import prisma from '../config/database.js';

export const aiConfigService = {
  async get(userId: string) {
    const config = await prisma.aiConfig.findUnique({ where: { userId } });
    if (!config) return prisma.aiConfig.create({ data: { userId } });
    return config;
  },

  async update(userId: string, data: { customPrompt?: string; isActive?: boolean }) {
    return prisma.aiConfig.upsert({
      where: { userId },
      create: { userId, customPrompt: data.customPrompt, isActive: data.isActive ?? true },
      update: { customPrompt: data.customPrompt, isActive: data.isActive },
    });
  },
};
