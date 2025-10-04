-- Fix security issue: Restrict messages table access to authenticated users only
-- Drop the existing public read policy
DROP POLICY IF EXISTS "Allow read access to messages" ON messages;

-- Create new policy: Only authenticated users can read messages
CREATE POLICY "Authenticated users can read messages"
ON messages
FOR SELECT
TO authenticated
USING (true);

-- Fix security issue: Restrict telegram_users table access
DROP POLICY IF EXISTS "Allow read access to telegram_users" ON telegram_users;

-- Create new policy: Only authenticated users can read telegram users
CREATE POLICY "Authenticated users can read telegram_users"
ON telegram_users
FOR SELECT
TO authenticated
USING (true);

-- Fix security issue: Restrict posted_facts table access
DROP POLICY IF EXISTS "Allow read access to posted_facts" ON posted_facts;

-- Create new policy: Only authenticated users can read posted facts
CREATE POLICY "Authenticated users can read posted_facts"
ON posted_facts
FOR SELECT
TO authenticated
USING (true);

-- Fix security issue: Restrict user_mentions table access
DROP POLICY IF EXISTS "Allow read access to user_mentions" ON user_mentions;

-- Create new policy: Only authenticated users can read user mentions
CREATE POLICY "Authenticated users can read user_mentions"
ON user_mentions
FOR SELECT
TO authenticated
USING (true);

-- Fix security issue: Restrict bot_config table access
DROP POLICY IF EXISTS "Allow read access to bot_config" ON bot_config;

-- Create new policy: Only authenticated users can read bot config
CREATE POLICY "Authenticated users can read bot_config"
ON bot_config
FOR SELECT
TO authenticated
USING (true);