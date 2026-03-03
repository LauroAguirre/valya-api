import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import propertyRoutes from './routes/property.routes.js';
import leadRoutes from './routes/lead.routes.js';
import aiConfigRoutes from './routes/aiConfig.routes.js';
import evolutionRoutes from './routes/evolution.routes.js';
import backofficeRoutes from './routes/backoffice.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import pdfRoutes from './routes/pdf.routes.js';

const app = express();

// Garantir que a pasta de uploads exista
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware global
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai-config', aiConfigRoutes);
app.use('/api/evolution', evolutionRoutes);
app.use('/api/backoffice', backofficeRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/pdf', pdfRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API Error]', err);
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor.',
  });
});

app.listen(env.PORT, () => {
  console.log(`[Valya API] Servidor rodando na porta ${env.PORT}`);
});

export default app;
