-- Fix Storage Policies for RMinios V2

-- 1. Ensure buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES ('papers', 'papers', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

-- 2. Papers Bucket Policies
CREATE POLICY "Users can upload their own papers" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'papers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own papers" ON storage.objects FOR SELECT 
USING (bucket_id = 'papers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own papers" ON storage.objects FOR UPDATE 
USING (bucket_id = 'papers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own papers" ON storage.objects FOR DELETE 
USING (bucket_id = 'papers' AND auth.role() = 'authenticated');

-- 3. Datasets Bucket Policies
CREATE POLICY "Users can upload their own datasets" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'datasets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own datasets" ON storage.objects FOR SELECT 
USING (bucket_id = 'datasets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own datasets" ON storage.objects FOR UPDATE 
USING (bucket_id = 'datasets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own datasets" ON storage.objects FOR DELETE 
USING (bucket_id = 'datasets' AND auth.role() = 'authenticated');

-- 4. Images Bucket Policies (Public read)
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Users can upload their own images" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own images" ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
