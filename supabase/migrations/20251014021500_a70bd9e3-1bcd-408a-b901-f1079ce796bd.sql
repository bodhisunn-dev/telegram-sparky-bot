-- Remove the scheduled AI meme generation cron job
SELECT cron.unschedule('botsly-meme-post-every-30-min');