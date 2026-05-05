import prisma from '@/config/database'
import { PaymentStatus, UserRole } from '@prisma/client'
import { endOfMonth, startOfMonth } from 'date-fns'

// export const getAdminDashboard = async (userId:string) =>{
export const getAdminDashboard = async () => {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)

  const [activeClients, expiredClients, trialClients] = await Promise.all([
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({
      where: { status: 'EXPIRED', expiresAt: { gte: threeMonthsAgo } }
    }),
    prisma.subscription.count({ where: { status: 'TRIAL' } })
  ])

  const revenueData = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(new Date()) //new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = endOfMonth(new Date()) //new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const payments = await prisma.payment.aggregate({
      where: {
        status: PaymentStatus.CONFIRMED,
        paidAt: { gte: monthStart, lte: monthEnd }
      },
      _sum: { amount: true }
    })

    revenueData.push({
      month: monthStart.toLocaleString('pt-BR', {
        month: 'short',
        year: '2-digit'
      }),
      revenue: payments._sum.amount || 0
    })
  }

  const newUsersData = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - i + 1,
      0,
      23,
      59,
      59
    )

    const count = await prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        createdAt: { gte: monthStart, lte: monthEnd }
      }
    })

    newUsersData.push({
      month: monthStart.toLocaleString('pt-BR', {
        month: 'short',
        year: '2-digit'
      }),
      newUsers: count
    })
  }

  return {
    activeClients,
    expiredClients,
    trialClients,
    revenueData,
    newUsersData
  }
}
