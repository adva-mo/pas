-- work_description is no longer collected by the bot
-- Run manually in the Supabase SQL editor

ALTER TABLE daily_reports ALTER COLUMN work_description DROP NOT NULL;
