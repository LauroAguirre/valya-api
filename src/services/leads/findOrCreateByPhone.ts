import prisma from '@/config/database'
import { LeadOrigin, LeadStage } from '@prisma/client'
import { createStageHistory } from './createStageHistory'

export const findOrCreateByPhone = async (
  userId: string,
  phone: string,
  name?: string
) => {
  const existing = await prisma.lead.findUnique({
    where: { userId_phone: { userId, phone } }
  })
  if (existing) return existing

  const lead = await prisma.lead.create({
    data: {
      userId,
      phone,
      name: name || phone,
      origin: LeadOrigin.WHATSAPP,
      stage: LeadStage.QUALIFICATION
    }
  })

  await createStageHistory({
    leadId: lead.id,
    fromStage: null,
    toStage: lead.stage
  })

  return lead
}
