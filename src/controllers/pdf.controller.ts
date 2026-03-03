import { Request, Response } from 'express';
import { pdfService } from '../services/pdf.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const pdfController = {
  async extractPriceTable(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) { errorResponse(res, 'Arquivo PDF obrigatorio.'); return; }
      const { propertyId } = req.body;
      if (!propertyId) { errorResponse(res, 'ID do empreendimento obrigatorio.'); return; }

      successResponse(res, await pdfService.extractAndUpdate({ filePath: file.path, userId: req.user!.userId, propertyId }));
    } catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao processar PDF.'); }
  },
};
