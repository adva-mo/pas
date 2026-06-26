# Project conventions

## Bot
- All bot messages in Hebrew
- Use `createSupabaseServiceClient()` (service role) in every bot handler and API route
- Local bot testing: `npm run bot:dev` (polling mode — no ngrok needed)

## Database
- Migrations are applied manually in the Supabase SQL editor — they do not run automatically on deploy

## Testing
- `npm test` — Vitest, 14 tests across bot handlers and webhook route
