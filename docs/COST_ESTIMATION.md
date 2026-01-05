# Cost Estimation & Financial Projections

> Detailed breakdown of API costs, revenue projections, and scaling estimates for the Virtura platform.

**Last Updated:** January 2025  
**Token Value:** $0.15 per token (internal reference)

---

## Table of Contents

1. [Token System Overview](#1-token-system-overview)
2. [Subscription Revenue](#2-subscription-revenue)
3. [API Costs Per Operation](#3-api-costs-per-operation)
4. [Monthly Cost Estimates by Scale](#4-monthly-cost-estimates-by-scale)
5. [Profit Margin Analysis](#5-profit-margin-analysis)
6. [Fixed Monthly Costs](#6-fixed-monthly-costs)
7. [Cost Monitoring & Optimization](#7-cost-monitoring--optimization)

---

## 1. Token System Overview

### How Tokens Work

- Users purchase tokens via subscriptions or token packs
- Each AI operation costs a specific number of tokens
- Tokens are deducted BEFORE operations (prevents abuse)
- Admins have unlimited tokens

### Token Costs by Operation

| Operation | Tokens | Effective Revenue |
|-----------|--------|-------------------|
| Flux Schnell Image | 1 | $0.15 |
| Flux Dev Image | 3 | $0.45 |
| Flux Pro Image | 4 | $0.60 |
| DALL-E 3 Standard | 4 | $0.60 |
| DALL-E 3 HD | 8 | $1.20 |
| Voice (per 1K chars) | 1 | $0.15 |
| LivePortrait Video | 6 | $0.90 |
| Kling Motion Video | 16 | $2.40 |
| HeyGen Video | 75 | $11.25 |
| Style Transfer | 2-4 | $0.30-0.60 |
| Avatar Generation | 2-5 | $0.30-0.75 |
| Background Removal | 1 | $0.15 |
| Image Upscaling | 2 | $0.30 |
| Face Swap | 3 | $0.45 |

---

## 2. Subscription Revenue

### Pricing Tiers

| Plan | Monthly Price | Tokens | $/Token | Target User |
|------|--------------|--------|---------|-------------|
| **Starter** | $29 | 120 | $0.24 | Hobbyists |
| **Pro** | $129 | 700 | $0.18 | Creators |
| **Enterprise** | $349 | 2,200 | $0.16 | Agencies |

### Token Packs (One-Time)

| Pack | Price | Tokens | $/Token |
|------|-------|--------|---------|
| Small | $15 | 100 | $0.15 |
| Medium | $45 | 350 | $0.13 |
| Large | $99 | 800 | $0.12 |

### Annual Revenue per User

| Plan | Monthly | Annual | Tokens/Year |
|------|---------|--------|-------------|
| Starter | $29 | $348 | 1,440 |
| Pro | $129 | $1,548 | 8,400 |
| Enterprise | $349 | $4,188 | 26,400 |

---

## 3. API Costs Per Operation

### Image Generation

| Model | Provider | API Cost | Tokens | Margin |
|-------|----------|----------|--------|--------|
| Flux Schnell | Replicate | $0.003 | 1 | **95%** |
| Flux Dev | Replicate | $0.025 | 3 | **94%** |
| Flux 1.1 Pro | Replicate | $0.04 | 4 | **93%** |
| DALL-E 3 Standard | OpenAI | $0.04 | 4 | **93%** |
| DALL-E 3 HD | OpenAI | $0.08 | 8 | **93%** |

### Voice Generation

| Model | Provider | API Cost | Tokens | Margin |
|-------|----------|----------|--------|--------|
| Multilingual V2 (1K chars) | ElevenLabs | $0.18 | 1 | **-20%** ⚠️ |
| Turbo V2 (1K chars) | ElevenLabs | $0.08 | 1 | **47%** |
| Standard (1K chars) | ElevenLabs | $0.03 | 1 | **80%** |

> ⚠️ **Note:** Voice generation on premium models operates at a loss. Consider increasing token cost or using turbo models by default.

### Video Generation

| Model | Provider | API Cost | Tokens | Margin |
|-------|----------|----------|--------|--------|
| LivePortrait | Replicate | $0.06 | 6 | **93%** |
| Kling Motion | Replicate | $0.38 | 16 | **84%** |
| HeyGen (1 min) | HeyGen | $1.93 | 75 | **83%** |
| Runway Gen-2 | Runway | ~$0.50 | 8 | **84%** |

### Other Operations

| Operation | Provider | API Cost | Tokens | Margin |
|-----------|----------|----------|--------|--------|
| Style Transfer | Replicate | $0.02 | 2 | **93%** |
| Avatar (InstantID) | Replicate | $0.03 | 3 | **93%** |
| Avatar Real | HuggingFace | $0.01 | 2 | **97%** |
| Background Remove | Replicate | $0.01 | 1 | **93%** |
| Upscale 4x | Replicate | $0.02 | 2 | **93%** |
| Whisper Transcribe | OpenAI | $0.006/min | 1 | **96%** |

---

## 4. Monthly Cost Estimates by Scale

### Assumptions

- Average user consumes 80% of monthly tokens
- Usage distribution: 60% images, 25% voice, 15% video
- User mix: 70% Starter, 25% Pro, 5% Enterprise

### 100 Users Scenario

| Category | Calculation | Monthly Cost |
|----------|-------------|--------------|
| **Users** | 70 Starter + 25 Pro + 5 Enterprise | |
| **Tokens Used** | (70×96) + (25×560) + (5×1,760) = 29,520 | |
| **Image Ops** | 17,712 tokens @ $0.008 avg | $142 |
| **Voice Ops** | 7,380 tokens @ $0.10 avg | $738 |
| **Video Ops** | 4,428 tokens @ $0.05 avg | $221 |
| **Total API Costs** | | **$1,101** |
| **Revenue** | (70×$29) + (25×$129) + (5×$349) | **$6,000** |
| **Gross Profit** | | **$4,899 (82%)** |

### 1,000 Users Scenario

| Category | Calculation | Monthly Cost |
|----------|-------------|--------------|
| **Users** | 700 Starter + 250 Pro + 50 Enterprise | |
| **Tokens Used** | 295,200 tokens | |
| **Image Ops** | 177,120 tokens | $1,417 |
| **Voice Ops** | 73,800 tokens | $7,380 |
| **Video Ops** | 44,280 tokens | $2,214 |
| **Total API Costs** | | **$11,011** |
| **Revenue** | | **$60,000** |
| **Gross Profit** | | **$48,989 (82%)** |

### 10,000 Users Scenario

| Category | Calculation | Monthly Cost |
|----------|-------------|--------------|
| **Users** | 7,000 Starter + 2,500 Pro + 500 Enterprise | |
| **Tokens Used** | 2,952,000 tokens | |
| **Image Ops** | 1,771,200 tokens | $14,170 |
| **Voice Ops** | 738,000 tokens | $73,800 |
| **Video Ops** | 442,800 tokens | $22,140 |
| **Total API Costs** | | **$110,110** |
| **Revenue** | | **$600,000** |
| **Gross Profit** | | **$489,890 (82%)** |

---

## 5. Profit Margin Analysis

### By Operation Type

| Operation Type | Avg API Cost | Avg Revenue | Margin |
|---------------|--------------|-------------|--------|
| Image Generation | $0.008-0.08 | $0.15-1.20 | **85-95%** |
| Voice Generation | $0.03-0.18 | $0.15 | **-20% to 80%** |
| Video Generation | $0.06-1.93 | $0.90-11.25 | **83-93%** |
| Utilities | $0.01-0.03 | $0.15-0.45 | **93-97%** |

### High-Margin Operations (Prioritize)

1. ✅ Flux Schnell Images (95% margin)
2. ✅ Background Removal (93% margin)
3. ✅ Avatar Real (97% margin)
4. ✅ LivePortrait Videos (93% margin)

### Low-Margin Operations (Monitor)

1. ⚠️ ElevenLabs Multilingual (-20% margin)
2. ⚠️ HeyGen Videos (83% margin - high volume risk)
3. ⚠️ DALL-E 3 HD (93% margin but high API cost)

### Recommendations

1. **Increase voice token cost** from 1 to 2 tokens for premium voices
2. **Limit HeyGen access** to Pro/Enterprise tiers
3. **Default to Flux Schnell** for casual image generation
4. **Offer Flux Pro** as premium option (higher margin)

---

## 6. Fixed Monthly Costs

### Infrastructure

| Service | Free Tier | Recommended | Enterprise |
|---------|-----------|-------------|------------|
| **Supabase** | $0 | $25/mo (Pro) | $599/mo |
| **Vercel/Hosting** | $0 | $20/mo | $150/mo |
| **Domain** | N/A | $15/year | $15/year |
| **SSL** | Free | Free | Free |
| **Monitoring** | $0 | $30/mo | $100/mo |

### Recommended Monthly Fixed Costs

| Scale | Supabase | Hosting | Other | Total |
|-------|----------|---------|-------|-------|
| Startup (<100 users) | $25 | $0 | $10 | **$35** |
| Growth (100-1K users) | $25 | $20 | $30 | **$75** |
| Scale (1K-10K users) | $75 | $50 | $75 | **$200** |
| Enterprise (10K+ users) | $599 | $150 | $200 | **$949** |

### Email Costs (Resend)

| Volume | Plan | Cost |
|--------|------|------|
| < 3,000/month | Free | $0 |
| < 50,000/month | Pro | $20/mo |
| < 100,000/month | Business | $45/mo |

---

## 7. Cost Monitoring & Optimization

### API Provider Dashboards

Monitor costs in real-time at:

| Provider | Dashboard URL |
|----------|--------------|
| Replicate | [replicate.com/account](https://replicate.com/account) |
| OpenAI | [platform.openai.com/usage](https://platform.openai.com/usage) |
| ElevenLabs | [elevenlabs.io/subscription](https://elevenlabs.io/subscription) |
| Stripe | [dashboard.stripe.com](https://dashboard.stripe.com) |
| Resend | [resend.com/overview](https://resend.com/overview) |

### Budget Alerts

Set up alerts at these thresholds:

| Provider | Warning | Critical | Action |
|----------|---------|----------|--------|
| Replicate | $100 | $500 | Review usage patterns |
| OpenAI | $50 | $200 | Check DALL-E usage |
| ElevenLabs | $50 | $200 | Audit voice generation |
| HeyGen | $200 | $1,000 | Limit access immediately |

### Database Cost Queries

Use the `api_cost_tracking` table to monitor costs:

```sql
-- Daily costs by provider
SELECT 
  DATE(created_at) as date,
  api_provider,
  SUM(cost_usd) as total_cost,
  COUNT(*) as operations
FROM api_cost_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY date, api_provider
ORDER BY date DESC, total_cost DESC;

-- Top users by cost
SELECT 
  user_id,
  SUM(cost_usd) as total_cost,
  COUNT(*) as operations
FROM api_cost_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_cost DESC
LIMIT 20;

-- Cost by resource type
SELECT 
  resource_type,
  model_used,
  SUM(cost_usd) as total_cost,
  AVG(cost_usd) as avg_cost,
  COUNT(*) as operations
FROM api_cost_tracking
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY resource_type, model_used
ORDER BY total_cost DESC;

-- Revenue vs Cost (requires token_transactions join)
SELECT 
  DATE(a.created_at) as date,
  SUM(a.cost_usd) as api_costs,
  SUM(a.tokens_charged * 0.15) as token_revenue,
  SUM(a.tokens_charged * 0.15) - SUM(a.cost_usd) as gross_profit
FROM api_cost_tracking a
WHERE a.created_at > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;
```

### Cost Optimization Strategies

1. **Model Selection**
   - Default to cheaper models (Flux Schnell over Pro)
   - Offer premium models as upgrades

2. **Caching**
   - Cache common voice generations
   - Store generated avatars for reuse

3. **Rate Limiting**
   - Implement per-user daily limits
   - Throttle during high-traffic periods

4. **Tiered Access**
   - Reserve expensive operations for higher tiers
   - HeyGen only for Pro/Enterprise

5. **Batch Operations**
   - Bundle small operations
   - Reduce per-request overhead

---

## Summary

### Key Metrics

| Metric | Value |
|--------|-------|
| Average Margin (All Ops) | **85%** |
| Break-even Point | ~5 Starter subscribers |
| Most Profitable Op | Avatar Real (97%) |
| Least Profitable Op | Voice Premium (-20%) |
| Recommended Starter Fixed Costs | **$35/month** |

### Monthly P&L Template

| Line Item | 100 Users | 1,000 Users | 10,000 Users |
|-----------|-----------|-------------|--------------|
| Subscription Revenue | $6,000 | $60,000 | $600,000 |
| API Costs | ($1,101) | ($11,011) | ($110,110) |
| Fixed Costs | ($75) | ($200) | ($949) |
| **Net Profit** | **$4,824** | **$48,789** | **$488,941** |
| **Net Margin** | **80%** | **81%** | **81%** |

---

*For setup instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)*  
*For secret configuration, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)*
