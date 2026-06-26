# PAS — Daily Work Reporting System

Employees submit daily reports via a Telegram bot. Admins review them on a mobile-first web dashboard.

## Stack

- **Next.js 16** (App Router) — frontend + API routes
- **Supabase** — Postgres database + Auth
- **Telegraf** — Telegram bot (webhook-based)
- **Vercel** — hosting

---

## Setup

### 1. Supabase project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial.sql`
3. Go to **Authentication → Providers** — Email is already enabled by default
4. Create the first admin user:
   - Go to **Authentication → Users → Add user**
   - Enter the admin email and password
   - Copy the new user's UUID
5. Insert the admin record in **Table Editor → admins**:
   ```sql
   INSERT INTO admins (user_id) VALUES ('<admin-uuid-here>');
   ```
6. Collect the credentials from **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Telegram bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. `/newbot` → follow the prompts → copy the token → `TELEGRAM_BOT_TOKEN`
3. Generate a random secret string → `TELEGRAM_WEBHOOK_SECRET` (e.g. `openssl rand -hex 32`)
4. After deploying (step 5), register the webhook:
   ```
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-domain>/api/telegram/webhook&secret_token=<WEBHOOK_SECRET>"
   ```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```

### 4. Local development

```bash
npm install
npm run dev        # Next.js on http://localhost:3000
```

To test the bot locally without ngrok, run it in polling mode in a second terminal:

```bash
npm run bot:dev
```

In polling mode the bot connects directly to Telegram — no public URL needed. While `bot:dev` is running, the production webhook is paused; it resumes automatically when you stop the script.

### 5. Deploy to Vercel

Connect the GitHub repo in the Vercel dashboard, set the environment variables, and deploy. Or:

```bash
vercel --prod
```

---

## Employee onboarding

Employees self-register — no admin action required beforehand.

1. Employee opens the bot and sends `/start`
2. Bot asks for their full name
3. Employee types their name → account is created automatically
4. Bot proceeds directly to the daily report flow

Admin can rename or deactivate employees from the dashboard at any time. A deactivated employee cannot submit reports until reactivated.

---

## Admin dashboard

| Page | URL |
|---|---|
| Reports | `/reports` |
| Report detail / edit | `/reports/<id>` |
| Employees | `/employees` |
| Projects | `/projects` |

### Projects setup

Before employees can submit reports, add projects on the Projects page. The migration seeds two example projects (Office, Remote) — edit or delete them as needed.

---

## Bot flow

**First-time user:**
```
/start
  → "שלום 👋 איך קוראים לך?"  [Telegram display name suggested]
  → Employee types full name
  → Account created → continues to report flow
```

**Returning user:**
```
/start
  → "היי [name]! בוא נגיש את הדוח היומי."
  → [Project buttons]
  → Employee taps a project
  → "מה עשית היום?"
  → Employee types work description
  → "יש הערות?" [Skip button]
  → Employee types notes or taps Skip
  → Summary shown + [✓ אשר] [↩ התחל מחדש]
  → "הדוח נשמר. ✓"
```

---

## Testing

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Unit tests cover the bot handler state machine (`lib/telegram/__tests__/`). Integration tests cover the webhook route (`app/api/telegram/__tests__/`).

---

## Notes

- One report per employee per day is enforced at the database level
- Employees cannot edit or delete submitted reports; only admin can
- Admin can edit any report, add internal notes, change status, or delete
- Deactivating a project removes it from the bot keyboard; historical reports are unaffected (name is stored as a snapshot)
- Timezone: `work_date` defaults to UTC. If employees are in a different timezone, adjust the date logic in `lib/telegram/handlers.ts`
