import prisma from '@/config/database'

export const getLeadById = async (userId: string, leadId: string) => {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
    include: {
      properties: {
        include: {
          property: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })
  if (!lead) throw new Error('Lead nao encontrado.')
  return lead
}
