import { login } from '@/services/user/login'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'
import requestIp from 'request-ip'

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const ip = requestIp.getClientIp(req) || '-'

    const result = await login(email, password, ip)
    return successResponse(res, result)
  } catch (error) {
    console.error(error)
    const message =
      error instanceof Error ? error.message : 'Erro ao autenticar.'
    return errorResponse(res, message, 401)
    // return errorResponse(res, message, error.statusCode || 400)
  }
}
