import prisma from '@/config/database'
import { evolutionApi } from '@/providers/evolutionApi'

export const evolutionDisconnect = async (clientId: string) => {
  const config = await prisma.evolutionConfig.findUnique({
    where: { clientId }
  })
  if (!config) throw new Error('Instancia nao configurada.')

  await evolutionApi.delete(`/instance/logout/${config.instanceName}`)

  await prisma.evolutionConfig.update({
    where: { clientId },
    data: { connected: false, qrCode: null }
  })

  return { disconnected: true }
}
