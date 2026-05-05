import prisma from '@/config/database'
import { evolutionApi } from '@/providers/evolutionApi'

export const createInstance = async (userId: string) => {
  const agent = await prisma.realStateAgent.findFirst({ where: { userId } })

  if (!agent?.whatsApp) {
    throw new Error('WhatsApp não configurado no perfil do corretor.')
  }

  const instanceName = agent.whatsApp

  const { data: createData } = await evolutionApi.post('/instance/create', {
    instanceName,
    integration: 'WHATSAPP-BAILEYS',
    token: `tk-${userId}`,
    webhook: {
      enabled: true,
      url: process.env.API_URL + '/api/webhooks/evolution',
      webhook_by_events: true,
      events: [
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_EDITED',
        'MESSAGES_UPDATE',
        'MESSAGES_DELETE',
        'SEND_MESSAGE',
        'SEND_MESSAGE_UPDATE',
        'CONTACTS_UPSERT',
        'CONTACTS_UPDATE',
        'CONNECTION_UPDATE',
        'LOGOUT_INSTANCE',
        'LABELS_EDIT',
        'LABELS_ASSOCIATION'
      ]
    }
  })

  const config = await prisma.evolutionConfig.create({
    data: {
      userId,
      instanceName,
      instanceId: createData.instance?.instanceId ?? null,
      connected: false
    }
  })

  await new Promise(resolve => setTimeout(resolve, 3000))

  const { data: qrData } = await evolutionApi.get(
    `/instance/connect/${instanceName}`
  )

  return { config, qrCode: (qrData?.base64 as string) ?? null }
}
