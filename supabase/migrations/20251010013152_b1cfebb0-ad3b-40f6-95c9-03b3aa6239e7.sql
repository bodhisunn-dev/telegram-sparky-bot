-- Add stop flag for /all command
ALTER TABLE public.bot_state ADD COLUMN IF NOT EXISTS stop_all_mentions BOOLEAN DEFAULT false;