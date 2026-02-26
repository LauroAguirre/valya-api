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
    try {
      const result = await propertyService.getById(req.user!.userId, req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar imovel.';
      errorResponse(res, message);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const result = await propertyService.create(req.user!.userId, req.body);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar imovel.';
      errorResponse(res, message);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const result = await propertyService.update(req.user!.userId, req.params.id, req.body);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar imovel.';
      errorResponse(res, message);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await propertyService.delete(req.user!.userId, req.params.id);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar imovel.';
      errorResponse(res, message);
    }
  },

  // Unidades
  async createUnit(req: Request, res: Response) {
    try {
      const result = await propertyService.createUnit(req.user!.userId, req.params.id, req.body);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar unidade.';
      errorResponse(res, message);
    }
  },

  async updateUnit(req: Request, res: Response) {
    try {
      const result = await propertyService.updateUnit(req.user!.userId, req.params.unitId, req.body);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar unidade.';
      errorResponse(res, message);
    }
  },

  async deleteUnit(req: Request, res: Response) {
    try {
      const result = await propertyService.deleteUnit(req.user!.userId, req.params.unitId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar unidade.';
      errorResponse(res, message);
    }
  },

  async bulkCreateUnits(req: Request, res: Response) {
    try {
      const result = await propertyService.bulkCreateUnits(
        req.user!.userId,
        req.params.id,
        req.body.units
      );
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar unidades.';
      errorResponse(res, message);
    }
  },

  // Imagens
  async addImages(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        errorResponse(res, 'Nenhuma imagem enviada.');
        return;
      }

      const images = files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        description: req.body.descriptions?.[index] || undefined,
      }));

      const result = await propertyService.addImages(req.user!.userId, req.params.id, images);
      successResponse(res, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao adicionar imagens.';
      errorResponse(res, message);
    }
  },

  async updateImage(req: Request, res: Response) {
    try {
      const result = await propertyService.updateImage(
        req.user!.userId,
        req.params.imageId,
        req.body
      );
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar imagem.';
      errorResponse(res, message);
    }
  },

  async deleteImage(req: Request, res: Response) {
    try {
      const result = await propertyService.deleteImage(req.user!.userId, req.params.imageId);
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar imagem.';
      errorResponse(res, message);
    }
  },

  // Ad Links
  async setAdLinks(req: Request, res: Response) {
    try {
      const result = await propertyService.setAdLinks(
        req.user!.userId,
        req.params.id,
        req.body.adLinks
      );
      successResponse(res, result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar anuncios.';
      errorResponse(res, message);
    }
  },
};
