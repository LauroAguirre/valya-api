import { agentRegister } from '@/services/user/agentRegister'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const agentRegisterController = async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    const result = await agentRegister(req.body)
    console.log({ result })
    return successResponse(res, result, 201)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao registrar.'
    return errorResponse(res, message)
  }
}
