import { Request, Response } from 'express'
import prisma from '@/config/database'
import { normalizeJid } from '@/utils/helpers'
import { findConfigByInstanceName } from '@/services/evolution/evolutionService'

function parseTags(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const evolutionLabelsAssociationWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const instanceName = body.instance || body.instanceName
    const data = body.data

    if (!instanceName || !data) return

    const jid: string = data.contact?.id
    const labelName: string = data.label?.name
    const action: string = data.type // "add" | "remove"

    if (!jid?.includes('@s.whatsapp.net') || !labelName || !action) return

    const config = await findConfigByInstanceName(instanceName)
    if (!config) return

    const phone = normalizeJid(jid)
    const lead = await prisma.lead.findUnique({
      where: { userId_phone: { userId: config.userId, phone } },
      select: { id: true, tags: true }
    })
    if (!lead) return

    const tags = parseTags(lead.tags)
    let updated: string[]

    if (action === 'add') {
      updated = tags.includes(labelName) ? tags : [...tags, labelName]
    } else {
      updated = tags.filter(t => t !== labelName)
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: { tags: JSON.stringify(updated) }
    })
  } catch (error) {
    console.error('[Webhook Evolution Labels Association] Erro:', error)
  }
}

export const evolutionLabelsEditWebhook = async (
  req: Request,
  res: Response
) => {
  res.status(200).json({ received: true })

  try {
    const body = req.body
    const instanceName = body.instance || body.instanceName
    const data = body.data

    if (!instanceName || !data) return

    const { type, name: newName } = data as {
      type: string
      name: string
      id: string
    }

    // "delete" type: remove this label from all leads in the instance
    if (type === 'delete' && newName) {
      const config = await findConfigByInstanceName(instanceName)
      if (!config) return

      const affected = await prisma.lead.findMany({
        where: { userId: config.userId, tags: { contains: newName } },
        select: { id: true, tags: true }
      })

      await Promise.all(
        affected.map(lead => {
          const updated = parseTags(lead.tags).filter(t => t !== newName)
          return prisma.lead.update({
            where: { id: lead.id },
            data: { tags: JSON.stringify(updated) }
          })
        })
      )
    }
  } catch (error) {
    console.error('[Webhook Evolution Labels Edit] Erro:', error)
  }
}
