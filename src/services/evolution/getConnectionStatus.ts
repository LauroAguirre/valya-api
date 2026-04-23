import prisma from '@/config/database'
import { evolutionApi } from '@/providers/evolutionApi'

export const getConnectionStatus = async (userId: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: { realStateAgent: true }
    })

    if (!user) throw new Error('Usuário não encontrado.')

    // 1. Captura e higienização do telefone
    const rawPhone = user?.realStateAgent?.comercialPhone || user?.phone || ''
    let cleanPhone = rawPhone.replace(/\D/g, '') // Remove tudo que não for dígito numérico

    // Se o número tiver 10 ou 11 dígitos (apenas DDD + Número), adiciona o DDI do Brasil (55)
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`
    }

    console.log({ user })

    // Validação de bloqueio antes de bater na API
    if (!cleanPhone || cleanPhone.length < 12) {
      console.error('sem telefone...')
      throw new Error(
        'Número de telefone ausente ou inválido no cadastro do corretor.'
      )
    }

    const config = await prisma.evolutionConfig.findUnique({
      where: { userId: userId || '' }
    })

    console.log({ config })

    console.log({ cleanPhone })

    let connectionData
    let qrCodeBase64 = null
    const instanceName = config?.instanceName || `whats-${user?.id}`

    // try {
    if (config?.instanceName) {
      console.log('Buscar dados da instância...')
      // Instância já existe: apenas checa o status
      const res = await evolutionApi.get(
        `/instance/connectionState/${instanceName}`
      )
      connectionData = res.data
    } else {
      console.log('Criar nova instância...')
      // Instância não existe: cria do zero enviando o telefone higienizado
      const createRes = await evolutionApi.post('/instance/create', {
        instanceName,
        integration: 'WHATSAPP-BAILEYS',
        token: `tk-${userId}`,
        qrcode: true,
        number: cleanPhone // Usando o número formatado aqui
      })

      connectionData = createRes.data
      qrCodeBase64 = createRes.data?.qrcode?.base64 || null

      // Aplica as configurações de comportamento da instância
      await evolutionApi.post(`/settings/set/${instanceName}`, {
        rejectCall: true,
        msgCall:
          'No momento não posso atender ligações. Por favor, envie uma mensagem de texto.',
        groupsIgnore: true,
        readMessages: true,
        readStatus: true,
        syncFullHistory: false
      })
    }

    console.log({ connectionData })
    const connected = connectionData?.instance?.state === 'open'

    // Usando UPSERT para criar ou atualizar o registro de configuração com segurança
    await prisma.evolutionConfig.upsert({
      where: { userId: userId || '' },
      create: {
        userId: userId || '',
        connected,
        instanceId: connectionData?.instance?.instanceId,
        instanceName,
        phone: cleanPhone, // Salva no banco o número limpo que a API reconhece
        qrCode: qrCodeBase64
      },
      update: {
        connected,
        instanceId: connectionData?.instance?.instanceId,
        phone: cleanPhone,
        ...(qrCodeBase64 && { qrCode: qrCodeBase64 })
      }
    })

    return {
      connected,
      state: connectionData?.instance?.state,
      qrCode: qrCodeBase64
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('érro na criação da instancia...')
    console.error(
      'Erro na comunicação com a Evolution API:',
      error?.response?.data || error.message
    )
    throw new Error('Falha ao processar a instância no servidor de mensageria.')
  }
}
