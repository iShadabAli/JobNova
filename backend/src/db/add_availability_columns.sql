-- Execute this in the Supabase SQL Editor under "SQL Editor" tab

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS availability_days TEXT,
ADD COLUMN IF NOT EXISTS availability_hours TEXT;
