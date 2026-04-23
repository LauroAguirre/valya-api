import prisma from '@/config/database'
import { UserRole } from '@prisma/client'

export const listAdminUsers = async () => {
  return prisma.client.findMany({
    where: { role: UserRole.ADMIN },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
}
