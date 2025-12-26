// Supabase Configuration
(function() {
    const SUPABASE_URL = 'https://qvabjacptkqarpvzjexf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YWJqYWNwdGtxYXJwdnpqZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTQ1NjEsImV4cCI6MjA4MjI5MDU2MX0.nSuNCRYd6xzQOdxXJAkr4X0C2npWPj9tuKymlnv6db0';

    // Initialize Supabase client
    if (typeof window.supabaseClient === 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
})();

// Expose as global for easy access
var supabase = window.supabaseClient;

/*
===========================================
SUPABASE SETUP INSTRUCTIONS
===========================================

1. Go to https://supabase.com and create a new project (or use existing)

2. Get your credentials:
   - Go to Project Settings > API
   - Copy the "Project URL" and paste above as SUPABASE_URL
   - Copy the "anon public" key and paste above as SUPABASE_ANON_KEY

3. Create the updates table:
   - Go to SQL Editor in Supabase dashboard
   - Run the following SQL:

-- Create the updates table
CREATE TABLE updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('announcement', 'news', 'press', 'update')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published updates
CREATE POLICY "Public can view published updates" ON updates
    FOR SELECT USING (published = true);

-- Policy: Authenticated users can do everything
CREATE POLICY "Authenticated users have full access" ON updates
    FOR ALL USING (auth.role() = 'authenticated');

-- Create an index for faster date sorting
CREATE INDEX updates_date_idx ON updates(date DESC);

-- Add media columns (run this if table already exists)
ALTER TABLE updates ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE updates ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video') OR media_type IS NULL);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update the updated_at column
CREATE TRIGGER update_updates_updated_at
    BEFORE UPDATE ON updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


4. Set up Storage for media uploads:
   - Go to Storage in the sidebar
   - Click "New bucket"
   - Name: updates-media
   - Toggle ON "Public bucket" (so images/videos can be viewed)
   - Click "Create bucket"
   - Click on the bucket, then "Policies"
   - Add these policies:

   -- Policy for public read access
   CREATE POLICY "Public can view media" ON storage.objects
       FOR SELECT USING (bucket_id = 'updates-media');

   -- Policy for authenticated upload/delete
   CREATE POLICY "Authenticated users can upload media" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id = 'updates-media' AND auth.role() = 'authenticated');

   CREATE POLICY "Authenticated users can delete media" ON storage.objects
       FOR DELETE USING (bucket_id = 'updates-media' AND auth.role() = 'authenticated');

5. Set up Authentication:
   - Go to Authentication > Providers
   - Email provider should be enabled by default
   - Go to Authentication > Users
   - Click "Add user" to create an admin account
   - Use a strong password!

5. (Optional) Customize auth settings:
   - Go to Authentication > URL Configuration
   - Set Site URL to your website URL
   - Add redirect URLs if needed

===========================================
*/

