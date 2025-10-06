-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to engage inactive users every 3 hours
SELECT cron.schedule(
  'engage-inactive-users-every-3-hours',
  '0 */3 * * *', -- Run every 3 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/engage-users',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);