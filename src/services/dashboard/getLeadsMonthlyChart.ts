import prisma from '@/config/database'
import { LeadStage } from '@prisma/client'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'

export const getLeadsMonthlyChart = async (userId: string, months: number) => {
  const now = new Date()

  const data = await Promise.all(
    Array.from({ length: months }, (_, i) => {
      const ref = subMonths(now, months - 1 - i)
      const start = startOfMonth(ref)
      const end = endOfMonth(ref)

      return Promise.all([
        prisma.lead.count({
          where: { userId, createdAt: { gte: start, lte: end } }
        }),
        prisma.leadStageHistory.findMany({
          where: {
            lead: { userId },
            toStage: LeadStage.WIN,
            changedAt: { gte: start, lte: end }
          },
          distinct: ['leadId'],
          select: { leadId: true }
        }),
        ref
      ] as const)
    })
  )

  return data.map(([newLeads, closedDeals, ref]) => ({
    month: ref.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
    newLeads,
    closedDeals: closedDeals.length
  }))
}
