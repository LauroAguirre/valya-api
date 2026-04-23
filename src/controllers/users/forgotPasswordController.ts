import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { forgotPassword } from '@/services/user/forgotPassword'

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    const result = await forgotPassword(email)
    return successResponse(res, result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao registrar.'
    return errorResponse(res, message)
  }
}
