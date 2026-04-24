import prisma from '@/config/database'

export const listProperties = async (
  userId: string,
  params: { page?: number; limit?: number; search?: string }
) => {
  const { page = 1, limit = 20, search } = params
  const skip = (page - 1) * limit
  const where = {
    userId,
    deletedAt: null,
    ...(search
      ? {
          OR: [{ name: { contains: search } }, { address: { contains: search } }]
        }
      : {})
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        units: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.property.count({ where })
  ])

  return { properties, total, page, limit }
}
