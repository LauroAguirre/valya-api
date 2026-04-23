import prisma from '@/config/database'

export const getLeadById = async (clientId: string, leadId: string) => {
  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, clientId },
      include: {
        leadProperties: {
          include: { property: { select: { id: true, name: true } } }
        }
      }
    })
    if (!lead) throw new Error('Lead nao encontrado.')
    return lead
  } catch (error: any) {
    throw new Error(error)
  }
}
