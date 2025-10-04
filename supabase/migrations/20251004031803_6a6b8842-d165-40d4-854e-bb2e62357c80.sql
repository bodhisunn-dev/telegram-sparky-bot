-- Create a public storage bucket for bot media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('bot-media', 'bot-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
CREATE POLICY "Public read access for bot media"
ON storage.objects FOR SELECT
USING (bucket_id = 'bot-media');

CREATE POLICY "Admins can upload bot media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bot-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete bot media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bot-media' AND public.is_admin(auth.uid()));