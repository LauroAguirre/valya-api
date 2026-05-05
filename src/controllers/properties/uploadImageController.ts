import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { savePropertyImage } from '@/services/property/savePropertyImage'

export const uploadImageController = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      errorResponse(res, 'Nenhuma imagem enviada.')
      return
    }
    const images = files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      description: req.body.descriptions?.[index] || undefined
    }))
    successResponse(
      res,
      await savePropertyImage(req.user!.id, req.params.id, images),
      201
    )
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao adicionar imagens.'
    )
  }
}
