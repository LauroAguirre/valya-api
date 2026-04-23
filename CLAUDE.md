# CLAUDE.md — Valya API

## 1. Project Overview

Valya API is a multi-tenant SaaS backend for Brazilian real estate professionals. It automates WhatsApp lead engagement using GPT-4o: when a prospect messages a broker's connected WhatsApp number, the system classifies their intent, searches the broker's property listings, and replies with a natural-language response — without human intervention. The stack is Node.js + Express + TypeScript, Prisma ORM over MySQL, with integrations for OpenAI, Evolution API (WhatsApp), and Asaas (Brazilian payment gateway).

---

## 2. Architecture & Directory Structure

```
src/
├── @types/express/     # Express Request augmentation — adds req.user
├── config/             # Prisma singleton (database.ts), typed env loader (env.ts)
├── controllers/        # Thin handlers: parse req → call one service → return res
├── middlewares/        # auth.ts (JWT+IP), upload.ts (Multer), validate.ts (Zod)
├── providers/          # Pre-configured axios instances: evolutionApi.ts, asaasApi.ts
├── routes/             # One file per domain (user, property, lead, evolution, …)
├── schemas/            # Zod schemas for request body validation
├── services/           # All business logic, grouped by domain
│   ├── attendance/     # Entry point for processing incoming WhatsApp messages
│   ├── promptBuilder/  # AI pipeline: classify → extract filters → query → respond
│   └── openAi/         # Direct OpenAI API wrappers
├── templates/emails/   # EJS email templates
├── utils/helpers.ts    # JWT generation, 6-digit code gen, phone normalization
└── server.ts           # Express bootstrap

prisma/
├── schema.prisma       # 20 Prisma models (source of truth for the DB schema)
└── migrations/         # Migration history — never edit manually
```

The pattern is **Controller → Service → Prisma**. Controllers are intentionally thin. Business rules live exclusively in services. `providers/` holds axios instances so base URLs and auth headers are configured once.

---

## 3. Development Guidelines

### Running Locally
```bash
npm run dev          # tsx watch — hot reload
```

Required environment variables (all accessed via `src/config/env.ts`):
```
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
OPENAI_MODEL
EVOLUTION_API_URL
EVOLUTION_API_TOKEN
ASAAS_API_URL
ASAAS_API_KEY
ASAAS_WEBHOOK_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

### Database
```bash
npm run prisma:migrate    # create and apply a new migration
npm run prisma:push       # push schema directly (dev/staging only)
npm run prisma:generate   # regenerate Prisma client after schema changes
```

### Build & Production
```bash
npm run build    # tsc → dist/
npm start        # runs dist/server.js
```

### Code Quality
```bash
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier format
```

### Tests
No test framework is present in the codebase.

---

## 4. Coding Standards

### File & Folder Naming
- Controllers: `<action><Domain>Controller.ts` (e.g., `savePropertyController.ts`)
- Services: `<action><Domain>.ts` (e.g., `saveProperty.ts`, `findOrCreateByPhone.ts`)
- Routes: `<domain>.routes.ts`
- Schemas: `<domain>.schema.ts`
- All files use **camelCase**; all directories use **camelCase** as well

### TypeScript
- `tsconfig.json` uses strict settings (`strict: true`)
- Prisma-generated types are used directly — no manual model redeclarations
- `src/@types/express/index.d.ts` augments `Request` with `user: { id: string; role: string }`
- Env vars are accessed only through `src/config/env.ts` — never via `process.env` directly in services/controllers

### Import Style
- No barrel `index.ts` files observed — import from the specific file
- Absolute imports are not configured; all imports are relative

---

## 5. API & Data Fetching Patterns

### External API Calls
- All third-party HTTP calls go through pre-configured axios instances in `src/providers/`:
  - `evolutionApi.ts` — base URL + `apikey` header from env
  - `asaasApi.ts` — base URL + `access_token` header from env
- OAuth calls (Google, Facebook) use plain `axios.get` in `src/services/user/oauthLogin.ts`

### Response Conventions
- Success responses return a plain JSON object with relevant data
- Error responses use `res.status(code).json({ message: '...' })`
- Global error handler in `server.ts` catches unhandled errors and hides stack traces in production

### Webhook Handling
- Evolution webhook (`POST /api/webhooks/evolution`) returns `200` immediately; processing is done asynchronously via `processIncomingMessage` to avoid timeout
- Asaas webhook (`POST /api/webhooks/asaas`) validates `ASAAS_WEBHOOK_SECRET` before processing

### Validation
- Request bodies are validated with Zod schemas via the `validate` middleware before reaching the controller
- Schemas live in `src/schemas/`

---

## 6. UI & Styling Conventions

This is a pure REST API — there is no UI, frontend, component library, or styling layer.

---

## 7. State Management

This is a stateless REST API. There is no client-side or server-side in-memory state.

- **Session state** is encoded in JWTs (userId, role) and validated per request
- **IP binding** is stored in `RefreshKeys` table — the token is invalidated if the IP changes
- **Per-lead AI state** (`aiEnabled` flag) is persisted in the `Lead` model
- **WhatsApp connection state** is persisted in `EvolutionConfig` model

---

## 8. Tactical Architecture Notes

- **`src/config/env.ts` is the single source of truth for env vars.** Never use `process.env` directly in services or controllers — always import from `env.ts`.

- **Prisma client is a singleton.** `src/config/database.ts` exports one `prisma` instance. Do not instantiate `PrismaClient` elsewhere.

- **The AI pipeline lives entirely in `src/services/promptBuilder/`.** The entry point is `buildAndRespond.ts`. The flow is: `classifyIntent` → `extractFilters` → `queryProperties` → `buildFinalPrompt` → `chatWithHistory` → `sendMessage`. Do not bypass this chain when adding AI features.

- **`processIncomingMessage` (`src/services/attendance/`) is the webhook brain.** It handles lead creation, message persistence, AI routing, and WhatsApp reply. Keep it async-safe — the webhook controller must return 200 before this function completes.

- **Lead phone numbers are normalized before lookup.** `src/utils/helpers.ts` normalizes phone strings; always normalize before querying leads by phone.

- **Property units follow two modes: `SINGLE` and `MULTIPLE`.** The mode is set on `Property.mode`. Unit CRUD behaves differently per mode — do not unify without understanding both branches in `src/services/property/savePropertyUnit.ts`.

- **PDF extraction uses GPT-4o Vision.** The PDF is converted to a base64 image and sent to OpenAI. This is in `src/services/openAi/extractPdfData.ts`. The 20 MB Multer limit applies to PDF uploads specifically; image uploads are capped at 10 MB.

- **Asaas webhooks use a shared secret.** The secret is validated in `asaasWebhook.ts` — do not remove this check when modifying the webhook handler.

- **Subscription trial is 15 days.** It is hardcoded in `src/services/user/agentRegister.ts`. If this changes, update it there.

- **The `uploads/` directory is the Multer disk storage target.** Files are named with UUIDs. This directory is not in `.gitignore` by default — verify before deploying that it is excluded from version control and backed up separately.
