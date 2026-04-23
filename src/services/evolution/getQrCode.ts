import prisma from '@/config/database'

import { evolutionApi } from '@/providers/evolutionApi'

export const getQrCode = async (clientId: string) => {
  const config = await prisma.evolutionConfig.findUnique({
    where: { clientId }
  })
  if (!config) throw new Error('Instancia nao configurada.')

  const evoConnect = await evolutionApi.get(
    `/instance/connect/${config.instanceName}`
  )

  if (evoConnect.status !== 200) throw new Error('Erro ao obter QR Code.')

  const data = await evoConnect.data
  if (data.base64) {
    await prisma.evolutionConfig.update({
      where: { clientId },
      data: { qrCode: data.base64 }
    })
  }

  return {
    qrCode: data.base64 || config.qrCode,
    connected: config.connected,
    instanceName: config.instanceName
  }
}
