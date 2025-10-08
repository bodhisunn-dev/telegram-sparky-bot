-- Enable RLS on bot_state table
ALTER TABLE public.bot_state ENABLE ROW LEVEL SECURITY;

-- No policies needed as this table is only accessed by edge functions with service role