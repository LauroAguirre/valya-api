import { Request, Response } from 'express'
import { saveProperty } from '@/services/property/saveProperty'
import { errorResponse, successResponse } from '@/utils/helpers'

export const savePropertyController = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (req.user!.id !== userId) {
    errorResponse(res, 'Acesso nao autorizado.', 403)
    return
  }

  try {
    successResponse(res, await saveProperty(userId, req.body), 201)
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao salvar imovel.'
    )
  }
}
