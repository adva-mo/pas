-- ============================================================
-- PAS — Daily Work Reporting System
-- Initial schema migration
-- Run this in the Supabase SQL editor
-- ============================================================

-- 1. Employees
CREATE TABLE employees (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  telegram_user_id BIGINT UNIQUE NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- Service role (server) has full access; no client-side access
CREATE POLICY "service role only" ON employees
  USING (false);

-- 2. Projects / job sites
CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON projects
  USING (false);

-- 3. Bot conversation sessions
CREATE TABLE bot_sessions (
  telegram_user_id BIGINT PRIMARY KEY,
  step             TEXT NOT NULL,  -- 'project' | 'work' | 'notes' | 'confirm'
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  project_name     TEXT,
  work_description TEXT,
  notes            TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON bot_sessions
  USING (false);

-- 4. Daily reports
CREATE TABLE daily_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id      UUID NOT NULL REFERENCES employees(id),
  project_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  location         TEXT NOT NULL,  -- snapshot of project name at submission
  work_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  work_description TEXT NOT NULL,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed')),
  admin_notes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (employee_id, work_date)
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON daily_reports
  USING (false);

-- Auto-update updated_at on daily_reports
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Admins (links Supabase Auth users to the admin role)
CREATE TABLE admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role       TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
-- Admins can read their own row (needed for session checks via anon key)
CREATE POLICY "admin can read own row" ON admins
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- Seed: initial projects (edit as needed before first deploy)
-- ============================================================
INSERT INTO projects (name, sort_order) VALUES
  ('Office', 10),
  ('Remote', 20);
