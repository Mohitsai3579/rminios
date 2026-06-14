-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    owner_name TEXT NOT NULL,
    support_email TEXT NOT NULL,
    support_phone TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

-- Allow admins to update
CREATE POLICY "Allow admins to update site_settings"
    ON public.site_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
    );

-- Allow admins to insert
CREATE POLICY "Allow admins to insert site_settings"
    ON public.site_settings FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'superadmin')
        )
    );

-- Insert initial default row
INSERT INTO public.site_settings (id, owner_name, support_email, support_phone)
VALUES ('global', 'Mohit Jonnadula', 'mohitjonnadula16@gmail.com', '9494366318')
ON CONFLICT (id) DO NOTHING;
