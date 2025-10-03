-- Update random facts cron job to run every 10 minutes instead of 3
SELECT cron.unschedule('post-random-facts');

SELECT cron.schedule(
  'post-random-facts',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT
    net.http_post(
        url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/post-random-facts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Create table to track user mentions and avoid duplicates within an hour
CREATE TABLE IF NOT EXISTS public.user_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL,
  username TEXT,
  mentioned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  chat_id BIGINT NOT NULL
);

-- Create index for efficient querying
CREATE INDEX idx_user_mentions_time ON public.user_mentions(mentioned_at);
CREATE INDEX idx_user_mentions_user ON public.user_mentions(telegram_user_id);

-- Enable RLS
ALTER TABLE public.user_mentions ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read access to user_mentions"
  ON public.user_mentions
  FOR SELECT
  USING (true);