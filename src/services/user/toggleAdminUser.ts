import prisma from '@/config/database'
import { UserRole } from '@prisma/client'

export const toggleAdminUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: UserRole.ADMIN }
  })
  if (!user) throw new Error('Usuario admin nao encontrado.')

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true }
  })
}
