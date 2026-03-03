import { openaiService } from './openai.service.js';
import { propertyService } from './property.service.js';
import fs from 'fs';

export const pdfService = {
  async extractAndUpdate(params: { filePath: string; userId: string; propertyId: string }) {
    const { filePath, userId, propertyId } = params;

    const property = await propertyService.getById(userId, propertyId);
    if (!property) throw new Error('Imovel nao encontrado.');

    const extractionPrompt = `Extraia todos os dados de unidades/apartamentos da tabela de precos neste PDF.

Retorne um JSON no seguinte formato:
{
  "propertyName": "Nome do empreendimento (se visivel)",
  "units": [
    {
      "unitName": "numero ou identificacao da unidade",
      "bedrooms": numero_de_dormitorios,
      "garage": numero_de_vagas,
      "privateArea": area_privativa_em_m2,
      "garageArea": area_da_garagem_em_m2,
      "totalArea": area_total_em_m2,
      "downPayment": valor_de_entrada,
      "annualBoost": valor_do_reforco_anual,
      "installmentValue": valor_da_parcela
    }
  ],
  "paymentConditions": "condicoes gerais de pagamento (texto livre)",
  "paymentOptions": "opcoes de pagamento (texto livre)"
}

Se algum campo nao estiver disponivel no PDF, use null.
Extraia TODAS as unidades visiveis na tabela.`;

    const extractedData = (await openaiService.extractPdfData(filePath, extractionPrompt)) as {
      propertyName?: string;
      units?: Array<{
        unitName: string; bedrooms?: number; garage?: number; privateArea?: number;
        garageArea?: number; totalArea?: number; downPayment?: number; annualBoost?: number; installmentValue?: number;
      }>;
      paymentConditions?: string;
      paymentOptions?: string;
    };

    const updates: Record<string, unknown> = {};
    if (extractedData.paymentConditions) updates.paymentConditions = extractedData.paymentConditions;
    if (extractedData.paymentOptions) updates.paymentOptions = extractedData.paymentOptions;

    if (Object.keys(updates).length > 0) {
      await propertyService.update(userId, propertyId, updates as any);
    }

    if (extractedData.units && extractedData.units.length > 0) {
      await propertyService.bulkCreateUnits(userId, propertyId, extractedData.units.map((u) => ({
        unitName: u.unitName || 'S/N', bedrooms: u.bedrooms, garage: u.garage,
        privateArea: u.privateArea, garageArea: u.garageArea, totalArea: u.totalArea,
        downPayment: u.downPayment, annualBoost: u.annualBoost, installmentValue: u.installmentValue,
      })));
    }

    try { fs.unlinkSync(filePath); } catch { /* ignorar */ }

    return { extracted: extractedData, unitsCount: extractedData.units?.length || 0, propertyId };
  },
};
