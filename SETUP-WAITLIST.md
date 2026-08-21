# Waitlist form — setup

Working end-to-end on `localhost` (SMTP, Sheet, and email confirmed via direct testing). This
file documents the config so it can be reproduced in Vercel — it intentionally contains no
secrets; real values live only in `.env.local` (gitignored) and in Vercel's own env var store.

## Local config (`.env.local`, gitignored — never commit this file)

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=<owner mailbox, e.g. contact@therora.in>
SMTP_PASS=<Gmail/Workspace App Password for that mailbox>
NOTIFY_TO=<owner mailbox — where signup notifications go>
GOOGLE_SHEET_WEBHOOK_URL=<the Apps Script /exec URL>
SHEET_SECRET=<the same random string set in the Apps Script>
```

## Google Sheet + Apps Script webhook

Already deployed. To redeploy from scratch (e.g. a new sheet):

1. Create a Sheet at https://sheets.new.
2. **Extensions ▸ Apps Script** — paste in
   [`scripts/waitlist-sheet-webhook.gs`](scripts/waitlist-sheet-webhook.gs). Replace
   `SHARED_SECRET` in the script editor directly with a random string of your own — **do not**
   commit the real value into this repo; it must only exist in the Apps Script editor and as the
   `SHEET_SECRET` env var.
3. **Deploy ▸ New deployment ▸ Web app** — Execute as **Me**, Who has access **Anyone** — Deploy,
   authorize it.
4. Copy the **Web app URL** (ends in `/exec`) into `GOOGLE_SHEET_WEBHOOK_URL`.

## Deploying to Vercel

Add the same six variables from `.env.local` above to the Vercel project:
**Settings ▸ Environment Variables** (Production, and Preview if you want the form to work on
preview deployments too). Then push — Vercel redeploys automatically on push to `main`; if the
env vars are added after a deploy already ran, trigger a redeploy from the Vercel dashboard so
it picks them up.

## What happens on a real submission

- The signer gets a confirmation email ("You're on the list").
- The owner mailbox (`NOTIFY_TO`) gets a notification email with the signer's details, reply-to
  set to the signer so you can just hit reply.
- A row is appended to the Google Sheet.

All three are attempted independently — if one integration is down or misconfigured, the other
two still go through, and the visitor still sees "You're on the list" as long as their email
address itself was valid. Errors are logged server-side (the terminal running `next dev`
locally; Vercel's function logs in production).

## Known caveat: browser autofill vs. the honeypot field

The spam-honeypot field (`hp_field`) is hidden via `display:none` specifically because some
browsers' autofill will silently fill an off-screen-but-technically-visible hidden field if its
`name` matches a saved profile category (this happened once with `name="company"` — Chrome
autofilled it from a saved "Company" value, which made every submission look like a bot and
silently skip sending mail). If a future edit ever changes the honeypot field's name or hiding
technique, retest with autofill/password-manager extensions active, not just a clean browser.
