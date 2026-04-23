import { Request, Response } from 'express'
import { extractAndUpdate } from '@/services/pricingTables/extractAndUpdate.js'
import { errorResponse, successResponse } from '@/utils/helpers'

export const extractPriceTableController = async (
  req: Request,
  res: Response
) => {
  try {
    const file = req.file
    if (!file) {
      errorResponse(res, 'Arquivo PDF obrigatorio.')
      return
    }
    const { propertyId } = req.body
    if (!propertyId) {
      errorResponse(res, 'ID do empreendimento obrigatorio.')
      return
    }

    successResponse(
      res,
      await extractAndUpdate({
        filePath: file.path,
        clientId: req.user!.userId,
        propertyId
      })
    )
  } catch (error: unknown) {
    errorResponse(
      res,
      error instanceof Error ? error.message : 'Erro ao processar PDF.'
    )
  }
}
