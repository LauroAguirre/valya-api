import prisma from '@/config/database'
import { LeadStage } from '@prisma/client'
import { endOfMonth, startOfMonth } from 'date-fns'

export const getClientDashboard = async (clientId: string) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const activeLeads = await prisma.lead.count({
    where: {
      clientId,
      stage: { notIn: [LeadStage.WIN, LeadStage.LOSS] },
      lastReplyAt: { gte: sevenDaysAgo }
    }
  })

  const followUpLeads = await prisma.lead.count({
    where: { clientId, stage: LeadStage.CADENCE }
  })

  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(new Date()) // new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = endOfMonth(new Date()) // new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [newLeads, closedDeals] = await Promise.all([
      prisma.lead.count({
        where: { clientId, createdAt: { gte: monthStart, lte: monthEnd } }
      }),
      prisma.lead.count({
        where: {
          clientId,
          stage: LeadStage.WIN,
          updatedAt: { gte: monthStart, lte: monthEnd }
        }
      })
    ])

    monthlyData.push({
      month: monthStart.toLocaleString('pt-BR', {
        month: 'short',
        year: '2-digit'
      }),
      newLeads,
      closedDeals
    })
  }

  return { activeLeads, followUpLeads, monthlyData }
}
