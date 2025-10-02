-- Create a cron job to post random facts every 3 minutes
SELECT cron.schedule(
  'post-random-facts',
  '*/3 * * * *', -- Every 3 minutes
  $$
  SELECT
    net.http_post(
        url:='https://eptbjrnqydvkkplousle.supabase.co/functions/v1/post-random-facts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdGJqcm5xeWR2a2twbG91c2xlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxNTYsImV4cCI6MjA3NDk4ODE1Nn0.DDcHK7f_uHVAy11oAx81bUvsg3Cae1iMbET9wqMT17Q"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);