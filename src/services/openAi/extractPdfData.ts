import { env } from '@/config/env'
import OpenAI from 'openai'
import fs from 'fs'

export const extractPdfData = async (
  filePath: string,
  extractionPrompt: string
) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  const fileBuffer = fs.readFileSync(filePath)
  const base64 = fileBuffer.toString('base64')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Voce e um assistente especializado em extrair dados de tabelas de preco de empreendimentos imobiliarios.
Voce SEMPRE responde em formato JSON valido, sem nenhum texto adicional fora do JSON.
O JSON deve seguir o formato especificado pelo usuario.`
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: extractionPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:application/pdf;base64,${base64}`,
              detail: 'high'
            }
          }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia na extracao do PDF.')

  try {
    return JSON.parse(content)
  } catch {
    throw new Error('Resposta do GPT nao e um JSON valido.')
  }
}
