-- Create table to track posted facts to prevent repeats
CREATE TABLE IF NOT EXISTS public.posted_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_text TEXT NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  chat_id BIGINT NOT NULL
);

-- Create index for efficient querying
CREATE INDEX idx_posted_facts_time ON public.posted_facts(posted_at);

-- Enable RLS
ALTER TABLE public.posted_facts ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read access to posted_facts"
  ON public.posted_facts
  FOR SELECT
  USING (true);