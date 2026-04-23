import { env } from '@/config/env'
import OpenAI from 'openai'

export const openaiChat = async (
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
) => {
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do ChatGPT.')
  return content.trim()
}
