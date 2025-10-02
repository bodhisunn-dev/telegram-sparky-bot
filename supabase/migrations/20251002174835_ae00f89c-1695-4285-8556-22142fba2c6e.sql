-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to ping random users every 5 minutes
SELECT cron.schedule(
  'engage-random-users',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/engage-users',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);