import { getPropertyById } from '@/services/property/getPropertyById'
import { errorResponse, successResponse } from '@/utils/helpers'
import { Request, Response } from 'express'

export const getPropertyByIdController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params
  try {
    successResponse(res, await getPropertyById(req.user!.userId, id))
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao buscar imovel.'
    )
  }
}
