import { Request, Response } from 'express';
import { aiConfigService } from '../services/aiConfig.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const aiConfigController = {
  async get(req: Request, res: Response) {
    try {
      const result = await aiConfigService.get(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar config IA.';
      errorResponse(res, message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { customPrompt, isActive } = req.body;
      const result = await aiConfigService.update(req.user!.userId, { customPrompt, isActive });
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar config IA.';
      errorResponse(res, message);
    }
  },
};
