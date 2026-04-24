import prisma from '@/config/database'
import { generateCode } from '@/utils/helpers'
import { emailService } from '../email.service'

export const forgotPassword = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return {
        message:
          'Se o e-mail estiver cadastrado, voce recebera um codigo de verificacao.'
      }
    }

    const code = generateCode(6)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.passwordReset.create({
      data: { userId: user.id, code, expiresAt }
    })
    await emailService.sendPasswordResetCode(user.email, user.name, code)

    return {
      message:
        'Se o e-mail estiver cadastrado, voce recebera um codigo de verificacao.'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error)
  }
}
