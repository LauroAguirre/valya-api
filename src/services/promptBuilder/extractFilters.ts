import { openaiChat } from '../openAi/chat'

export const extractFilters = async (
  conversationSummary: string
): Promise<Record<string, unknown>> => {
  const extractionPrompt = `Analise a conversa abaixo e extraia os filtros de busca de imoveis mencionados pelo cliente.
  Responda APENAS com um JSON valido com os campos aplicaveis:
  {
    "tipo": "casa|apartamento|lote|terreno|comercial",
    "bairro": "string ou null",
    "cidade": "string ou null",
    "faixa_preco_min": "number ou null",
    "faixa_preco_max": "number ou null",
    "quartos": "number ou null",
    "vagas": "number ou null",
    "finalidade": "venda|aluguel",
    "caracteristicas": ["array de strings relevantes"]
  }

  Conversa:
  ${conversationSummary}`

  try {
    const result = await openaiChat(
      'Voce e um extrator de filtros. Responda APENAS com JSON valido.',
      extractionPrompt,
      { temperature: 0.1, maxTokens: 300 }
    )
    return JSON.parse(result)
  } catch {
    return {}
  }
}
