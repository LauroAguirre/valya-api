import { z } from 'zod'

const propertyImageSchema = z.object({
  id: z.string().uuid().nullish(),
  propertyId: z.string().uuid().nullish(),
  url: z
    .string()
    .nullish()
    .refine(val => !val?.startsWith('blob:'), {
      message:
        'URLs do tipo blob: nao podem ser persistidas. Envie o arquivo antes de salvar.'
    }),
  description: z.string().nullish(),
  order: z.number().int().nullish(),
  createdAt: z.union([z.date(), z.string()]).nullish()
})

const propertyAdLinkSchema = z.object({
  id: z.string().uuid().nullish(),
  propertyId: z.string().uuid().nullish(),
  platform: z.string().nullish(),
  adId: z.string().nullish(),
  url: z.string().nullish(),
  createdAt: z.union([z.date(), z.string()]).nullish()
})

export const savePropertySchema = z.object({
  id: z.string().uuid().nullish(),
  userId: z.string().uuid().nullish(),
  name: z.string().min(1, 'Nome obrigatorio.'),
  address: z.string().nullish(),
  neighborhood: z.string().nullish(),
  city: z.string().nullish(),
  bedrooms: z.number().int().nonnegative().nullish(),
  bathrooms: z.number().int().nonnegative().nullish(),
  garageCount: z.number().int().nonnegative().nullish(),
  garageType: z.enum(['NONE', 'COVERED', 'UNCOVERED', 'MIXED']).nullish(),
  bbqType: z.enum(['NONE', 'COAL', 'ELETRIC']).nullish(),
  privateArea: z.number().nonnegative().nullish(),
  description: z.string().nullish(),
  purpose: z.string().nullish(),
  type: z.string().nullish(),
  mode: z.enum(['SINGLE', 'MULTIPLE']).default('SINGLE'),
  totalPrice: z.number().nonnegative().nullish(),
  minDown: z.number().nonnegative().nullish(),
  installments: z.number().int().nonnegative().nullish(),
  annualBoost: z.number().nonnegative().nullish(),
  installmentValue: z.number().nonnegative().nullish(),
  paymentConditions: z.string().nullish(),
  paymentOptions: z.string().nullish(),
  images: z.array(propertyImageSchema).optional().default([]),
  adLinks: z.array(propertyAdLinkSchema).optional().default([])
})

export type SavePropertyInput = z.infer<typeof savePropertySchema>
