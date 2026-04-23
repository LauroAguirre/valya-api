import prisma from '../config/database.js'

export const profileService = {
  async getProfile(clientId: string) {
    const user = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        personalPhone: true,
        address: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        subscription: {
          select: { id: true, status: true, startDate: true, expiresAt: true }
        }
      }
    })
    if (!user) throw new Error('Usuario nao encontrado.')
    return user
  },

  async updateProfile(
    userId: string,
    data: {
      name?: string
      phone?: string
      personalPhone?: string
      address?: string
    }
  ) {
    return prisma.client.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        personalPhone: true,
        address: true,
        avatarUrl: true
      }
    })
  },

  async getSubscriptionStatus(clientId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { clientId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 10 } }
    })
    if (!subscription) throw new Error('Assinatura nao encontrada.')

    const now = new Date()
    const daysUntilExpiry = Math.ceil(
      (subscription.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    const asaasCustomer = await prisma.asaasCustomer.findUnique({
      where: { clientId }
    })

    return {
      ...subscription,
      daysUntilExpiry,
      hasPaymentMethod: !!asaasCustomer,
      isExpired: subscription.expiresAt < now,
      needsRenewalWarning:
        daysUntilExpiry <= 10 && daysUntilExpiry > 0 && !asaasCustomer
    }
  }
}
