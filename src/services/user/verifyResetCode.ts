import prisma from '@/config/database'

export const verifyResetCode = async (email: string, code: string) => {
  try {
    const user = await prisma.client.findUnique({ where: { email } })
    if (!user) throw new Error('Codigo invalido.')

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        clientId: user.id,
        code,
        used: false,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!resetRecord) throw new Error('Codigo invalido ou expirado.')
    return { valid: true }
  } catch (error: any) {
    throw new Error(error)
  }
}
