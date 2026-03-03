import prisma from '../config/database.js';

export const backofficeService = {
  async listClients(params: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where = {
      role: 'CLIENT' as const,
      ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }, { phone: { contains: search } }] } : {}),
    };

    const [clients, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
          subscription: { select: { status: true, expiresAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return { clients, total, page, limit };
  },

  async getClientDetail(clientId: string) {
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' },
      select: {
        id: true, name: true, email: true, phone: true, personalPhone: true,
        address: true, avatarUrl: true, isActive: true, createdAt: true,
        subscription: { include: { payments: { orderBy: { createdAt: 'desc' } } } },
      },
    });
    if (!client) throw new Error('Cliente nao encontrado.');
    return client;
  },

  async listAdminUsers() {
    return prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAdminUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, role: 'ADMIN' },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
    });
    if (!user) throw new Error('Usuario admin nao encontrado.');
    return user;
  },

  async toggleAdminUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId, role: 'ADMIN' } });
    if (!user) throw new Error('Usuario admin nao encontrado.');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  },
};
