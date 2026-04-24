import prisma from '../config/database.js'
import { normalizePhone } from '../utils/helpers.js'
import { buildAndRespond } from './promptBuilder/buildAndRespond.js'
import { sendMessage } from './evolution/sendMessage.js'
import { findOrCreateByPhone } from './leads/findOrCreateByPhone.js'

export const attendanceService = {
  async processIncomingMessage(data: {
    instanceName: string
    remoteJid: string
    fromMe: boolean
    message: string
    pushName?: string
  }) {
    const { instanceName, remoteJid, fromMe, message, pushName } = data
    const leadPhone = normalizePhone(remoteJid.replace('@s.whatsapp.net', ''))

    const evolutionConfig = await prisma.evolutionConfig.findUnique({
      where: { instanceName },
      include: { user: { select: { id: true, name: true, phone: true } } }
    })

    if (!evolutionConfig || !evolutionConfig.user) {
      console.error(`[Attendance] Instancia nao encontrada: ${instanceName}`)
      return
    }

    const userId = evolutionConfig.user.id
    const lead = await findOrCreateByPhone(userId, leadPhone, pushName)
    const sender = fromMe ? 'BROKER' : 'LEAD'

    await prisma.message.create({
      data: { leadId: lead.id, sender, content: message }
    })

    if (sender === 'LEAD') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { lastReplyAt: new Date() }
      })
    }

    if (fromMe) return { processed: true, aiResponse: false }
    if (!lead.aiEnabled) {
      console.log(`[Attendance] IA desativada para lead ${lead.id}`)
      return { processed: true, aiResponse: false }
    }

    const aiConfig = await prisma.aiConfig.findUnique({
      where: { userId: userId }
    })
    if (!aiConfig?.isActive) {
      console.log(`[Attendance] IA global desativada para corretor ${userId}`)
      return { processed: true, aiResponse: false }
    }

    try {
      const { message } = await buildAndRespond(userId, lead.id)
      if (!message) {
        console.error(`[Attendance] Resposta vazia do prompt builder`)
        return { processed: true, aiResponse: false }
      }

      await prisma.message.create({
        data: { leadId: lead.id, sender: 'AI', content: message }
      })
      await sendMessage({ instanceName, to: leadPhone, message })

      console.log(
        `[Attendance] Resposta IA enviada para ${leadPhone} via ${instanceName}`
      )
      return { processed: true, aiResponse: true, message }
    } catch (error) {
      console.error(`[Attendance] Erro ao gerar resposta IA:`, error)
      return { processed: true, aiResponse: false, error: String(error) }
    }
  }
}
