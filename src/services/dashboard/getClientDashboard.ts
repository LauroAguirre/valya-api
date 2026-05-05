import prisma from '@/config/database'
import { LeadStage } from '@prisma/client'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'

const ACTIVE_STAGES = Object.values(LeadStage).filter(
  s => s !== LeadStage.WIN && s !== LeadStage.LOSS
) as LeadStage[]

export const getClientDashboard = async (userId: string) => {
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const [
    newLeads,
    lastMonthNewLeads,
    followUpLeads,
    activeNegotiationsThisMonth,
    activeNegotiationsLastMonth
  ] = await Promise.all([
    prisma.lead.count({
      where: { userId, createdAt: { gte: thisMonthStart, lte: thisMonthEnd } }
    }),
    prisma.lead.count({
      where: { userId, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
    }),
    prisma.lead.count({
      where: { userId, stage: LeadStage.CADENCE }
    }),
    prisma.leadStageHistory.findMany({
      where: {
        lead: { userId },
        toStage: { in: ACTIVE_STAGES },
        changedAt: { gte: thisMonthStart, lte: thisMonthEnd }
      },
      distinct: ['leadId'],
      select: { leadId: true }
    }),
    prisma.leadStageHistory.findMany({
      where: {
        lead: { userId },
        toStage: { in: ACTIVE_STAGES },
        changedAt: { gte: lastMonthStart, lte: lastMonthEnd }
      },
      distinct: ['leadId'],
      select: { leadId: true }
    })
  ])

  return {
    kpis: [
      {
        label: 'Novos Leads',
        value: newLeads,
        change: newLeads - lastMonthNewLeads,
        changeLabel: 'vs mês anterior'
      },
      {
        label: 'Negociações Ativas',
        value: activeNegotiationsThisMonth.length,
        change:
          activeNegotiationsThisMonth.length -
          activeNegotiationsLastMonth.length,
        changeLabel: 'vs mês anterior'
      },
      {
        label: 'Cadência / Follow-up',
        value: followUpLeads,
        change: null,
        changeLabel: null
      }
    ]
  }
}
