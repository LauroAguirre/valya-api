import prisma from '@/config/database'
import { UserRole } from '@prisma/client'

export const getAdminUser = async (userId: string) => {
  const user = await prisma.client.findUnique({
    where: { id: userId, role: UserRole.ADMIN },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      createdAt: true
    }
  })
  if (!user) throw new Error('Usuario admin nao encontrado.')
  return user
}
