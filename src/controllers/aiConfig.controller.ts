import { Request, Response } from 'express';
import { aiConfigService } from '../services/aiConfig.service.js';
import { successResponse, errorResponse } from '../utils/helpers.js';

export const aiConfigController = {
  async get(req: Request, res: Response) {
    try { successResponse(res, await aiConfigService.get(req.user!.userId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao buscar config IA.'); }
  },

  async update(req: Request, res: Response) {
    try {
      const { customPrompt, isActive } = req.body;
      successResponse(res, await aiConfigService.update(req.user!.userId, { customPrompt, isActive }));
    } catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar config IA.'); }
  },
};
