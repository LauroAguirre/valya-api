import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { env } from './config/env'

// Routes
import userRoutes from './routes/user.routes'
// import profileRoutes from './routes/profile.routes'
import dashboardRoutes from './routes/dashboard.routes'
import propertyRoutes from './routes/property.routes'
import leadRoutes from './routes/lead.routes'
import aiConfigRoutes from './routes/aiConfig.routes'
import evolutionRoutes from './routes/evolution.routes'
import backofficeRoutes from './routes/backoffice.routes'
import webhookRoutes from './routes/webhook.routes'
import pdfRoutes from './routes/pdf.routes'
import { Request, Response, NextFunction } from 'express'

const app = express()

const uploadsDir = path.join(process.cwd(), 'uploads')

// Garante que a pasta de uploads exista
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const logger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  next()
}

app.use(logger)

// Middleware global
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(uploadsDir)) // Servir arquivos estáticos da pasta de uploads

// Rotas
app.use('/api/user', userRoutes)
// app.use('/api/profile', profileRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/ai-config', aiConfigRoutes)
app.use('/api/evolution', evolutionRoutes)
app.use('/api/backoffice', backofficeRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/pdf', pdfRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler global
app.use((err: Error, _req: Request, res: Response) => {
  console.error('[API Error]', err.message)
  // console.error('[API Error]', err)
  res.status(500).json({
    success: false,
    error:
      env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor.'
  })
})

app.listen(env.PORT, () => {
  console.log(`[Valya API] Servidor rodando na porta ${env.PORT}`)
})

export default app
