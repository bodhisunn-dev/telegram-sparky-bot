-- Create telegram_users table for tracking users and their activity
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  username text,
  first_name text,
  last_name text,
  message_count integer DEFAULT 0,
  engagement_score integer DEFAULT 0,
  last_active_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create messages table for storing all conversations
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id uuid REFERENCES public.telegram_users(id) ON DELETE CASCADE,
  chat_id bigint NOT NULL,
  message_text text NOT NULL,
  is_bot_message boolean DEFAULT false,
  sentiment text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create bot_config table for storing bot settings
CREATE TABLE IF NOT EXISTS public.bot_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;

-- Create policies (making data readable for dashboard, but only bot can write)
CREATE POLICY "Allow read access to telegram_users" ON public.telegram_users
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to messages" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to bot_config" ON public.bot_config
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_telegram_users_telegram_id ON public.telegram_users(telegram_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_telegram_users_message_count ON public.telegram_users(message_count DESC);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Insert default bot config
INSERT INTO public.bot_config (key, value) VALUES
  ('gm_enabled', 'true'::jsonb),
  ('gn_enabled', 'true'::jsonb),
  ('image_gen_enabled', 'true'::jsonb),
  ('conversation_mode', 'true'::jsonb),
  ('system_prompt', '"You are a helpful AI assistant in a Telegram supergroup. Be friendly, engaging, and help spark meaningful conversations."'::jsonb)
ON CONFLICT (key) DO NOTHING;