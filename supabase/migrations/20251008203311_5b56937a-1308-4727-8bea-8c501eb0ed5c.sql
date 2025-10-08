-- Create a table to store the last used meme description
CREATE TABLE IF NOT EXISTS public.bot_state (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial state for last meme description
INSERT INTO public.bot_state (id, value) 
VALUES ('last_meme_description', '') 
ON CONFLICT (id) DO NOTHING;