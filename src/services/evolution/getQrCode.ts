import { v4 as uuidv4 } from 'uuid'
import prisma from '@/config/database'
import { evolutionApi } from '@/providers/evolutionApi'
import { env } from '@/config/env'

interface CreateInstanceResponse {
  instance: {
    instanceName: string
    instanceId: string
    status: string
  }
  qrcode?: {
    base64: string
    code: string
  }
}

interface ConnectInstanceResponse {
  base64?: string
  code?: string
}

export const getQrCode = async (userId: string) => {
  const config = await prisma.evolutionConfig.findUnique({
    where: { userId }
  })

  // No instance — create it and provision the webhook in one shot
  if (!config) {
    const instanceName = `valya-${uuidv4()}`

    const { data } = await evolutionApi.post<CreateInstanceResponse>(
      '/instance/create',
      {
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        webhook: {
          url: `${env.WEBHOOK_URL}/api/webhooks/evolution`,
          byEvents: true,
          base64: true,
          events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE']
        }
      }
    )

    await prisma.evolutionConfig.create({
      data: {
        userId,
        instanceName,
        instanceId: data.instance.instanceId,
        connected: false
      }
    })

    return {
      qrCode: data.qrcode?.base64 ?? null,
      connected: false,
      instanceName
    }
  }

  // Already connected — no need to hit the Evolution connect endpoint
  if (config.connected) {
    return {
      qrCode: null,
      connected: true,
      instanceName: config.instanceName
    }
  }

  // Instance exists but disconnected — fetch a fresh QR code (never persist it)
  const { data } = await evolutionApi.get<ConnectInstanceResponse>(
    `/instance/connect/${config.instanceName}`
  )

  return {
    qrCode: data.base64 ?? null,
    connected: false,
    instanceName: config.instanceName
  }
}
