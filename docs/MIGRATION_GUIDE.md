# Virtura Platform Migration Guide

> Complete step-by-step instructions for transferring ownership and setting up all API integrations.

**Estimated Setup Time:** 2-3 hours  
**Last Updated:** January 2025

---

## Table of Contents

1. [Pre-Transfer Checklist](#1-pre-transfer-checklist)
2. [API Account Setup](#2-api-account-setup)
3. [Stripe Webhook Configuration](#3-stripe-webhook-configuration)
4. [Post-Transfer Verification](#4-post-transfer-verification)

---

## 1. Pre-Transfer Checklist

### Required Accounts to Create

| Service | Purpose | Billing Required | Estimated Monthly Cost |
|---------|---------|------------------|------------------------|
| Replicate | AI image/video generation | Yes (pay-per-use) | $50-500+ |
| OpenAI | DALL-E images, Whisper transcription | Yes (pay-per-use) | $10-100+ |
| ElevenLabs | Voice synthesis | Yes (subscription or pay-per-use) | $5-99+ |
| HeyGen | Talking photo videos | Yes (enterprise) | $89-500+ |
| Runway | Video generation | Yes (subscription) | $35-150+ |
| HuggingFace | Avatar model inference | Free tier available | $0-50+ |
| Stripe | Payments & subscriptions | Transaction fees only | Variable |
| Resend | Transactional emails | Free tier available | $0-25+ |
| Freesound | Audio library | Free | $0 |

### Business Information Needed

For **Stripe Connect** (marketplace payouts), you'll need:
- Legal business name and address
- Tax identification number (EIN or SSN)
- Bank account for payouts
- Business website URL

### Before You Begin

- [ ] Ensure you have admin access to the Supabase project
- [ ] Have a credit card ready for API billing accounts
- [ ] Prepare a spreadsheet to track all API keys generated
- [ ] Set aside 2-3 uninterrupted hours for setup

---

## 2. API Account Setup

### 2.1 Replicate

**Purpose:** Powers 15+ AI functions including image generation (Flux), video generation (LivePortrait), style transfer, and avatar creation.

**Setup Steps:**

1. Go to [replicate.com](https://replicate.com) and sign up
2. Navigate to **Account Settings** → **API Tokens**
3. Click **Create Token**
4. Copy the token (format: `r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
5. Set up billing at **Billing** → **Add Payment Method**

**Recommended Settings:**
- Enable usage alerts at $50, $100, $500
- Set a hard spending limit if desired

**Models Used:**
- `black-forest-labs/flux-schnell` - Fast image generation
- `black-forest-labs/flux-dev` - High-quality images
- `black-forest-labs/flux-1.1-pro` - Pro images
- `zsxkib/instant-id` - Avatar generation
- `fofr/liveportrait` - Video animation
- Various other image/video models

**Secret Name:** `REPLICATE_API_KEY`

---

### 2.2 OpenAI

**Purpose:** DALL-E 3 image generation, Whisper audio transcription, avatar twin creation.

**Setup Steps:**

1. Go to [platform.openai.com](https://platform.openai.com) and sign up
2. Navigate to **API Keys** in the left sidebar
3. Click **Create new secret key**
4. Name it (e.g., "Virtura Production")
5. Copy the key (format: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. Set up billing at **Settings** → **Billing**

**Recommended Settings:**
- Set monthly budget limit under **Usage limits**
- Enable email alerts for usage thresholds

**Models Used:**
- `dall-e-3` - High-quality image generation (HD: $0.08/image)
- `whisper-1` - Audio transcription ($0.006/minute)
- `gpt-4o-mini` - Avatar twin AI (if applicable)

**Secret Name:** `OPENAI_API_KEY`

---

### 2.3 ElevenLabs

**Purpose:** AI voice generation for avatar voiceovers and text-to-speech.

**Setup Steps:**

1. Go to [elevenlabs.io](https://elevenlabs.io) and sign up
2. Navigate to **Profile** → **API Keys**
3. Click **Create API Key**
4. Copy the key (format: `sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
5. Choose a subscription plan based on expected usage

**Subscription Tiers:**
- Free: 10,000 characters/month
- Starter ($5/mo): 30,000 characters/month
- Creator ($22/mo): 100,000 characters/month
- Pro ($99/mo): 500,000 characters/month

**Models Used:**
- `eleven_multilingual_v2` - Premium multilingual voices
- `eleven_turbo_v2` - Fast voice generation

**Pricing:** ~$0.18 per 1,000 characters (varies by plan)

**Secret Name:** `ELEVENLABS_API_KEY`

---

### 2.4 HeyGen

**Purpose:** Premium talking photo video generation (highest quality, enterprise-grade).

**Setup Steps:**

1. Go to [heygen.com](https://heygen.com) and sign up
2. Contact sales for API access (enterprise feature)
3. Once approved, navigate to **Settings** → **API**
4. Generate an API key
5. Copy the key

**Important Notes:**
- HeyGen API is an enterprise feature requiring business verification
- Pricing: ~$1.93 per minute of video generated
- This is the platform's most expensive API operation
- Consider limiting access to Pro/Enterprise subscribers

**Token Cost:** 75 tokens per video (at $0.15/token = $11.25 revenue vs $1.93 cost = 83% margin)

**Secret Name:** `HEYGEN_API_KEY`

---

### 2.5 Runway

**Purpose:** AI video generation and motion effects.

**Setup Steps:**

1. Go to [runwayml.com](https://runwayml.com) and sign up
2. Navigate to **Settings** → **API Keys**
3. Create a new API key
4. Copy the key (format: `key_xxxxxxxxxxxxxxxx`)
5. Set up billing/subscription

**Subscription Options:**
- Basic ($35/mo): 625 credits
- Standard ($75/mo): 2,250 credits
- Pro ($150/mo): 4,500 credits

**Secret Name:** `RUNWAY_API_KEY`

---

### 2.6 HuggingFace

**Purpose:** AI model inference for realistic avatar generation.

**Setup Steps:**

1. Go to [huggingface.co](https://huggingface.co) and sign up
2. Navigate to **Settings** → **Access Tokens**
3. Click **New token**
4. Select "Read" permission (or "Write" if using private models)
5. Copy the token (format: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

**Pricing:**
- Free tier: Limited inference
- PRO ($9/mo): Faster inference, more models
- Enterprise: Custom pricing

**Secret Name:** `HUGGING_FACE_ACCESS_TOKEN`

---

### 2.7 Stripe

**Purpose:** Payment processing, subscriptions, marketplace payouts (Connect).

**Setup Steps:**

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (required for payouts)
3. Navigate to **Developers** → **API Keys**
4. Copy both:
   - **Publishable key:** `pk_live_xxxxxxxx` (used in frontend)
   - **Secret key:** `sk_live_xxxxxxxx` (used in backend)

**Critical Configuration:**
- Enable **Stripe Connect** for marketplace creator payouts
- Set up webhook endpoints (see Section 3)
- Configure tax settings if applicable
- Set up payout schedule

**Test Mode:**
- Use `sk_test_xxxxxxxx` keys for development
- Switch to `sk_live_xxxxxxxx` for production

**Secret Name:** `STRIPE_SECRET_KEY`

---

### 2.8 Resend

**Purpose:** Transactional emails (trial notifications, creator invites, password resets).

**Setup Steps:**

1. Go to [resend.com](https://resend.com) and sign up
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Copy the key (format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
5. **Important:** Verify your sending domain under **Domains**

**Domain Verification:**
1. Add your domain (e.g., `virtura.app`)
2. Add the required DNS records (DKIM, SPF, DMARC)
3. Wait for verification (usually 24-48 hours)

**Pricing:**
- Free: 3,000 emails/month
- Pro ($20/mo): 50,000 emails/month

**Secret Name:** `RESEND_API_KEY`

---

### 2.9 Freesound

**Purpose:** Royalty-free audio and music library for content creation.

**Setup Steps:**

1. Go to [freesound.org](https://freesound.org) and create an account
2. Navigate to [freesound.org/apiv2/apply](https://freesound.org/apiv2/apply)
3. Apply for API access (include app description)
4. Once approved, copy your **API Key**

**Pricing:** Free (with attribution requirements for some sounds)

**Secret Name:** `FREESOUND_API_KEY`

---

## 3. Stripe Webhook Configuration

> ⚠️ **CRITICAL:** Webhooks must be configured correctly for payments to work!

### 3.1 Platform Webhook (Subscriptions & Payments)

This webhook handles subscription purchases, renewals, and one-time payments.

**Setup Steps:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter the endpoint URL:
   ```
   https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/webhook-stripe
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Click **Add endpoint**
6. Click on the endpoint → **Reveal** under "Signing secret"
7. Copy the signing secret (format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

**Secret Name:** `STRIPE_WEBHOOK_SECRET`

---

### 3.2 Connect Webhook (Creator Payouts)

This webhook handles Stripe Connect events for creator marketplace payouts.

**Setup Steps:**

1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter the endpoint URL:
   ```
   https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/webhook-stripe-connect
   ```
4. **Important:** Under "Listen to," select **Events on Connected accounts**
5. Select events:
   - `account.updated`
   - `account.application.deauthorized`
   - `payout.paid`
   - `payout.failed`
   - `payment_intent.succeeded`
   - `transfer.created`

6. Click **Add endpoint**
7. Copy the signing secret

**Secret Name:** `STRIPE_WEBHOOK_CONNECT_SECRET`

---

### 3.3 Webhook Testing

**Test in Stripe Test Mode:**

1. Use Stripe CLI for local testing:
   ```bash
   stripe listen --forward-to https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/webhook-stripe
   ```

2. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. Check Supabase Edge Function logs for confirmation

**Verify in Production:**

1. Make a test purchase using a real card
2. Check user_tokens table for token credit
3. Check token_transactions for transaction record

---

## 4. Post-Transfer Verification

### 4.1 Authentication Testing

- [ ] Sign up with email/password
- [ ] Sign up with Google OAuth (if configured)
- [ ] Password reset flow
- [ ] Email verification

### 4.2 Payment Testing

- [ ] Subscribe to Starter plan
- [ ] Verify tokens credited (120 tokens)
- [ ] Test plan upgrade
- [ ] Test plan cancellation
- [ ] Purchase token pack

### 4.3 AI Generation Testing

Test each AI feature with minimal inputs:

- [ ] Generate image (Flux Schnell - 1 token)
- [ ] Generate voice (ElevenLabs - 1 token)
- [ ] Generate video (LivePortrait - 6 tokens)
- [ ] Style transfer (2-4 tokens)
- [ ] Avatar generation (2-5 tokens)

### 4.4 Storage Testing

- [ ] Upload profile avatar
- [ ] Upload media to library
- [ ] Download/access stored files

### 4.5 Email Testing

- [ ] Trigger trial expiration notification
- [ ] Test creator invite email
- [ ] Test password reset email

### 4.6 Marketplace Testing

- [ ] Create brand account
- [ ] Create creator account
- [ ] Post a campaign
- [ ] Apply to campaign
- [ ] Test contract signing

---

## Quick Reference: All Secrets

| Secret Name | Source | Required |
|-------------|--------|----------|
| `REPLICATE_API_KEY` | replicate.com/account | ✅ |
| `OPENAI_API_KEY` | platform.openai.com/api-keys | ✅ |
| `ELEVENLABS_API_KEY` | elevenlabs.io/profile | ✅ |
| `HEYGEN_API_KEY` | heygen.com (enterprise) | ✅ |
| `RUNWAY_API_KEY` | runwayml.com/settings | ✅ |
| `HUGGING_FACE_ACCESS_TOKEN` | huggingface.co/settings/tokens | ✅ |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com/apikeys | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook settings | ✅ |
| `STRIPE_WEBHOOK_CONNECT_SECRET` | Stripe Connect webhook | ✅ |
| `RESEND_API_KEY` | resend.com/api-keys | ✅ |
| `FREESOUND_API_KEY` | freesound.org/apiv2/apply | ⚠️ Optional |

---

## Support & Troubleshooting

### Common Issues

**"Tokens not credited after purchase"**
- Check webhook configuration
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check edge function logs

**"AI generation failing"**
- Verify API key is correct
- Check API provider billing status
- Review edge function logs for errors

**"Emails not sending"**
- Verify Resend domain is verified
- Check `RESEND_API_KEY`
- Confirm sender email matches verified domain

### Edge Function Logs

Monitor edge function execution at:
```
https://supabase.com/dashboard/project/ujaoziqnxhjqlmnvlxav/functions
```

### API Provider Dashboards

- Replicate: https://replicate.com/account
- OpenAI: https://platform.openai.com/usage
- ElevenLabs: https://elevenlabs.io/usage
- Stripe: https://dashboard.stripe.com
- Resend: https://resend.com/logs

---

*This guide excludes Supabase project transfer instructions, which will be handled separately.*
