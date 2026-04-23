export const summarizeConversation = (
  messages: Array<{ sender: string; content: string; createdAt: Date }>
) => {
  const recent = messages.slice(-20)
  return recent
    .map(m => {
      const role = m.sender === 'LEAD' ? 'Cliente' : 'Corretor'
      return `[${role}]: ${m.content.substring(0, 300)}`
    })
    .join('\n')
}
