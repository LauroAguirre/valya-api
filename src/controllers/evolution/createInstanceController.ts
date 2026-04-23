import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { createInstance } from '@/services/evolution/createInstance'

export const createInstanceController = async (req: Request, res: Response) => {
  const { clientId, instanceName } = req.body
  const instance = await createInstance(clientId, instanceName)
  try {
    return successResponse(res, instance, 201)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao criar instancia.'
    )
  }
}
