import { Request, Response } from 'express';
import { leadService } from '../services/lead.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js';

export const leadController = {
  async listByStage(req: Request, res: Response) {
    try {
      const result = await leadService.listByStage(req.user!.userId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar leads.';
      errorResponse(res, message, 500);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const result = await leadService.getById(req.user!.userId, req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar lead.';
      errorResponse(res, message);
    }
  },

  async getMessages(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const result = await leadService.getMessages(req.user!.userId, req.params.id, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });
      paginatedResponse(res, result.messages, result.total, result.page, result.limit);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar mensagens.';
      errorResponse(res, message, 500);
    }
  },

  async updateStage(req: Request, res: Response) {
    try {
      const { stage } = req.body;
      const result = await leadService.updateStage(req.user!.userId, req.params.id, stage);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar estagio.';
      errorResponse(res, message);
    }
  },

  async toggleAi(req: Request, res: Response) {
    try {
      const result = await leadService.toggleAi(req.user!.userId, req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao alterar status IA.';
      errorResponse(res, message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const result = await leadService.create(req.user!.userId, req.body);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar lead.';
      errorResponse(res, message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const result = await leadService.update(req.user!.userId, req.params.id, req.body);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar lead.';
      errorResponse(res, message);
    }
  },
};
