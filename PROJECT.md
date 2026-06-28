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

## Database
- Migrations are applied manually in the Supabase SQL editor — they do not run automatically on deploy

## Testing
- `npm test` — Vitest, 14 tests across bot handlers and webhook route
