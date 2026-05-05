import prisma from '@/config/database'

export const loadCompanyAgents = async (companyId: string, page: number) => {
  const limit = 30
  const skip = (page - 1) * limit

  const [links, total] = await Promise.all([
    prisma.constructionCompanyUsers.findMany({
      where: { companyId, active: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            realStateAgent: {
              select: {
                creci: true,
                city: true,
                uf: true
              }
            }
          }
        }
      },
      skip,
      take: limit
    }),
    prisma.constructionCompanyUsers.count({ where: { companyId, active: true } })
  ])

  return {
    agents: links.map(l => l.user),
    total,
    page,
    limit
  }
}
