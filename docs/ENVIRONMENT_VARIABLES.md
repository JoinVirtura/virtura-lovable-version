# Environment Variables Documentation

> Complete reference for all API keys and secrets required by the Virtura platform.

**Total Secrets Required:** 11 (9 third-party APIs + 2 Stripe webhooks)  
**Auto-Provisioned:** 4 (Supabase internal)

---

## Table of Contents

1. [Required Secrets](#required-secrets)
2. [Auto-Provisioned Secrets](#auto-provisioned-secrets)
3. [Adding Secrets to Supabase](#adding-secrets-to-supabase)
4. [Security Best Practices](#security-best-practices)

---

## Required Secrets

### REPLICATE_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for Replicate AI model inference platform |
| **Format** | `r8_` followed by 40 alphanumeric characters |
| **Example** | `r8_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890` |
| **Where to Get** | [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) |
| **Required** | ✅ Yes |
| **Billing** | Pay-per-use (credit card required) |

**Edge Functions Using This Secret:**
- `generate-image-replicate` - Main image generation
- `style-transfer-replicate` - Image style transfer
- `generate-avatar` - Avatar creation
- `generate-avatar-real` - Realistic avatar generation
- `video-generate-liveportrait` - Video animation
- `video-generate-kling` - Kling video generation
- `face-swap` - Face swapping
- `upscale-image` - Image upscaling
- `remove-background` - Background removal
- `generate-avatar-expression` - Avatar expressions
- ~15 more image/video functions

---

### OPENAI_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for OpenAI services (DALL-E, Whisper, GPT) |
| **Format** | `sk-proj-` followed by ~48 characters |
| **Example** | `sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz123456789012345678` |
| **Where to Get** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Required** | ✅ Yes |
| **Billing** | Pay-per-use (credit card required) |

**Edge Functions Using This Secret:**
- `generate-image-replicate` (DALL-E 3 option)
- `voice-transcribe` - Whisper transcription
- `create-avatar-twin` - AI avatar personality
- `generate-captions` - Video captions

**Cost Reference:**
- DALL-E 3 Standard: $0.04/image
- DALL-E 3 HD: $0.08/image
- Whisper: $0.006/minute

---

### ELEVENLABS_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for ElevenLabs voice synthesis |
| **Format** | `sk_` followed by 32 hex characters |
| **Example** | `sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p` |
| **Where to Get** | [elevenlabs.io](https://elevenlabs.io) → Profile → API Keys |
| **Required** | ✅ Yes |
| **Billing** | Subscription tiers or pay-per-use |

**Edge Functions Using This Secret:**
- `voice-generate` - Text-to-speech generation
- `clone-voice` - Voice cloning
- `get-elevenlabs-voices` - List available voices

**Models Used:**
- `eleven_multilingual_v2` - Premium multilingual
- `eleven_turbo_v2` - Fast generation
- `eleven_monolingual_v1` - English optimized

**Cost Reference:** ~$0.18 per 1,000 characters

---

### HEYGEN_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for HeyGen talking photo video generation |
| **Format** | 32-64 character alphanumeric string |
| **Example** | `hg_1234567890abcdef1234567890abcdef` |
| **Where to Get** | [heygen.com](https://heygen.com) → Settings → API (Enterprise feature) |
| **Required** | ✅ Yes |
| **Billing** | Enterprise subscription required |

**Edge Functions Using This Secret:**
- `video-generate-multi` - Multi-scene video generation
- `video-generate-direct` - Direct video generation
- `check-heygen-status` - Job status polling
- `get-heygen-avatars` - List available avatars

**Important Notes:**
- Requires enterprise account with HeyGen
- Most expensive API: ~$1.93 per minute of video
- Platform charges 75 tokens ($11.25) for 83% margin

---

### RUNWAY_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for Runway AI video generation |
| **Format** | `key_` followed by 24 characters |
| **Example** | `key_AbCdEfGhIjKlMnOpQrStUv` |
| **Where to Get** | [runwayml.com](https://runwayml.com) → Settings → API Keys |
| **Required** | ✅ Yes |
| **Billing** | Subscription required |

**Edge Functions Using This Secret:**
- `video-generate-runway` - Gen-2/Gen-3 video generation

**Subscription Tiers:**
- Basic: $35/mo (625 credits)
- Standard: $75/mo (2,250 credits)
- Pro: $150/mo (4,500 credits)

---

### HUGGING_FACE_ACCESS_TOKEN

| Property | Value |
|----------|-------|
| **Description** | Access token for HuggingFace model inference |
| **Format** | `hf_` followed by 34 characters |
| **Example** | `hf_AbCdEfGhIjKlMnOpQrStUvWxYz12345678` |
| **Where to Get** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| **Required** | ✅ Yes |
| **Billing** | Free tier available, PRO for higher limits |

**Edge Functions Using This Secret:**
- `generate-avatar-real` - Realistic avatar generation
- Model inference endpoints

**Token Permissions:**
- Minimum: `read` access
- Recommended: `read` + `inference` endpoints

---

### STRIPE_SECRET_KEY

| Property | Value |
|----------|-------|
| **Description** | Stripe secret API key for server-side operations |
| **Format** | `sk_live_` or `sk_test_` followed by 24+ characters |
| **Example (Test)** | `sk_test_51ABC...xyz` |
| **Example (Live)** | `sk_live_51ABC...xyz` |
| **Where to Get** | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| **Required** | ✅ Yes |
| **Billing** | Transaction fees (2.9% + $0.30) |

**Edge Functions Using This Secret:**
- `create-checkout` - Subscription checkout sessions
- `create-portal-session` - Customer billing portal
- `create-stripe-connect-account` - Creator onboarding
- `create-stripe-connect-login` - Creator dashboard
- `webhook-stripe` - Payment webhook handler
- `webhook-stripe-connect` - Connect webhook handler
- `process-creator-payout` - Creator payouts
- `create-payment-intent` - One-time payments
- `verify-subscription` - Subscription verification
- Plus 5+ more payment functions

**⚠️ Important:**
- **NEVER** use test keys in production
- **NEVER** expose secret key in frontend code
- Use `pk_live_*` (publishable key) in frontend only

---

### STRIPE_WEBHOOK_SECRET

| Property | Value |
|----------|-------|
| **Description** | Signing secret for platform webhook endpoint |
| **Format** | `whsec_` followed by 32+ characters |
| **Example** | `whsec_1234567890abcdef1234567890abcdef` |
| **Where to Get** | Stripe Dashboard → Webhooks → [endpoint] → Signing secret |
| **Required** | ✅ Yes (CRITICAL) |
| **Billing** | N/A (part of Stripe) |

**Edge Functions Using This Secret:**
- `webhook-stripe` - Handles subscription payments

**Webhook Endpoint:**
```
https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/webhook-stripe
```

**Events to Subscribe:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

### STRIPE_WEBHOOK_CONNECT_SECRET

| Property | Value |
|----------|-------|
| **Description** | Signing secret for Connect webhook endpoint |
| **Format** | `whsec_` followed by 32+ characters |
| **Example** | `whsec_abcdef1234567890abcdef1234567890` |
| **Where to Get** | Stripe Dashboard → Webhooks → [connect endpoint] → Signing secret |
| **Required** | ✅ Yes (for marketplace) |
| **Billing** | N/A (part of Stripe) |

**Edge Functions Using This Secret:**
- `webhook-stripe-connect` - Handles creator payouts

**Webhook Endpoint:**
```
https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/webhook-stripe-connect
```

**Events to Subscribe (Connected Accounts):**
- `account.updated`
- `payout.paid`
- `payout.failed`
- `transfer.created`

---

### RESEND_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for Resend transactional email service |
| **Format** | `re_` followed by 32 characters |
| **Example** | `re_1234567890abcdef1234567890abcdef` |
| **Where to Get** | [resend.com/api-keys](https://resend.com/api-keys) |
| **Required** | ✅ Yes |
| **Billing** | Free tier (3K/mo) or $20/mo (50K/mo) |

**Edge Functions Using This Secret:**
- `send-trial-notification` - Trial expiration emails
- `send-creator-invite` - Campaign invite emails
- `send-notification-email` - General notifications
- Various admin email functions

**Additional Setup Required:**
- Verify sending domain in Resend dashboard
- Add DNS records (DKIM, SPF, DMARC)

---

### FREESOUND_API_KEY

| Property | Value |
|----------|-------|
| **Description** | API key for Freesound audio library |
| **Format** | Alphanumeric string (varies) |
| **Example** | `abc123def456ghi789` |
| **Where to Get** | [freesound.org/apiv2/apply](https://freesound.org/apiv2/apply) |
| **Required** | ⚠️ Optional (audio features) |
| **Billing** | Free |

**Edge Functions Using This Secret:**
- `fetch-freesound-music` - Audio search and retrieval

---

## Auto-Provisioned Secrets

These secrets are automatically available in Supabase Edge Functions and **do not need to be added manually**:

### SUPABASE_URL

| Property | Value |
|----------|-------|
| **Description** | URL of the Supabase project |
| **Format** | `https://[project-ref].supabase.co` |
| **Current Value** | `https://ujaoziqnxhjqlmnvlxav.supabase.co` |
| **Auto-Provisioned** | ✅ Yes |

### SUPABASE_ANON_KEY

| Property | Value |
|----------|-------|
| **Description** | Public anonymous key for client-side operations |
| **Format** | JWT token |
| **Auto-Provisioned** | ✅ Yes |

### SUPABASE_SERVICE_ROLE_KEY

| Property | Value |
|----------|-------|
| **Description** | Service role key for server-side operations (bypasses RLS) |
| **Format** | JWT token |
| **Auto-Provisioned** | ✅ Yes |

**⚠️ Security Warning:** Never expose the service role key in client-side code!

### SUPABASE_DB_URL

| Property | Value |
|----------|-------|
| **Description** | Direct database connection URL |
| **Format** | PostgreSQL connection string |
| **Auto-Provisioned** | ✅ Yes |

---

## Adding Secrets to Supabase

### Method 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ujaoziqnxhjqlmnvlxav)
2. Navigate to **Project Settings** → **Edge Functions**
3. Scroll to **Edge Function Secrets**
4. Click **Add new secret**
5. Enter the secret name (exactly as shown above)
6. Paste the secret value
7. Click **Save**

**Dashboard Link:**
```
https://supabase.com/dashboard/project/ujaoziqnxhjqlmnvlxav/settings/functions
```

### Method 2: Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to project
supabase link --project-ref ujaoziqnxhjqlmnvlxav

# Set a secret
supabase secrets set REPLICATE_API_KEY=r8_your_key_here

# Set multiple secrets
supabase secrets set \
  REPLICATE_API_KEY=r8_xxx \
  OPENAI_API_KEY=sk-proj-xxx \
  ELEVENLABS_API_KEY=sk_xxx

# List all secrets (names only)
supabase secrets list
```

---

## Security Best Practices

### Do's ✅

- Store all secrets in Supabase Edge Function Secrets
- Use test keys during development
- Rotate keys periodically
- Set up usage alerts on API provider dashboards
- Keep a secure backup of all keys
- Use different keys for staging vs production

### Don'ts ❌

- Never commit secrets to git
- Never expose secret keys in frontend code
- Never share keys via email or chat
- Never use production keys in local development
- Never hardcode secrets in edge functions

### Key Rotation Checklist

When rotating a key:

1. Generate new key from provider
2. Add new key to Supabase secrets
3. Test functionality
4. Revoke old key from provider
5. Document rotation date

---

## Quick Copy Template

Use this template when setting up secrets:

```
REPLICATE_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
HEYGEN_API_KEY=
RUNWAY_API_KEY=
HUGGING_FACE_ACCESS_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_WEBHOOK_CONNECT_SECRET=
RESEND_API_KEY=
FREESOUND_API_KEY=
```

---

## Verification Commands

After adding secrets, verify they're accessible:

```bash
# Check if secrets are set (via CLI)
supabase secrets list

# Test edge function that uses secrets
curl -X POST https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/health-check
```

---

*For step-by-step setup instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)*
