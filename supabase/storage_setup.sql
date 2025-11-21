-- Create storage bucket for proof uploads
-- This should be run in Supabase SQL Editor

-- Create the proofs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for proofs bucket
-- Allow authenticated users to upload
CREATE POLICY "Users can upload proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proofs' AND
  auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Public can view proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'proofs');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'proofs' AND
  auth.role() = 'authenticated'
);

