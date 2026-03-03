import prisma from '../config/database.js';

type LeadStage = 'QUALIFICACAO' | 'CADENCIA' | 'VISITA' | 'PROPOSTA' | 'CONTRATO' | 'GANHO' | 'PERDA';

export const leadService = {
  async listByStage(userId: string) {
    const leads = await prisma.lead.findMany({
      where: { userId },
      include: {
        leadProperties: {
          include: { property: { select: { id: true, name: true } } },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const stages: Record<string, typeof leads> = {
      QUALIFICACAO: [], CADENCIA: [], VISITA: [], PROPOSTA: [], CONTRATO: [], GANHO: [], PERDA: [],
    };

    for (const lead of leads) {
      if (stages[lead.stage]) stages[lead.stage].push(lead);
    }

    return stages;
  },

  async getById(userId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, userId },
      include: { leadProperties: { include: { property: { select: { id: true, name: true } } } } },
    });
    if (!lead) throw new Error('Lead nao encontrado.');
    return lead;
  },

  async getMessages(userId: string, leadId: string, params: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;
    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
    if (!lead) throw new Error('Lead nao encontrado.');

    const [messages, total] = await Promise.all([
      prisma.message.findMany({ where: { leadId }, orderBy: { createdAt: 'asc' }, skip, take: limit }),
      prisma.message.count({ where: { leadId } }),
    ]);

    return { messages, total, page, limit };
  },

  async updateStage(userId: string, leadId: string, stage: LeadStage) {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
    if (!lead) throw new Error('Lead nao encontrado.');
    return prisma.lead.update({ where: { id: leadId }, data: { stage } });
  },

  async toggleAi(userId: string, leadId: string) {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
    if (!lead) throw new Error('Lead nao encontrado.');
    return prisma.lead.update({ where: { id: leadId }, data: { aiEnabled: !lead.aiEnabled } });
  },

  async create(userId: string, data: { name: string; phone: string; email?: string; origin?: string; stage?: LeadStage }) {
    const existing = await prisma.lead.findFirst({ where: { userId, phone: data.phone } });
    if (existing) throw new Error('Lead com esse telefone ja existe para esse corretor.');

    return prisma.lead.create({
      data: {
        userId, name: data.name, phone: data.phone, email: data.email,
        origin: (data.origin as any) || 'WHATSAPP', stage: data.stage || 'QUALIFICACAO',
      },
    });
  },

  async update(userId: string, leadId: string, data: { name?: string; phone?: string; email?: string; origin?: string; aiEnabled?: boolean }) {
    const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } });
    if (!lead) throw new Error('Lead nao encontrado.');
    return prisma.lead.update({
      where: { id: leadId },
      data: { ...data, origin: data.origin ? (data.origin as any) : undefined },
    });
  },

  async findOrCreateByPhone(userId: string, phone: string, name?: string) {
    let lead = await prisma.lead.findFirst({ where: { userId, phone } });
    if (!lead) {
      lead = await prisma.lead.create({
        data: { userId, phone, name: name || phone, origin: 'WHATSAPP', stage: 'QUALIFICACAO' },
      });
    }
    return lead;
  },
};
