import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { createInstance } from '@/services/evolution/createInstance'

export const createInstanceController = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id

    const result = await createInstance(userId)

    successResponse(res, result, 201)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao criar instancia.'
    )
  }
}
