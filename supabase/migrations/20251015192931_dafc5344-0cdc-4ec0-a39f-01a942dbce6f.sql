-- Unschedule the hourly memetropolis post
SELECT cron.unschedule('hourly-memetropolis-post');

-- Reschedule memetropolis post to every 3 hours
SELECT cron.schedule(
  'hourly-memetropolis-post',
  '0 */3 * * *', -- Every 3 hours at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/hourly-memetropolis-post',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Unschedule the mention-inactive-users cron job
SELECT cron.unschedule('mention-inactive-users');

-- Reschedule mention-inactive-users to every 6 hours
SELECT cron.schedule(
  'mention-inactive-users',
  '0 */6 * * *', -- Every 6 hours at minute 0
  $$
  SELECT net.http_post(
    url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/mention-users',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);