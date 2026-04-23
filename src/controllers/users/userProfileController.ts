import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { loadUser } from '@/services/user/loadUser'
import { isAfter, isBefore } from 'date-fns'
import { Subscription } from '@prisma/client'

export const userProfileController = async (req: Request, res: Response) => {
  try {
    const { user } = req

    console.log({ user })

    const userProfile = await loadUser(user.id)

    const currentPlan = user.realStateAgent?.subscriptions.find(
      (sub: Subscription) => {
        return (
          !sub.expiresAt ||
          (isAfter(new Date(), sub.expiresAt) &&
            isBefore(new Date(), sub.startDate))
        )
      }
    )

    const expirationDate = user.realStateAgent
      ? user.realStateAgent?.subscriptions.sort(
          (a: Subscription, b: Subscription) => {
            if (!a.expiresAt) return -1
            if (!b.expiresAt) return 1

            if (isBefore(a.expiresAt, b.expiresAt)) return -1
            return 1
          }
        )[0].expiresAt
      : null

    const profile = {
      user: userProfile,
      plan: currentPlan,
      planExpirationDate: expirationDate
    }

    console.log({ profile })

    return successResponse(res, profile)
  } catch (error) {
    // console.log('deu erro..')
    // return res.status(500).send(error)
    return errorResponse(
      res,
      error instanceof Error
        ? error.message
        : 'Erro ao carregar o perfil do usuário.'
    )
  }
}
