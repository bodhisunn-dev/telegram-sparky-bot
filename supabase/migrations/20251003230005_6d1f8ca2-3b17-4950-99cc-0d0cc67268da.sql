-- Unschedule the old engage-users cron job that's conflicting with mention-users
SELECT cron.unschedule('engage-random-users');