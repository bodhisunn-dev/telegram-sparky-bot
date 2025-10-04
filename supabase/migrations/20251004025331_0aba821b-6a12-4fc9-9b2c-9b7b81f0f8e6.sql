-- Create admin_users table to whitelist dashboard admins
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admin list
CREATE POLICY "Admins can read admin_users"
ON admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE admin_users.user_id = is_admin.user_id
  );
$$;

-- Update telegram_users policy to only allow admins
DROP POLICY IF EXISTS "Authenticated users can read telegram_users" ON telegram_users;

CREATE POLICY "Only admins can read telegram_users"
ON telegram_users
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update messages policy to only allow admins
DROP POLICY IF EXISTS "Authenticated users can read messages" ON messages;

CREATE POLICY "Only admins can read messages"
ON messages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update posted_facts policy to only allow admins
DROP POLICY IF EXISTS "Authenticated users can read posted_facts" ON posted_facts;

CREATE POLICY "Only admins can read posted_facts"
ON posted_facts
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update user_mentions policy to only allow admins
DROP POLICY IF EXISTS "Authenticated users can read user_mentions" ON user_mentions;

CREATE POLICY "Only admins can read user_mentions"
ON user_mentions
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update bot_config policy to only allow admins
DROP POLICY IF EXISTS "Authenticated users can read bot_config" ON bot_config;

CREATE POLICY "Only admins can read bot_config"
ON bot_config
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Function to auto-add first user as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO admin_count FROM public.admin_users;
  
  IF admin_count = 0 THEN
    -- First user becomes admin automatically
    INSERT INTO public.admin_users (user_id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to run after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();