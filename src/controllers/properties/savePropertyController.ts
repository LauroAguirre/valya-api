import { Request, Response } from 'express'
import { saveProperty } from '@/services/property/saveProperty'
import { errorResponse, successResponse } from '@/utils/helpers'

export const savePropertyController = async (req: Request, res: Response) => {
  const { clientId } = req.params

  try {
    successResponse(res, await saveProperty(clientId, req.body), 201)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao criar imovel.'
    )
  }
}
