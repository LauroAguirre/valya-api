import prisma from '../config/database.js';
import { leadService } from './lead.service.js';
import { evolutionService } from './evolution.service.js';
import { promptBuilderService } from './promptBuilder.service.js';
import { normalizePhone } from '../utils/helpers.js';

export const attendanceService = {
  /**
   * Processar mensagem recebida via webhook do Evolution
   * Fluxo completo: identificar corretor -> registrar mensagem -> verificar IA -> gerar resposta -> enviar
   */
  async processIncomingMessage(data: {
    instanceName: string;
    remoteJid: string;
    fromMe: boolean;
    message: string;
    pushName?: string;
  }) {
    const { instanceName, remoteJid, fromMe, message, pushName } = data;

    // Extrair numero do telefone do lead (remover @s.whatsapp.net)
    const leadPhone = normalizePhone(remoteJid.replace('@s.whatsapp.net', ''));

    // Encontrar config da evolution para identificar o corretor
    const evolutionConfig = await prisma.evolutionConfig.findUnique({
      where: { instanceName },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!evolutionConfig || !evolutionConfig.user) {
      console.error(`[Attendance] Instancia nao encontrada: ${instanceName}`);
      return;
    }

    const corretorId = evolutionConfig.user.id;

    // Encontrar ou criar o lead
    const lead = await leadService.findOrCreateByPhone(
      corretorId,
      leadPhone,
      pushName
    );

    // Determinar remetente
    const sender = fromMe ? 'BROKER' : 'LEAD';

    // Registrar mensagem no banco
    await prisma.message.create({
      data: {
        leadId: lead.id,
        sender: sender as any,
        content: message,
      },
    });

    // Atualizar lastReplyAt do lead se for mensagem do lead
    if (sender === 'LEAD') {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { lastReplyAt: new Date() },
      });
    }

    // Se a mensagem e do proprio corretor, nao processar IA
    if (fromMe) {
      return { processed: true, aiResponse: false };
    }

    // Verificar se o atendimento de IA esta ativo para este lead
    if (!lead.aiEnabled) {
      console.log(`[Attendance] IA desativada para lead ${lead.id}`);
      return { processed: true, aiResponse: false };
    }

    // Verificar se a config de IA global do corretor esta ativa
    const aiConfig = await prisma.aiConfig.findUnique({
      where: { userId: corretorId },
    });

    if (!aiConfig?.isActive) {
      console.log(`[Attendance] IA global desativada para corretor ${corretorId}`);
      return { processed: true, aiResponse: false };
    }

    // ==================== GERAR RESPOSTA IA ====================
    try {
      // Chamar o servico de construcao de prompt
      const { mensagem } = await promptBuilderService.buildAndRespond(corretorId, lead.id);

      if (!mensagem) {
        console.error(`[Attendance] Resposta vazia do prompt builder`);
        return { processed: true, aiResponse: false };
      }

      // Registrar a resposta da IA no banco
      await prisma.message.create({
        data: {
          leadId: lead.id,
          sender: 'AI',
          content: mensagem,
        },
      });

      // Enviar mensagem via EvolutionAPI
      await evolutionService.sendMessage(instanceName, leadPhone, mensagem);

      console.log(`[Attendance] Resposta IA enviada para ${leadPhone} via ${instanceName}`);

      return { processed: true, aiResponse: true, message: mensagem };
    } catch (error) {
      console.error(`[Attendance] Erro ao gerar resposta IA:`, error);
      return { processed: true, aiResponse: false, error: String(error) };
    }
  },
};
