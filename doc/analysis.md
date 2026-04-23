# Valya API — Codebase Analysis

## 1. Tech Stack

### Framework & Runtime
- **Node.js** with **Express.js** — RESTful API framework
- **TypeScript** (v5.7.3) — strict type checking throughout
- **tsx** — TypeScript runtime for development (watch mode)

### Database & ORM
- **MySQL** — primary relational database
- **Prisma** (v6.2.0) — ORM, schema migrations, and type-safe query client

### Authentication & Security
- **jsonwebtoken** — JWT-based stateless authentication (7-day tokens)
- **bcryptjs** — password hashing
- **request-ip** — IP extraction for session binding

### AI & LLM
- **OpenAI SDK** (v4.77.0) — GPT-4o for chat, intent classification, filter extraction, and PDF vision analysis

### WhatsApp
- **Evolution API** (self-hosted, via axios) — WhatsApp automation via Baileys

### Payment
- **Asaas** (Brazilian gateway, via axios) — recurring subscriptions and payment webhooks

### HTTP & Validation
- **axios** — HTTP client for third-party API calls
- **Zod** — request body schema validation
- **CORS** — cross-origin resource sharing middleware

### Email & Files
- **Nodemailer** + **EJS** — SMTP email with template rendering
- **Multer** — file uploads (images and PDFs)
- **uuid** — UUID file naming

### Utilities
- **date-fns** — date manipulation
- **ESLint** + **Prettier** — linting and formatting

---

## 2. System Purpose

**Valya** is an AI-powered SaaS platform for real estate professionals (brokers and construction companies) in Brazil. Its core value is automating lead engagement via WhatsApp using GPT-4o: when a prospect messages a broker's WhatsApp, the system classifies intent, searches the broker's property listings, and generates a natural-language response — all without human intervention.

Secondary capabilities include a full property CRM (listings, units, images, pricing tables extracted from PDFs), a lead pipeline with stage tracking, subscription billing, and a backoffice admin panel.

**Target users:** Independent real estate agents (corretores) and construction companies managing property portfolios.

---

## 3. Data Architecture

### Technology
- **MySQL** + **Prisma ORM** — migrations stored in `prisma/migrations/`
- Client initialized as singleton in `src/config/database.ts`

### Core Models & Relationships

#### User Domain
| Model | Table | Purpose |
|---|---|---|
| `User` | `usuarios` | Central entity; roles: `CLIENT` or `ADMIN`; providers: `LOCAL`, `GOOGLE`, `FACEBOOK` |
| `RealStateAgent` | `corretores_imovel` | 1-to-1 with User; holds CRECI license number |
| `ConstructionCompany` | `empresas_construcao` | Company profile; many-to-many with User via `ConstructionCompanyUsers` |
| `RefreshKeys` | `refresh_keys` | JWT refresh tokens bound to IP |
| `PasswordReset` | `recuperacao_senhas` | 6-digit codes, 15-minute TTL |

#### Property Domain
| Model | Table | Purpose |
|---|---|---|
| `Property` | `imoveis` | Listing owned by a User (broker); modes: `SINGLE` / `MULTIPLE` |
| `PropertyUnit` | `imovel_unidades` | Individual units in multi-unit properties |
| `PropertyImage` | `imovel_imagens` | Ordered photos per property (max 20) |
| `PropertyAdLink` | `imovel_ads_links` | Facebook/Instagram/TikTok campaign links |

#### Lead Domain
| Model | Table | Purpose |
|---|---|---|
| `Lead` | `leads` | Prospect owned by User; stages: `QUALIFICATION → CADENCE → VISITATION → PROPOSAL → CONTRACT → WIN/LOSS` |
| `Message` | `messages` | Communication history; senders: `LEAD`, `AI`, `BROKER`; indexed on `(leadId, createdAt)` |
| `LeadProperty` | `imovel_leads` | Bridges Lead ↔ Property with interest notes |

#### AI & WhatsApp
| Model | Table | Purpose |
|---|---|---|
| `AiConfig` | `clientes_config_ia` | Per-user custom AI prompt and enable/disable toggle; 1-to-1 with User |
| `EvolutionConfig` | `config_evolution` | WhatsApp instance credentials and QR code; 1-to-1 with User |

#### Subscription & Payment
| Model | Table | Purpose |
|---|---|---|
| `Plan` | `planos` | Pricing tiers; many-to-many with `Features` via `PlanFeature` |
| `Subscription` | `assinaturas` | Status: `TRIAL`, `ACTIVE`, `EXPIRED`, `CANCELLED`; links RealStateAgent or ConstructionCompany |
| `Payment` | `pagamentos` | Individual transactions; status: `PENDING`, `CONFIRMED`, `OVERDUE`, `REFUNDED`, `FAILED` |
| `AsaasCustomer` | `asaas_clientes` | Bridges User ↔ Asaas platform |

#### System
| Model | Table | Purpose |
|---|---|---|
| `Features` | `features` | Feature flags |
| `SysModules` | `sys_modulos` | System modules with pricing |
| `SystemConfig` | `configs_sistema` | Global key-value configuration |

---

## 4. Implemented Features

### A. Authentication & User Management
- Email/password login with JWT + IP session binding (`src/services/user/login.ts`)
- Google OAuth and Facebook OAuth login (`src/services/user/oauthLogin.ts`)
- Real estate agent registration with 15-day trial auto-creation (`src/services/user/agentRegister.ts`)
- Password reset flow: request code → verify 6-digit code → reset (`src/services/user/forgotPassword.ts`)
- Profile retrieval with automatic token refresh on IP change

