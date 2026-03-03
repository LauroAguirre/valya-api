import { Request, Response } from 'express';
import { propertyService } from '../services/property.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/helpers.js';

export const propertyController = {
  async list(req: Request, res: Response) {
    try {
      const { page, limit, search } = req.query;
      const result = await propertyService.list(req.user!.userId, {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        search: search as string,
      });
      paginatedResponse(res, result.properties, result.total, result.page, result.limit);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao listar imoveis.';
      errorResponse(res, message, 500);
    }
  },

  async getById(req: Request, res: Response) {
    try { successResponse(res, await propertyService.getById(req.user!.userId, req.params.id)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao buscar imovel.'); }
  },

  async create(req: Request, res: Response) {
    try { successResponse(res, await propertyService.create(req.user!.userId, req.body), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao criar imovel.'); }
  },

  async update(req: Request, res: Response) {
    try { successResponse(res, await propertyService.update(req.user!.userId, req.params.id, req.body)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar imovel.'); }
  },

  async delete(req: Request, res: Response) {
    try { successResponse(res, await propertyService.delete(req.user!.userId, req.params.id)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao deletar imovel.'); }
  },

  async createUnit(req: Request, res: Response) {
    try { successResponse(res, await propertyService.createUnit(req.user!.userId, req.params.id, req.body), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao criar unidade.'); }
  },

  async updateUnit(req: Request, res: Response) {
    try { successResponse(res, await propertyService.updateUnit(req.user!.userId, req.params.unitId, req.body)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar unidade.'); }
  },

  async deleteUnit(req: Request, res: Response) {
    try { successResponse(res, await propertyService.deleteUnit(req.user!.userId, req.params.unitId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao deletar unidade.'); }
  },

  async bulkCreateUnits(req: Request, res: Response) {
    try { successResponse(res, await propertyService.bulkCreateUnits(req.user!.userId, req.params.id, req.body.units), 201); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao criar unidades.'); }
  },

  async addImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) { errorResponse(res, 'Nenhuma imagem enviada.'); return; }
      const images = files.map((file, index) => ({ url: `/uploads/${file.filename}`, description: req.body.descriptions?.[index] || undefined }));
      successResponse(res, await propertyService.addImages(req.user!.userId, req.params.id, images), 201);
    } catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao adicionar imagens.'); }
  },

  async updateImage(req: Request, res: Response) {
    try { successResponse(res, await propertyService.updateImage(req.user!.userId, req.params.imageId, req.body)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar imagem.'); }
  },

  async deleteImage(req: Request, res: Response) {
    try { successResponse(res, await propertyService.deleteImage(req.user!.userId, req.params.imageId)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao deletar imagem.'); }
  },

  async setAdLinks(req: Request, res: Response) {
    try { successResponse(res, await propertyService.setAdLinks(req.user!.userId, req.params.id, req.body.adLinks)); }
    catch (error: unknown) { errorResponse(res, error instanceof Error ? error.message : 'Erro ao atualizar anuncios.'); }
  },
};
