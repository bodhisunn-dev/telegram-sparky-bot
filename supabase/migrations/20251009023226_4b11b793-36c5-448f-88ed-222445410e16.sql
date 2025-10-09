-- Initialize mention_index state if it doesn't exist
INSERT INTO public.bot_state (id, value, updated_at) 
VALUES ('mention_index', '0', NOW()) 
ON CONFLICT (id) DO NOTHING;

-- Create a cron job to run mention-users every 4 hours
SELECT cron.schedule(
  'mention-inactive-users',
  '0 */4 * * *',  -- Every 4 hours
  $$
  SELECT net.http_post(
    url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/mention-users',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);