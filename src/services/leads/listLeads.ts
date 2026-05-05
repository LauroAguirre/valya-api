import prisma from '@/config/database'

export const listLeads = async (userId: string) => {
  const leads = await prisma.lead.findMany({
    where: {
      userId
    },
    include: {
      properties: {
        include: {
          property: true
        },
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  return leads
}
