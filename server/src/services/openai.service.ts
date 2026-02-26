import OpenAI from 'openai';
import { env } from '../config/env.js';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const openaiService = {
  /**
   * Enviar prompt ao ChatGPT e receber resposta de texto
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia do ChatGPT.');

    return content.trim();
  },

  /**
   * Enviar prompt com historico de conversa completo
   */
  async chatWithHistory(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia do ChatGPT.');

    return content.trim();
  },

  /**
   * Extrair dados de PDF usando GPT-4 Vision
   * Envia o arquivo PDF e recebe um JSON estruturado
   */
  async extractPdfData(filePath: string, extractionPrompt: string): Promise<unknown> {
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Voce e um assistente especializado em extrair dados de tabelas de preco de empreendimentos imobiliarios. 
Voce SEMPRE responde em formato JSON valido, sem nenhum texto adicional fora do JSON.
O JSON deve seguir o formato especificado pelo usuario.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: extractionPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia na extracao do PDF.');

    try {
      return JSON.parse(content);
    } catch {
      throw new Error('Resposta do GPT nao e um JSON valido.');
    }
  },
};
