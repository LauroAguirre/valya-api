import prisma from '@/config/database'
import { UserRole } from '@prisma/client'

export const toggleAdminUser = async (clientId: string) => {
  const user = await prisma.client.findUnique({
    where: { id: clientId, role: UserRole.ADMIN }
  })
  if (!user) throw new Error('Usuario admin nao encontrado.')

  return prisma.client.update({
    where: { id: clientId },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true }
  })
}
