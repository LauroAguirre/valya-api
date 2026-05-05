import prisma from '@/config/database'

export const verifyResetCode = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Codigo invalido.')

  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      code,
      used: false,
      expiresAt: { gte: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!resetRecord) throw new Error('Codigo invalido ou expirado.')
  return { valid: true }
}
