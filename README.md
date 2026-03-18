# Virtura AI — Content Creation Platform

Virtura is an AI-powered SaaS platform for creators and brands. It enables studio-quality image, video, and avatar generation through a token-based system, with a two-sided marketplace connecting creators and brands.

**Live:** [https://www.virturaai.com](https://www.virturaai.com)

---

## What It Does

- **AI Image Studio** — Generate images with Flux models, DALL-E 3, style transfer, background removal, face swap, and upscaling
- **Avatar Studio** — Create talking avatars, realistic avatars, avatar animations, and avatar expressions
- **Video Generation** — LivePortrait animations, HeyGen talking photos, Runway Gen-3 videos, Kling motion videos
- **Voice & Audio** — Text-to-speech, voice cloning, multilingual synthesis via ElevenLabs; audio transcription via Whisper
- **Creator Marketplace** — Brands post campaigns; creators apply, get accepted, and receive payouts via Stripe Connect
- **Social Feed** — Post content, unlock monetized posts, like/comment, follow creators
- **Token System** — Users buy subscriptions or token packs; each AI operation costs tokens

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Routing | React Router 6 |
| Data Fetching | TanStack React Query 5 |
| Animations | Framer Motion |
| Backend | Supabase (PostgreSQL + PostgREST) |
| Auth | Supabase Auth (email/password) |
| Edge Functions | Supabase Edge Functions (Deno) — 98 functions |
| Payments | Stripe (subscriptions + Stripe Connect for creator payouts) |
| Image AI | Replicate (Flux), OpenAI DALL-E 3 |
| Video AI | Replicate (LivePortrait), HeyGen, Runway |
| Voice AI | ElevenLabs (TTS, voice cloning), OpenAI Whisper |
| Avatar AI | Replicate, HuggingFace |
| Email | Resend |
| Storage | Supabase Storage |
| Hosting | Vercel |

---

## Project Structure

```
virtura-ai-canvas/
├── src/
│   ├── pages/           # 42 pages (Dashboard, Studio, Avatar, Admin, etc.)
│   ├── components/      # 288+ React components organized by feature
│   │   ├── ui/          # shadcn/ui base components
│   │   ├── studio/      # Image/video generation UI
│   │   ├── creator/     # Creator tools
│   │   ├── marketplace/ # Campaign marketplace
│   │   ├── social/      # Feed, posts, unlock modals
│   │   ├── admin/       # Admin dashboards
│   │   └── landing/     # Landing page
│   ├── hooks/           # 50+ custom React hooks
│   ├── services/        # Image generation, avatar services
│   ├── integrations/
│   │   └── supabase/    # Supabase client + auto-generated types
│   ├── lib/             # Utils, storage, PDF generator, feature flags
│   ├── App.tsx          # Router + protected routes
│   └── main.tsx         # Entry point
├── supabase/
│   ├── migrations/      # 103 SQL migrations (idempotent pattern)
│   ├── functions/       # 98 edge functions (AI, payments, social, email, admin)
│   └── config.toml      # Edge function JWT settings
├── docs/
│   ├── ENVIRONMENT_VARIABLES.md  # Secrets setup guide
│   ├── MIGRATION_GUIDE.md        # API integration steps
│   └── COST_ESTIMATION.md        # Token pricing & margins
├── vercel.json          # Vercel deployment config
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- A Supabase project
- API keys for the AI services you want to enable (see Environment Variables below)

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/JoinVirtura/virtura-lovable-version.git
cd virtura-lovable-version

# 2. Install dependencies
npm install
# or
bun install

# 3. Create environment file
cp .env.example .env
# Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Start the dev server
npm run dev
# → http://localhost:8080
```

### Available Scripts

```bash
npm run dev        # Start dev server (port 8080, hot reload)
npm run build      # Production build → dist/
npm run build:dev  # Dev mode build
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

---

## Environment Variables

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Supabase Edge Function Secrets

Set these via Supabase CLI or the Supabase dashboard (Settings → Edge Functions → Secrets):

```bash
supabase secrets set REPLICATE_API_KEY=r8_xxx
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set ELEVENLABS_API_KEY=xxx
supabase secrets set HEYGEN_API_KEY=xxx
supabase secrets set RUNWAY_API_KEY=xxx
supabase secrets set HUGGING_FACE_ACCESS_TOKEN=hf_xxx
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_WEBHOOK_CONNECT_SECRET=whsec_xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set FREESOUND_API_KEY=xxx   # Optional
```

| Secret | Service | Required |
|--------|---------|----------|
| `REPLICATE_API_KEY` | Flux images, LivePortrait video, avatars | ✅ |
| `OPENAI_API_KEY` | DALL-E 3, Whisper, GPT avatar personality | ✅ |
| `ELEVENLABS_API_KEY` | TTS, voice cloning | ✅ |
| `HEYGEN_API_KEY` | Talking photo videos | ✅ |
| `RUNWAY_API_KEY` | Gen-2/3 video generation | ✅ |
| `HUGGING_FACE_ACCESS_TOKEN` | Realistic avatar generation | ✅ |
| `STRIPE_SECRET_KEY` | Payments & subscriptions | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Subscription webhook verification | ✅ |
| `STRIPE_WEBHOOK_CONNECT_SECRET` | Creator payout webhook verification | ✅ |
| `RESEND_API_KEY` | Transactional emails | ✅ |
| `FREESOUND_API_KEY` | Audio library search | Optional |

> The following secrets are auto-provisioned inside edge functions and do not need to be set manually: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.

See [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) for detailed setup instructions per API.

---

## Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Authenticate
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push

# Deploy all edge functions
supabase functions deploy

# View secrets
supabase secrets list
```

### Stripe Webhook Endpoints

Register these URLs in your Stripe dashboard (Developers → Webhooks):

| Webhook | URL |
|---------|-----|
| Subscriptions | `https://YOUR_PROJECT.supabase.co/functions/v1/webhook-stripe` |
| Creator Payouts (Connect) | `https://YOUR_PROJECT.supabase.co/functions/v1/webhook-stripe-connect` |

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deployments on push to `main`.

**Vercel settings** (already in `vercel.json`):
- Framework: Vite
- Install command: `bun install`
- Build command: `bun run build`
- Output directory: `dist`

**Environment variables to add in Vercel dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

**Custom Domain**: `virturaai.com` is registered on GoDaddy. Point the `www` CNAME to `cname.vercel-dns.com` after connecting the domain in your Vercel project settings.

---

## Architecture Notes

- **Token deduction** happens before each AI operation to prevent abuse
- **Edge functions** handle all AI calls server-side so API keys are never exposed to the client
- **Identity preservation** is implemented across all models for consistent avatar/character generation
- **Idempotent migrations** — safe to re-run; all migrations check for existence before applying
- **Stripe Connect** enables creator marketplace payouts directly to creator bank accounts
- **React Query** handles all data fetching with caching and background refetching

---

## Documentation

| File | Description |
|------|-------------|
| [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) | API keys and secrets setup |
| [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) | Step-by-step API integration guide |
| [docs/COST_ESTIMATION.md](docs/COST_ESTIMATION.md) | Token pricing, AI costs, and margin analysis |
