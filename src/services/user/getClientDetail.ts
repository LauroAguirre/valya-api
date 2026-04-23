import prisma from '@/config/database'
import { UserRole } from '@prisma/client'

export const getClientDetail = async (userId: string) => {
  const client = await prisma.user.findUnique({
    where: { id: userId, role: UserRole.CLIENT },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true
      // subscription: {
      //   include: {
      //     payments: {
      //       orderBy: {
      //         createdAt: 'desc'
      //       }
      //     }
      //   }
      // }
    }
  })
  if (!client) throw new Error('Cliente nao encontrado.')
  return client
}
