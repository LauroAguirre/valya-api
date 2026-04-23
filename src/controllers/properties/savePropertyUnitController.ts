import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { savePropertyUnit } from '@/services/property/savePropertyUnit'

export const savePropertyUnitController = async (
  req: Request,
  res: Response
) => {
  const { propertyId } = req.params
  try {
    return successResponse(
      res,
      await savePropertyUnit(req.user!.userId, propertyId, req.body),
      201
    )
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao salvar unidade.'
    )
  }
}
