import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { deletePropertyimage } from '@/services/property/deletePropertyimage'

export const deleteImageController = async (req: Request, res: Response) => {
  try {
    successResponse(
      res,
      await deletePropertyimage(req.user!.id, req.params.imageId)
    )
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao atualizar imagem.'
    )
  }
}
