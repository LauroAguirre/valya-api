import prisma from '@/config/database'

interface SearchAgentsParams {
  search?: string
  city?: string
  uf?: string
  page?: number
  limit?: number
}

export const searchAgents = async (params: SearchAgentsParams) => {
  const { search, city, uf, page = 1, limit = 20 } = params
  const skip = (page - 1) * limit

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { cpf: { contains: search } },
            { realStateAgent: { cnpj: { contains: search } } }
          ]
        }
      : {}),
    ...(city || uf
      ? {
          realStateAgent: {
            ...(city ? { city: { contains: city } } : {}),
            ...(uf ? { uf } : {})
          }
        }
      : {})
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        avatarUrl: true,
        realStateAgent: {
          select: {
            creci: true,
            city: true,
            uf: true,
            cnpj: true,
            whatsApp: true
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ])

  return { agents: users, total, page, limit }
}
