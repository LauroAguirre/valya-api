import prisma from '@/config/database'
import { LeadOrigin, LeadStage } from '@prisma/client'

export const findOrCreateByPhone = async (
  clientId: string,
  phone: string,
  name?: string
) => {
  let lead = await prisma.lead.findFirst({ where: { clientId, phone } })
  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        clientId,
        phone,
        name: name || phone,
        origin: LeadOrigin.WHATSAPP,
        stage: LeadStage.QUALIFICATION
      }
    })
  }
  return lead
}
