import OpenAI from 'openai'
import { env } from '@/config/env'

const SDR_SYSTEM_PROMPT = `You are a Senior Real Estate SDR (Sales Development Representative) for a Brazilian real estate brokerage. Your sole objective is to qualify leads through natural, friendly WhatsApp conversation.

You must discover the following, in a natural conversational flow:
1. Intent — Are they looking to BUY, RENT, or just browsing?
2. Budget — What is their total budget or maximum price they can pay?
3. Down Payment — How much do they have available as a down payment (entrada)?
4. Financing — Are they pre-approved? Do they need mortgage/financing (financiamento FGTS, Caixa, etc.)?
5. Location — Which neighborhood, city, or region are they targeting?

Rules:
- Ask only ONE question per message. Never stack multiple questions.
- Keep messages short, warm, and conversational — like a friendly WhatsApp exchange.
- Acknowledge what the lead says before moving to the next question.
- Once you have gathered all 5 criteria OR the lead is clearly not a qualified prospect, call the appropriate function.
- Call handoverToBroker when the lead is qualified and ready for a human specialist.
- Call discardLead when the lead is unqualified (no budget, not interested, wrong market, spam, or bot).
- NEVER reveal that you are an AI or a chatbot.
- ALWAYS respond exclusively in Brazilian Portuguese (pt-BR), regardless of the language the lead uses.
- Write with correct Brazilian Portuguese grammar, proper punctuation, and natural phrasing. Avoid slang, abbreviations, or informal spelling shortcuts (e.g. never write "vc", "tb", "pq" — always write "você", "também", "porque").`

const SDR_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'handoverToBroker',
      description:
        'Call this when the lead is fully qualified across all 5 criteria and ready to speak with a broker.',
      parameters: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description:
              'Qualification summary covering: intent, budget, down payment, financing status, and location preference.'
          }
        },
        required: ['summary']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'discardLead',
      description:
        'Call this when the lead is clearly unqualified or not interested in proceeding.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Brief reason why this lead is being discarded.'
          }
        },
        required: ['reason']
      }
    }
  }
]

export type SdrAction = 'reply' | 'handover' | 'discard'

export type SdrAgentResult =
  | { action: 'reply'; message: string }
  | { action: 'handover'; message: string; summary: string }
  | { action: 'discard'; message: string; reason: string }

export interface SdrAgentParams {
  brokerName: string
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  linkedPropertyContext: string
}

export const runSdrAgent = async (
  params: SdrAgentParams
): Promise<SdrAgentResult> => {
  const { brokerName, chatHistory, linkedPropertyContext } = params
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const systemContent = `${SDR_SYSTEM_PROMPT}\n\nYou are representing the broker: ${brokerName}.`

  // Build the message array, injecting property context as a system message
  // immediately before the last user message when a URL match was found.
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemContent },
    ...buildMessagesWithContextInjection(chatHistory, linkedPropertyContext)
  ]

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages,
    tools: SDR_TOOLS,
    tool_choice: 'auto',
    temperature: 0.7,
    max_tokens: 300
  })

  const choice = response.choices[0]
  if (!choice) throw new Error('[SDR] Empty response from OpenAI.')

  if (choice.message.tool_calls?.length) {
    const toolCall = choice.message.tool_calls[0]
    const args = JSON.parse(toolCall.function.arguments) as Record<
      string,
      string
    >

    const closingMessage = await generateClosingMessage(
      openai,
      systemContent,
      messages,
      toolCall.function.name === 'handoverToBroker' ? 'handover' : 'discard'
    )

    if (toolCall.function.name === 'handoverToBroker') {
      return {
        action: 'handover',
        message: closingMessage,
        summary: args.summary ?? ''
      }
    }

    return {
      action: 'discard',
      message: closingMessage,
      reason: args.reason ?? ''
    }
  }

  const content = choice.message?.content
  if (!content) throw new Error('[SDR] Empty content from OpenAI.')

  return { action: 'reply', message: content.trim() }
}

function buildMessagesWithContextInjection(
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  linkedPropertyContext: string
): OpenAI.Chat.ChatCompletionMessageParam[] {
  if (!linkedPropertyContext || chatHistory.length === 0) {
    return chatHistory.map(m => ({
      role: m.role,
      content: m.content
    }))
  }

  // Find the index of the last user message to inject context before it
  let lastUserIndex = -1
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    if (chatHistory[i].role === 'user') {
      lastUserIndex = i
      break
    }
  }

  if (lastUserIndex === -1) {
    return chatHistory.map(m => ({ role: m.role, content: m.content }))
  }

  const result: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...chatHistory.slice(0, lastUserIndex).map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: 'system', content: linkedPropertyContext },
    ...chatHistory.slice(lastUserIndex).map(m => ({
      role: m.role,
      content: m.content
    }))
  ]

  return result
}

async function generateClosingMessage(
  openai: OpenAI,
  systemContent: string,
  conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[],
  type: 'handover' | 'discard'
): Promise<string> {
  const instruction =
    type === 'handover'
      ? 'Write a short, warm closing message (1-2 sentences) informing the lead that a specialist broker will contact them shortly to continue the conversation. Be friendly and reassuring.'
      : 'Write a short, polite closing message (1-2 sentences) thanking the lead for their time and letting them know they can reach out anytime in the future if their situation changes.'

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemContent },
      ...conversationMessages.filter(m => m.role !== 'system'),
      { role: 'system', content: instruction }
    ],
    temperature: 0.7,
    max_tokens: 150
  })

  return response.choices[0]?.message?.content?.trim() ?? ''
}