### B. Property Management
- Full CRUD for properties with search and pagination (20 per page)
- Single vs. multi-unit modes with bulk unit create/update/delete
- Image upload: up to 20 images per property, 10 MB each (JPEG, PNG, WebP, GIF)
- PDF pricing table extraction: upload PDF → GPT-4o vision parses unit data → auto-updates units

### C. Lead Management
- Manual lead creation and automatic lead creation from incoming WhatsApp messages
- Lead uniqueness by phone number per broker
- Stage pipeline: QUALIFICATION → CADENCE → VISITATION → PROPOSAL → CONTRACT → WIN/LOSS
- Per-lead AI toggle (disable AI for manual conversations)
- Paginated message history (50 per page), indexed queries

### D. AI-Powered WhatsApp Chat
- **Intent classification**: 12 categories using GPT with temperature 0.1
- **Filter extraction**: natural language → structured property search filters
- **Property query**: searches broker's listings, returns top 5 matches
- **Response generation**: consultive tone, WhatsApp-friendly format, no invented data
- **Conversation summarization**: condenses history for token efficiency
- Custom AI config: per-broker system prompt overrides

### E. WhatsApp Integration (Evolution API)
- Instance creation and QR code generation
- Connection status monitoring and disconnect
- Incoming message webhook: filters group messages, processes async to avoid timeout
- Outgoing messages with typing indicator (duration proportional to message length)

### F. Subscription & Payment (Asaas)
- Customer creation in Asaas
- Recurring subscription management
- Payment webhook: handles confirmed, overdue, refunded, failed events
- Email notifications per payment event

### G. Dashboard & Analytics
- Client dashboard: active leads (7-day threshold), follow-up count, monthly metrics, 6-month history
- Admin dashboard: system-wide metrics

### H. Backoffice / Admin
- Client list and detail view
- Admin user management (list, view, activate/deactivate)
- All backoffice routes require `ADMIN` role

### I. Email Communications
Template-based emails via Nodemailer + EJS:
- Password reset (6-digit code, 15-min expiry)
- Welcome with trial info
- Payment confirmed
- Payment failed
- Subscription expiring

---

## 5. Project Structure

```
valya-api/
├── src/
│   ├── @types/express/index.d.ts       # Augments Express Request with user object
│   ├── config/
│   │   ├── database.ts                 # Prisma singleton
│   │   └── env.ts                      # Typed environment variable loader
│   ├── controllers/                    # Thin request handlers — parse req, call service, return res
│   │   ├── asaas/
│   │   ├── configs/
│   │   ├── dashboard/
│   │   ├── evolution/
│   │   ├── leads/
│   │   ├── properties/
│   │   ├── users/
│   │   ├── pricingTablesPdf/
│   │   └── webhooks/
│   ├── middlewares/
│   │   ├── auth.ts                     # JWT verification + IP session validation
│   │   ├── upload.ts                   # Multer config (images / PDFs)
│   │   └── validate.ts                 # Zod schema validation middleware
│   ├── providers/
│   │   ├── evolutionApi.ts             # Axios instance for Evolution API
│   │   └── asaasApi.ts                 # Axios instance for Asaas
│   ├── routes/                         # 10 route files, each grouping one domain
│   ├── schemas/                        # Zod schemas for request validation
│   ├── services/                       # All business logic
│   │   ├── attendance/                 # Main incoming message processing pipeline
│   │   ├── promptBuilder/              # AI prompt orchestration (8 files)
│   │   ├── openAi/                     # Direct OpenAI API calls
│   │   ├── evolution/                  # WhatsApp instance management
│   │   ├── leads/
│   │   ├── property/
│   │   ├── user/
│   │   ├── asaas/
│   │   ├── email.service.ts
│   │   └── refreshToken/
│   ├── templates/emails/               # EJS email templates
│   ├── utils/helpers.ts                # JWT generation, code gen, phone normalization
│   └── server.ts                       # Express app bootstrap
├── prisma/
│   ├── schema.prisma                   # 20 models
│   └── migrations/
├── public/                             # Static files
├── uploads/                            # Multer disk storage
├── doc/                                # Project documentation
├── package.json
└── tsconfig.json
```

**Architecture pattern:** Controller → Service → Prisma. Controllers are thin (parse request, call one service, return response). All business logic lives in services. Providers are pre-configured axios instances for external APIs.

---

## 6. External Integrations

### OpenAI (GPT-4o)
- **Intent classification** — temperature 0.1, deterministic
- **Filter extraction** — natural language to structured JSON
- **Conversational chat** — multi-turn with summarized history
- **PDF vision** — pricing table extraction from images
- Config: `OPENAI_API_KEY`, `OPENAI_MODEL`

### Evolution API (WhatsApp via Baileys)
- Self-hosted WhatsApp automation
- Webhooks: `messages.upsert`, `connection.update`
- Config: `EVOLUTION_API_URL`, `EVOLUTION_API_TOKEN`

### Asaas (Brazilian Payment Gateway)
- Recurring subscriptions and payment events via webhook
- Config: `ASAAS_API_URL`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_SECRET`

### Google OAuth
- Token validation via `googleapis.com/oauth2/v2/userinfo`
- Config: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### Facebook OAuth
- Profile retrieval via `graph.facebook.com/me`
- Config: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`

### Nodemailer (SMTP)
- Transactional email with EJS templates
- Config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### MySQL
- Config: `DATABASE_URL` (Prisma connection string)
