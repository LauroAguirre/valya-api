import { IntentCategory } from '@prisma/client'
import { openaiChat } from '../openAi/chat'
import { INTENT_CATEGORIES } from './configConstants'

export const classifyIntent = async (
  conversationSummary: string
): Promise<IntentCategory> => {
  const classificationPrompt = `Analise a conversa abaixo e classifique a INTENCAO ATUAL do cliente em EXATAMENTE uma das categorias:
  ${INTENT_CATEGORIES.join(', ')}

  Responda APENAS com o nome da categoria, sem nenhum texto adicional.

  Conversa:
  ${conversationSummary}`

  try {
    const result = await openaiChat(
      'Voce e um classificador de intencoes. Responda APENAS com o nome da categoria.',
      classificationPrompt,
      { temperature: 0.1, maxTokens: 50 }
    )
    const cleaned = result
      .trim()
      .toUpperCase()
      .replace(/[^A-Z_]/g, '')
    if (INTENT_CATEGORIES.includes(cleaned as IntentCategory))
      return cleaned as IntentCategory
    return IntentCategory.OTHER
  } catch {
    return IntentCategory.OTHER
  }
}
