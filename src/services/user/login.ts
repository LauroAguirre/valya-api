import bcrypt from 'bcryptjs'
import prisma from '@/config/database'
import { generateToken } from '@/utils/helpers'
import { isAfter, isBefore } from 'date-fns'
import { generateRefreshToken } from '../refreshToken/generateRefreshToken'

export const login = async (email: string, password: string, ip: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        provider: true,
        realStateAgent: {
          include: {
            subscriptions: {
              include: {
                plan: {
                  include: {
                    features: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) throw new Error('Usuário e/ou senha inválidos!')

    if (!user.isActive)
      throw new Error('Conta desativada. Entre em contato com o suporte.')

    // if (user.provider !== 'LOCAL' || !user.password) {
    //   throw new Error(
    //     `Esta conta utiliza login via ${user.provider}. Use a opcao correspondente.`
    //   )
    // }

    const isValid = await bcrypt.compare(password, user.password as string)
    if (!isValid) throw new Error('Usuário e/ou senha inválidos!')

    const currentPlan = user.realStateAgent?.subscriptions.find(sub => {
      return (
        !sub.expiresAt ||
        (isAfter(new Date(), sub.expiresAt) &&
          isBefore(new Date(), sub.startDate))
      )
    })

    const expirationDate = user.realStateAgent
      ? user.realStateAgent?.subscriptions.sort((a, b) => {
          if (!a.expiresAt) return -1
          if (!b.expiresAt) return 1

          if (isBefore(a.expiresAt, b.expiresAt)) return -1
          return 1
        })[0].expiresAt
      : null

    const token = generateToken({
      userId: user.id,
      role: user.role
    })

    await generateRefreshToken(user.id, token, ip)

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      plan: currentPlan,
      planExpirationDate: expirationDate,
      token
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error(String(error))
  }
}
