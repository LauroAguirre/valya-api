import prisma from '../config/database.js';
import type { BbqType, GarageType, PropertyMode } from '@prisma/client';

interface CreatePropertyData {
  name: string;
  address?: string;
  bedrooms?: number;
  garageCount?: number;
  garageType?: GarageType;
  bathrooms?: number;
  bbqType?: BbqType;
  description?: string;
  privateArea?: number;
  mode?: PropertyMode;
  purpose?: string;
  type?: string;
  neighborhood?: string;
  city?: string;
  // Financeiro unidade unica
  totalPrice?: number;
  minDown?: number;
  installments?: number;
  annualBoost?: number;
  installmentValue?: number;
  paymentConditions?: string;
  paymentOptions?: string;
}

interface PropertyUnitData {
  unitName: string;
  bedrooms?: number;
  garage?: number;
  privateArea?: number;
  garageArea?: number;
  totalArea?: number;
  downPayment?: number;
  annualBoost?: number;
  installmentValue?: number;
}

interface AdLinkData {
  platform: string;
  adId?: string;
  url?: string;
}

export const propertyService = {
  async list(userId: string, params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search ? { name: { contains: search } } : {}),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { order: 'asc' } },
          units: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return { properties, total, page, limit };
  },

  async getById(userId: string, propertyId: string) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
      include: {
        units: { orderBy: { unitName: 'asc' } },
        images: { orderBy: { order: 'asc' } },
        adLinks: true,
      },
    });

    if (!property) throw new Error('Imovel nao encontrado.');
    return property;
  },

  async create(userId: string, data: CreatePropertyData) {
    const property = await prisma.property.create({
      data: {
        userId,
        ...data,
      },
    });

    return property;
  },

  async update(userId: string, propertyId: string, data: Partial<CreatePropertyData>) {
    const existing = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!existing) throw new Error('Imovel nao encontrado.');

    const property = await prisma.property.update({
      where: { id: propertyId },
      data,
    });

    return property;
  },

  async delete(userId: string, propertyId: string) {
    const existing = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });

    if (!existing) throw new Error('Imovel nao encontrado.');

    await prisma.property.delete({ where: { id: propertyId } });
    return { deleted: true };
  },

  // ==================== UNIDADES ====================

  async createUnit(userId: string, propertyId: string, data: PropertyUnitData) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });
    if (!property) throw new Error('Imovel nao encontrado.');

    const unit = await prisma.propertyUnit.create({
      data: { propertyId, ...data },
    });

    return unit;
  },

  async updateUnit(userId: string, unitId: string, data: Partial<PropertyUnitData>) {
    const unit = await prisma.propertyUnit.findUnique({
      where: { id: unitId },
      include: { property: true },
    });
    if (!unit || unit.property.userId !== userId) throw new Error('Unidade nao encontrada.');

    const updated = await prisma.propertyUnit.update({
      where: { id: unitId },
      data,
    });

    return updated;
  },

  async deleteUnit(userId: string, unitId: string) {
    const unit = await prisma.propertyUnit.findUnique({
      where: { id: unitId },
      include: { property: true },
    });
    if (!unit || unit.property.userId !== userId) throw new Error('Unidade nao encontrada.');

    await prisma.propertyUnit.delete({ where: { id: unitId } });
    return { deleted: true };
  },

  async bulkCreateUnits(userId: string, propertyId: string, units: PropertyUnitData[]) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });
    if (!property) throw new Error('Imovel nao encontrado.');

    // Deletar unidades existentes e recriar
    await prisma.propertyUnit.deleteMany({ where: { propertyId } });

    const created = await prisma.propertyUnit.createMany({
      data: units.map((u) => ({ propertyId, ...u })),
    });

    return { count: created.count };
  },

  // ==================== IMAGENS ====================

  async addImages(
    userId: string,
    propertyId: string,
    images: { url: string; description?: string }[]
  ) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });
    if (!property) throw new Error('Imovel nao encontrado.');

    const maxOrder = await prisma.propertyImage.findFirst({
      where: { propertyId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    let nextOrder = (maxOrder?.order ?? -1) + 1;

    const created = await prisma.propertyImage.createMany({
      data: images.map((img) => ({
        propertyId,
        url: img.url,
        description: img.description,
        order: nextOrder++,
      })),
    });

    return { count: created.count };
  },

  async updateImage(userId: string, imageId: string, data: { description?: string; order?: number }) {
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });
    if (!image || image.property.userId !== userId) throw new Error('Imagem nao encontrada.');

    const updated = await prisma.propertyImage.update({
      where: { id: imageId },
      data,
    });

    return updated;
  },

  async deleteImage(userId: string, imageId: string) {
    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: true },
    });
    if (!image || image.property.userId !== userId) throw new Error('Imagem nao encontrada.');

    await prisma.propertyImage.delete({ where: { id: imageId } });
    return { deleted: true };
  },

  // ==================== AD LINKS ====================

  async setAdLinks(userId: string, propertyId: string, adLinks: AdLinkData[]) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
    });
    if (!property) throw new Error('Imovel nao encontrado.');

    await prisma.propertyAdLink.deleteMany({ where: { propertyId } });

    const created = await prisma.propertyAdLink.createMany({
      data: adLinks.map((link) => ({ propertyId, ...link })),
    });

    return { count: created.count };
  },
};
