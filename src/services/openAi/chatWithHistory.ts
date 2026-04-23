import { env } from '@/config/env'
import OpenAI from 'openai'

export const chatWithHistory = async (
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do ChatGPT.')
  return content.trim()
}
