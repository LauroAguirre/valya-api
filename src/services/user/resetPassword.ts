import prisma from '@/config/database'
import { generateToken, SALT_ROUNDS } from '@/utils/helpers'
import bcrypt from 'bcryptjs'

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
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

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    }),
    prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    })
  ])

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  }
}
