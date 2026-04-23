# Virtura Auth Email Templates

Branded HTML templates that replace the default Supabase auth emails.

## Files

| Template | When it's sent | Supabase dashboard slot |
|---|---|---|
| `confirmation.html` | New signup — activate account | **Confirm signup** |
| `recovery.html` | Password reset request | **Reset password** |
| `magic-link.html` | Passwordless magic link login | **Magic Link** |
| `email-change.html` | User changes their email address | **Change Email Address** |
| `invite.html` | Admin invites a user via dashboard | **Invite user** |

## Deploying to production

`supabase/config.toml` wires these templates in for **local dev only** (`supabase start`). The hosted project reads its templates from the dashboard, so you must copy them there manually:

1. Open the Supabase dashboard → **Authentication → Email Templates**
2. For each template above, paste the HTML from the corresponding file into the matching dashboard slot.
3. Update the **Subject** fields to match `config.toml` (e.g. *"Welcome to Virtura — activate your account"*).
4. Save.

### URL configuration (critical — this is why the link was broken)

In the dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://virtura.app`
- **Redirect URLs** (allowlist): add both
  - `https://virtura.app/auth/callback`
  - `http://localhost:5173/auth/callback` (for local testing)

The signup flow calls `supabase.auth.signUp({ options: { emailRedirectTo: "<origin>/auth/callback" } })`. If that URL isn't in the allowlist, Supabase silently falls back to Site URL and the link breaks — that's the bug that had to be fixed for VTR-012.

### Sender identity (optional but recommended)

Default Supabase auth emails go from `noreply@mail.app.supabase.io`. To send from a Virtura domain:

1. Dashboard → **Authentication → SMTP Settings** → enable custom SMTP
2. Point it at Resend (the same provider the edge functions already use) with a verified `virtura.app` or `virtura.com` sender
3. Set `Sender name` = `Virtura` and `Sender email` = e.g. `hello@virtura.app`

## Template variables

These templates use Supabase's Go template syntax. Available vars:

- `{{ .ConfirmationURL }}` — the one-click action URL (includes `token_hash`, `type`, and `redirect_to`)
- `{{ .Email }}` — recipient's email
- `{{ .NewEmail }}` — only in `email-change.html`
- `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}`

## Design notes

- Dark outer background (`#0B0617`) with a white content card — premium feel, matches the landing page
- Purple → pink gradient header (`#8B5CF6 → #EC4899`) matches existing marketplace approval emails and sidebar branding
- Table-based layout for Outlook / Gmail compatibility
- Mobile-responsive via a single `@media` query (scales hero, stacks CTA full-width)
- Preheader text hidden in a 0-opacity `<div>` (shows up in inbox preview)

## Editing checklist

After editing any template:

- [ ] Paste updated HTML into the matching dashboard slot
- [ ] Send yourself a test email (dashboard → **Send test email**)
- [ ] Open it in Gmail (desktop + mobile) and Apple Mail to spot-check layout
- [ ] Click the CTA — confirm it lands on `/auth/callback` and redirects to `/dashboard` with an active session
