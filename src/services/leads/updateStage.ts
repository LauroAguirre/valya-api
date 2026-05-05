import prisma from '@/config/database'
import { LeadStage } from '@prisma/client'
import { createStageHistory } from './createStageHistory'

export const updateStage = async (
  userId: string,
  leadId: string,
  stage: LeadStage
) => {
  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId } })
  if (!lead) throw new Error('Lead nao encontrado.')

  if (lead.stage === stage) return lead

  const updated = await prisma.lead.update({ where: { id: leadId }, data: { stage } })
  await createStageHistory({ leadId, fromStage: lead.stage, toStage: stage, userId })

  return updated
}
