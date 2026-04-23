import prisma from '@/config/database'
import { extractPdfData } from '../openAi/extractPdfData'
import { getPropertyById } from '../property/getPropertyById'
import fs from 'fs'

export const extractAndUpdate = async (params: {
  filePath: string
  clientId: string
  propertyId: string
}) => {
  const { filePath, clientId, propertyId } = params

  const property = await getPropertyById(clientId, propertyId)
  if (!property) throw new Error('Imovel nao encontrado.')

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
Extraia TODAS as unidades visiveis na tabela.`

  const extractedData = (await extractPdfData(filePath, extractionPrompt)) as {
    propertyName?: string
    units?: Array<{
      unitName: string
      bedrooms?: number
      garage?: number
      privateArea?: number
      garageArea?: number
      totalArea?: number
      downPayment?: number
      annualBoost?: number
      installmentValue?: number
    }>
    paymentConditions?: string
    paymentOptions?: string
  }

  const updates: Record<string, unknown> = {}
  if (extractedData.paymentConditions)
    updates.paymentConditions = extractedData.paymentConditions
  if (extractedData.paymentOptions)
    updates.paymentOptions = extractedData.paymentOptions

  const extractedUnities = extractedData.units || []

  const unities = extractedUnities.map(u => ({
    ...u,
    id: property.units.find(pu => pu.unitName === u.unitName)?.id || ''
  }))

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      name: extractedData.propertyName || property.name,
      paymentConditions:
        extractedData.paymentConditions || property.paymentConditions,
      paymentOptions:
        extractedData.paymentConditions || property.paymentConditions,
      units: {
        deleteMany: {
          NOT: {
            id: {
              in: unities.map(u => u.id)
            }
          }
        },
        createMany: {
          skipDuplicates: true,
          data: unities.map(u => ({
            ...u,
            propertyId
          }))
        },
        updateMany: unities.map(u => ({
          where: {
            id: u.id
          },
          data: {
            ...u
          }
        }))
      }
    }
  })

  try {
    fs.unlinkSync(filePath)
  } catch {
    /* ignorar */
  }

  return {
    extracted: extractedData,
    unitsCount: extractedData.units?.length || 0,
    propertyId
  }
}
