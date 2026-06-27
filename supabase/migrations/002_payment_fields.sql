-- Add payment fields to bot_sessions and daily_reports
-- Run manually in the Supabase SQL editor

ALTER TABLE bot_sessions
  ADD COLUMN payment_type    TEXT,
  ADD COLUMN daily_rate      NUMERIC,
  ADD COLUMN price_per_slide NUMERIC,
  ADD COLUMN slides_count    INTEGER;

ALTER TABLE daily_reports
  ADD COLUMN payment_type    TEXT CHECK (payment_type IN ('daily', 'per_slide')),
  ADD COLUMN daily_rate      NUMERIC,
  ADD COLUMN price_per_slide NUMERIC,
  ADD COLUMN slides_count    INTEGER;
