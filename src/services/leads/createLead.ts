import prisma from '@/config/database'
import { Lead, LeadOrigin, LeadStage } from '@prisma/client'

export const saveLead = async (clientId: string, data: Lead) => {
  const existing = await prisma.lead.findFirst({
    where: { clientId, phone: data.phone }
  })
  if (existing)
    throw new Error('Lead com esse telefone ja existe para esse corretor.')

  return prisma.lead.upsert({
    where: {
      id: data.id || ''
    },
    create: {
      clientId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      origin: data.origin || LeadOrigin.OUTRO,
      stage: data.stage || LeadStage.QUALIFICATION
    },
    update: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      stage: data.stage || LeadStage.QUALIFICATION
    }
  })
}
