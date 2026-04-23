import { evolutionApi } from '@/providers/evolutionApi'
import { calculateTypingDelay, normalizePhone, sleep } from '@/utils/helpers'

interface SendMessageProps {
  instanceName: string
  to: string
  message: string
}

export const sendMessage = async ({
  instanceName,
  to,
  message
}: SendMessageProps) => {
  const phone = normalizePhone(to)
  const typingDelay = calculateTypingDelay(message)

  await evolutionApi.post('/chat/presence', {
    number: phone,
    delay: typingDelay,
    presence: 'composing'
  })

  // try {
  //   await fetch(`${EVOLUTION_URL}/chat/presence/${instanceName}`, {
  //     method: 'POST',
  //     headers: headers(),
  //     body: JSON.stringify({ number: phone, delay: typingDelay, presence: 'composing' }),
  //   });
  // } catch { /* nao bloquear envio */ }

  await sleep(typingDelay)

  const msg = await evolutionApi.post(`/message/sendText/${instanceName}`, {
    number: phone,
    text: message
  })

  if (msg.status !== 200) {
    const error = msg.request.catch(() => ({}))
    throw new Error(`Erro ao enviar mensagem: ${JSON.stringify(error)}`)
  }

  return msg.data
}
