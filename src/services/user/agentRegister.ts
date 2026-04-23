import prisma from '@/config/database'
import {
  AuthProvider,
  RealStateAgent,
  SubscriptionStatus,
  User,
  UserRole
} from '@prisma/client'
import bcrypt from 'bcryptjs'

import { SALT_ROUNDS, TRIAL_DAYS } from '@/utils/helpers'
import { addDays, endOfDay, startOfDay } from 'date-fns'

export const agentRegister = async (
  userData: User & { realStateAgent: RealStateAgent }
) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    })
    if (existing) {
      throw new Error('E-mail ja cadastrado.')
    }

    const hashedPassword = await bcrypt.hash(
      userData.password as string,
      SALT_ROUNDS
    )

    const plan = await prisma.plan.findFirst()

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: UserRole.CLIENT,
        provider: AuthProvider.LOCAL,
        realStateAgent: {
          create: {
            creci: userData.realStateAgent.creci,
            cnpj: userData.realStateAgent.cnpj,
            subscriptions: {
              create: {
                plan: {
                  connect: {
                    id: plan?.id
                  }
                },
                status: SubscriptionStatus.TRIAL,
                startDate: startOfDay(new Date()),
                expiresAt: endOfDay(addDays(new Date(), TRIAL_DAYS))
              }
            }
          }
        }
      }
    })

    return user
  } catch (error) {
    throw error
  }
}
