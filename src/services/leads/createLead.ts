import prisma from '@/config/database'
import { Lead, LeadOrigin, LeadStage } from '@prisma/client'
import { createStageHistory } from './createStageHistory'

export const saveLead = async (userId: string, data: Lead) => {
  const existing = await prisma.lead.findFirst({
    where: { userId, phone: data.phone }
  })
  if (existing)
    throw new Error('Lead com esse telefone ja existe para esse corretor.')

  const current = data.id
    ? await prisma.lead.findUnique({ where: { id: data.id }, select: { stage: true } })
    : null

  const newStage = data.stage || LeadStage.QUALIFICATION

  const lead = await prisma.lead.upsert({
    where: { id: data.id || '' },
    create: {
      userId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      origin: data.origin || LeadOrigin.OTHER,
      stage: newStage
    },
    update: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      stage: newStage
    }
  })

  if (!current) {
    await createStageHistory({ leadId: lead.id, fromStage: null, toStage: newStage })
  } else if (current.stage !== newStage) {
    await createStageHistory({ leadId: lead.id, fromStage: current.stage, toStage: newStage })
  }

  return lead
}
