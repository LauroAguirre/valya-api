import prisma from '@/config/database'

export const handleConnectionUpdate = async (
  instanceName: string,
  state: string
) => {
  const config = await prisma.evolutionConfig.findUnique({
    where: { instanceName }
  })

  if (!config) return

  const connected = state === 'open'
  await prisma.evolutionConfig.update({
    where: { instanceName },
    data: { connected }
  })
  return { instanceName, connected }
}
