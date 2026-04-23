import prisma from '@/config/database'
import { env } from '@/config/env'
import { evolutionApi } from '@/providers/evolutionApi'

export const createInstance = async (
  clientId: string,
  instanceName: string
) => {
  const instance = await evolutionApi.post('/instance/create', {
    instanceName,
    integration: 'WHATSAPP-BAILEYS',
    qrcode: true,
    webhook: {
      url: `${env.FRONTEND_URL.replace('3000', String(env.PORT))}/api/webhooks/evolution`,
      events: ['messages.upsert', 'connection.update'],
      byEvents: false
    }
  })

  if (instance.status !== 200) {
    const error = await instance.request.catch(() => ({}))
    throw new Error(`Erro ao criar instancia: ${JSON.stringify(error)}`)
  }

  const data = instance.data

  await prisma.evolutionConfig.upsert({
    where: { clientId },
    create: {
      clientId,
      instanceName,
      instanceId: data.instance?.instanceId || data.hash?.id,
      qrCode: data.qrcode?.base64
    },
    update: {
      instanceName,
      instanceId: data.instance?.instanceId || data.hash?.id,
      qrCode: data.qrcode?.base64
    }
  })

  return {
    instanceName,
    qrCode: data.qrcode?.base64,
    status: data.instance?.status
  }
}
