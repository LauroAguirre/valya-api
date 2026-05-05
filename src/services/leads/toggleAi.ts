import prisma from '@/config/database'

export const toggleAi = async (userId: string, leadId: string) => {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } })
  if (!lead) throw new Error('Lead nao encontrado.')
  return prisma.lead.update({
    where: { id: leadId },
    data: { aiEnabled: !lead.aiEnabled }
  })
}
