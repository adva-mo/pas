# Project conventions

## Bot
- All bot messages in Hebrew
- Use `createSupabaseServiceClient()` (service role) in every bot handler and API route
- Local bot testing: `npm run bot:dev` (polling mode — no ngrok needed)
- To restore the production webhook:
  ```
  curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
    -d "url=https://pas-advamos-projects.vercel.app/api/telegram/webhook?x-vercel-protection-bypass=<VERCEL_PROTECTION_BYPASS>" \
    -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
    -d "drop_pending_updates=true"
  ```
  All values are in `.env.local`.
- Preview env testing: point the webhook at the Vercel preview URL with the protection bypass token:
  ```
  curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
    -d "url=https://<preview-url>/api/telegram/webhook?x-vercel-protection-bypass=<BYPASS_SECRET>" \
    -d "secret_token=<WEBHOOK_SECRET>"
  ```
  Bypass secret is in Vercel → Settings → Deployment Protection. Bot token and webhook secret are in `.env.local`.

## Database
- Migrations are applied manually in the Supabase SQL editor — they do not run automatically on deploy

## Testing
- `npm test` — tsc type-check + Vitest (40 tests across bot handlers and webhook route)
