import { LeadOrigin, LeadStage } from '@prisma/client'
import prisma from '@/config/database'
import { normalizeJid } from '@/utils/helpers'
import { findConfigByInstanceName } from './evolutionService'
import { createStageHistory } from '../leads/createStageHistory'

interface EvolutionContact {
  id: string
  pushName?: string
  imgUrl?: string
}

export async function syncContact(
  instanceName: string,
  contacts: EvolutionContact[]
) {
  const config = await findConfigByInstanceName(instanceName)
  if (!config) return

  const { userId } = config

  for (const contact of contacts) {
    if (!contact.id?.includes('@s.whatsapp.net')) continue

    const phone = normalizeJid(contact.id)
    if (!phone) continue

    const existing = await prisma.lead.findUnique({
      where: { userId_phone: { userId, phone } }
    })

    if (existing) {
      const updates: { name?: string; avatarUrl?: string } = {}
      if (contact.pushName && contact.pushName !== existing.name) {
        updates.name = contact.pushName
      }
      if (contact.imgUrl !== undefined) {
        updates.avatarUrl = contact.imgUrl || undefined
      }
      if (Object.keys(updates).length > 0) {
        await prisma.lead.update({ where: { id: existing.id }, data: updates })
      }
    } else {
      const newLead = await prisma.lead.create({
        data: {
          userId,
          phone,
          name: contact.pushName || phone,
          avatarUrl: contact.imgUrl || null,
          origin: LeadOrigin.WHATSAPP,
          stage: LeadStage.QUALIFICATION
        }
      })
      await createStageHistory({
        leadId: newLead.id,
        fromStage: null,
        toStage: newLead.stage
      })
    }
  }
}
