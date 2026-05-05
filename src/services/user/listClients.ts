import prisma from '@/config/database'
import { UserRole } from '@prisma/client'

interface ListClientsProps {
  search?: string
  page?: number
  limit?: number
}

export const listClients = async (params: ListClientsProps) => {
  const { search, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where = {
    role: UserRole.CLIENT,
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } }
          ]
        }
      : {})
  }

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        realStateAgent: {
          include: {
            subscriptions: {
              orderBy: {
                expiresAt: 'desc'
              },
              select: {
                status: true,
                expiresAt: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ])

  return { clients, total, page, limit }
}
