import { oauthLogin } from '@/services/user/oauthLogin'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const oauthLoginController = async (req: Request, res: Response) => {
  try {
    const { provider, accessToken } = req.body
    const result = await oauthLogin(provider, accessToken)

    successResponse(res, result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao registrar.'
    errorResponse(res, message)
  }
}
