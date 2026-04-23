import prisma from '@/config/database'
import { LeadStage } from '@prisma/client'

export const updateStage = async (
  clientId: string,
  leadId: string,
  stage: LeadStage
) => {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, clientId } })
  if (!lead) throw new Error('Lead nao encontrado.')
  return prisma.lead.update({ where: { id: leadId }, data: { stage } })
}
