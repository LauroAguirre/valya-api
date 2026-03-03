import { Request, Response } from 'express';
import { leadService } from '../services/lead.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js';

export const leadController = {
  async listByStage(req: Request, res: Response) {
    try { successResponse(res, await leadService.listByStage(req.user!.userId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao listar leads.', 500); }
  },

  async getById(req: Request, res: Response) {
    try { successResponse(res, await leadService.getById(req.user!.userId, req.params.id)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao buscar lead.'); }
  },

  async getMessages(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const result = await leadService.getMessages(req.user!.userId, req.params.id, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
      paginatedResponse(res, result.messages, result.total, result.page, result.limit);
    } catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao buscar mensagens.', 500); }
  },

  async updateStage(req: Request, res: Response) {
    try { successResponse(res, await leadService.updateStage(req.user!.userId, req.params.id, req.body.stage)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar estagio.'); }
  },

  async toggleAi(req: Request, res: Response) {
    try { successResponse(res, await leadService.toggleAi(req.user!.userId, req.params.id)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao alterar status IA.'); }
  },

  async create(req: Request, res: Response) {
    try { successResponse(res, await leadService.create(req.user!.userId, req.body), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao criar lead.'); }
  },

  async update(req: Request, res: Response) {
    try { successResponse(res, await leadService.update(req.user!.userId, req.params.id, req.body)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar lead.'); }
  },
};
