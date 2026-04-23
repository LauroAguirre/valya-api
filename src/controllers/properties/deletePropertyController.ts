import { deleteProperty } from '@/services/property/deleteProperty'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const deletePropertyController = async (req: Request, res: Response) => {
  const { propertyId } = req.params

  try {
    successResponse(res, await deleteProperty(req.user!.userId, propertyId))
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao deletar imovel.'
    )
  }
}
