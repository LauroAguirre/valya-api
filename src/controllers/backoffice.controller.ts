import { Request, Response } from 'express';
import { backofficeService } from '../services/backoffice.service.js';
import { dashboardService } from '../services/dashboard.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js';

export const backofficeController = {
  async getDashboard(_req: Request, res: Response) {
    try {
      const result = await dashboardService.getAdminDashboard();
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar dashboard.';
      errorResponse(res, message, 500);
    }
  },

  async listClients(req: Request, res: Response) {
    try {
      const { search, page, limit } = req.query;
      const result = await backofficeService.listClients({
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });
      paginatedResponse(res, result.clients, result.total, result.page, result.limit);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar clientes.';
      errorResponse(res, message, 500);
    }
  },

  async getClientDetail(req: Request, res: Response) {
    try {
      const result = await backofficeService.getClientDetail(req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar cliente.';
      errorResponse(res, message);
    }
  },

  async listAdminUsers(_req: Request, res: Response) {
    try {
      const result = await backofficeService.listAdminUsers();
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar usuarios.';
      errorResponse(res, message, 500);
    }
  },

  async getAdminUser(req: Request, res: Response) {
    try {
      const result = await backofficeService.getAdminUser(req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuario.';
      errorResponse(res, message);
    }
  },

  async toggleAdminUser(req: Request, res: Response) {
    try {
      const result = await backofficeService.toggleAdminUser(req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuario.';
      errorResponse(res, message);
    }
  },
};
