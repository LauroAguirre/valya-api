import { Request, Response } from 'express'
import { verifyResetCode } from '@/services/user/verifyResetCode'
import { errorResponse, successResponse } from '@/utils/helpers'

export const verifyResetCodeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, code } = req.body
    const result = await verifyResetCode(email, code)
    return successResponse(res, result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Codigo invalido.'
    return errorResponse(res, message)
  }
}
