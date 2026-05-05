import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { deleteUnit } from '@/services/property/deleteUnit'

export const deletePropertyUnitController = async (
  req: Request,
  res: Response
) => {
  try {
    const { propertyId, unitId } = req.params
    successResponse(res, await deleteUnit(req.user!.id, propertyId, unitId))
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao deletar unidade.'
    )
  }
}
