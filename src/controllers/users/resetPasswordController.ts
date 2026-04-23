import { Request, Response } from 'express'
import { resetPassword } from '@/services/user/resetPassword'
import { errorResponse, successResponse } from '@/utils/helpers'

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body
    const result = await resetPassword(email, code, password)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro ao redefinir senha.'
    return errorResponse(res, message)
  }
}
