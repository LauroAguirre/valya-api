import prisma from '../config/database.js';

export const dashboardService = {
  /**
   * Dashboard do CLIENTE (corretor)
   */
  async getClientDashboard(userId: string) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Leads em negociacao ativa (responderam nos ultimos 7 dias)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeLeads = await prisma.lead.count({
      where: {
        userId,
        stage: { notIn: ['GANHO', 'PERDA'] },
        lastReplyAt: { gte: sevenDaysAgo },
      },
    });

    // Leads em cadencia/follow-up (pararam de responder, nao responderam nos ultimos 7 dias)
    const followUpLeads = await prisma.lead.count({
      where: {
        userId,
        stage: 'CADENCIA',
      },
    });

    // Dados mensais para grafico (novos leads e negocios fechados por mes)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [newLeads, closedDeals] = await Promise.all([
        prisma.lead.count({
          where: {
            userId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
        prisma.lead.count({
          where: {
            userId,
            stage: 'GANHO',
            updatedAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ]);

      monthlyData.push({
        month: monthStart.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        newLeads,
        closedDeals,
      });
    }

    return {
      activeLeads,
      followUpLeads,
      monthlyData,
    };
  },

  /**
   * Dashboard do BACKOFFICE (admin)
   */
  async getAdminDashboard() {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

    // KPIs
    const [activeClients, expiredClients, trialClients] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({
        where: {
          status: 'EXPIRED',
          expiresAt: { gte: threeMonthsAgo },
        },
      }),
      prisma.subscription.count({ where: { status: 'TRIAL' } }),
    ]);

    // Faturamento ultimos 6 meses (grafico de linhas)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const payments = await prisma.payment.aggregate({
        where: {
          status: 'CONFIRMED',
          paidAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      revenueData.push({
        month: monthStart.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        revenue: payments._sum.amount || 0,
      });
    }

    // Novos usuarios por mes (grafico de colunas)
    const newUsersData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const count = await prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
      });

      newUsersData.push({
        month: monthStart.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        newUsers: count,
      });
    }

    return {
      activeClients,
      expiredClients,
      trialClients,
      revenueData,
      newUsersData,
    };
  },
};
