import { IntentCategory } from '@prisma/client'

export const buildFinalPrompt = (params: {
  apiPrompt: string
  customPrompt: string
  conversationSummary: string
  intent: IntentCategory
  propertyData: string
  brokerName: string
}): string => {
  const {
    apiPrompt,
    customPrompt,
    conversationSummary,
    intent,
    propertyData,
    brokerName
  } = params

  let prompt = apiPrompt
  if (customPrompt)
    prompt += `\n\n--- INSTRUCOES DO CORRETOR ---\n${customPrompt}`
  prompt += `\n\n--- CONTEXTO DA CONVERSA ---\nNome do corretor: ${brokerName}\nIntencao identificada: ${intent}\n\nHistorico resumido:\n${conversationSummary}`
  if (propertyData) prompt += `\n\n--- IMOVEIS DISPONIVEIS ---\n${propertyData}`
  prompt += `\n\n--- INSTRUCAO ---\nCom base no contexto acima, gere APENAS a mensagem de resposta ao cliente. Nao inclua explicacoes, metadados ou qualquer texto alem da mensagem final.`

  return prompt
}
