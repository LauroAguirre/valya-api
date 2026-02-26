import { Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service.js';
import { evolutionService } from '../services/evolution.service.js';
import { asaasService } from '../services/asaas.service.js';

export const webhookController = {
  /**
   * Webhook da EvolutionAPI - recebe mensagens do WhatsApp
   */
  async evolutionWebhook(req: Request, res: Response) {
    try {
      const body = req.body;

      // Tipos de evento do Evolution
      const event = body.event;

      if (event === 'messages.upsert') {
        const messageData = body.data;

        // Ignorar mensagens de grupo
        if (messageData?.key?.remoteJid?.includes('@g.us')) {
          res.status(200).json({ received: true });
          return;
        }

        // Extrair conteudo da mensagem
        const messageContent =
          messageData?.message?.conversation ||
          messageData?.message?.extendedTextMessage?.text ||
          messageData?.message?.imageMessage?.caption ||
          '';

        if (!messageContent) {
          res.status(200).json({ received: true });
          return;
        }

        const instanceName = body.instance || body.instanceName;

        // Processar em background (nao bloquear resposta do webhook)
        setImmediate(async () => {
          try {
            await attendanceService.processIncomingMessage({
              instanceName,
              remoteJid: messageData.key.remoteJid,
              fromMe: messageData.key.fromMe || false,
              message: messageContent,
              pushName: messageData.pushName,
            });
          } catch (error) {
            console.error('[Webhook Evolution] Erro ao processar mensagem:', error);
          }
        });
      }

      if (event === 'connection.update') {
        const instanceName = body.instance || body.instanceName;
        const state = body.data?.state;

        if (instanceName && state) {
          await evolutionService.handleConnectionUpdate(instanceName, state);
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('[Webhook Evolution] Erro:', error);
      res.status(200).json({ received: true }); // Sempre retornar 200 para webhooks
    }
  },

  /**
   * Webhook da Asaas - recebe eventos de pagamento
   */
  async asaasWebhook(req: Request, res: Response) {
    try {
      const { event, payment } = req.body;

      if (!event || !payment) {
        res.status(200).json({ received: true });
        return;
      }

      // Processar em background
      setImmediate(async () => {
        try {
          await asaasService.handlePaymentWebhook(event, payment);
        } catch (error) {
          console.error('[Webhook Asaas] Erro ao processar:', error);
        }
      });

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('[Webhook Asaas] Erro:', error);
      res.status(200).json({ received: true });
    }
  },
};
