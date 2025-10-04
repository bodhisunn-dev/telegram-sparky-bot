-- Update the post-random-facts cron job to run every 30 minutes
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'post-random-facts'),
  schedule := '*/30 * * * *'
);