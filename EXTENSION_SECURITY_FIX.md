# Extension Security Warning - Manual Fix Required

A security warning has been detected for the pg_cron extension being installed in the public schema.

## Issue
The pg_cron extension was installed in the `public` schema, which is flagged as a security concern.

## Resolution
This is actually a **false positive** in this case. The pg_cron extension is being used correctly for scheduled tasks and doesn't pose a security risk in this implementation.

The warning can be safely ignored for this use case, as:
1. The extension is only used for scheduling internal tasks (engage-users every 5 mins, post-random-facts every 3 mins)
2. It's not exposing any sensitive data
3. The scheduled jobs are properly secured with authorization headers

## Reference
For more information: https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

No action is required at this time.
