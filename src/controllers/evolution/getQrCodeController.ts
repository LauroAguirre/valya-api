import { Request, Response } from 'express'
import { errorResponse, successResponse } from '@/utils/helpers'
import { getQrCode } from '@/services/evolution/getQrCode'

export const getQrCodeController = async (req: Request, res: Response) => {
  const { userId } = req.query
  const qrCode = await getQrCode(userId as string)
  try {
    return successResponse(res, qrCode, 201)
  } catch (error: unknown) {
    return errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao obter QR Code.'
    )
  }
}
