import prisma from '@/config/database'

export const toggleAi = async (clientId: string, leadId: string) => {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, clientId } })
  if (!lead) throw new Error('Lead nao encontrado.')
  return prisma.lead.update({
    where: { id: leadId },
    data: { aiEnabled: !lead.aiEnabled }
  })
}
