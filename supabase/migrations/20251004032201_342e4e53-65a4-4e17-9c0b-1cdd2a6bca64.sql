-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Public read access for bot media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload bot media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete bot media" ON storage.objects;

-- Create corrected RLS policies for bot-media bucket
CREATE POLICY "Anyone can read bot media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bot-media');

CREATE POLICY "Authenticated admins can insert bot media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bot-media' 
  AND public.is_admin(auth.uid())
);

CREATE POLICY "Authenticated admins can update bot media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'bot-media' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'bot-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Authenticated admins can delete bot media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'bot-media' AND public.is_admin(auth.uid()));