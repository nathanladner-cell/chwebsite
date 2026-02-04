// Supabase Configuration
(function() {
    const SUPABASE_URL = 'https://qvabjacptkqarpvzjexf.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2YWJqYWNwdGtxYXJwdnpqZXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTQ1NjEsImV4cCI6MjA4MjI5MDU2MX0.nSuNCRYd6xzQOdxXJAkr4X0C2npWPj9tuKymlnv6db0';
    
    // Web3Forms API key for email notifications - Get yours free at https://web3forms.com
    // Replace with your actual access key to enable email notifications to sales@copperheadlabs.com
    window.WEB3FORMS_KEY = 'f3716c4d-5aab-46ff-bd90-bcb0f13ba3a6';

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

3. Create the contact_submissions table:
   - Go to SQL Editor in Supabase dashboard
   - Run the following SQL:

-- Create the contact_submissions table
CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service TEXT,
    message TEXT NOT NULL,
    source_page TEXT DEFAULT 'unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT (submit forms)
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated users can view submissions
CREATE POLICY "Authenticated users can view submissions" ON contact_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can update (mark as read)
CREATE POLICY "Authenticated users can update submissions" ON contact_submissions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create an index for faster sorting by date
CREATE INDEX contact_submissions_created_at_idx ON contact_submissions(created_at DESC);

-- Create an index for filtering unread submissions
CREATE INDEX contact_submissions_read_idx ON contact_submissions(read);


4. Create the updates table:
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
EMAIL NOTIFICATIONS FOR FORM SUBMISSIONS
===========================================

To email form submissions to sales@copperheadlabs.com:

OPTION A: Using Resend (Recommended - Free tier: 3,000 emails/month)
---------------------------------------------------------------------

1. Sign up at https://resend.com and get an API key

2. In Supabase dashboard, go to Edge Functions > Create new function
   - Name: send-contact-email
   - Copy the code below into the function

3. Add your Resend API key as a secret:
   - Go to Project Settings > Edge Functions > Secrets
   - Add: RESEND_API_KEY = your_resend_api_key

4. Create a Database Webhook:
   - Go to Database > Webhooks > Create webhook
   - Name: email-on-contact-submission
   - Table: contact_submissions
   - Events: INSERT
   - Type: Supabase Edge Functions
   - Function: send-contact-email

--- EDGE FUNCTION CODE (send-contact-email/index.ts) ---

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    const { record } = await req.json();
    
    // Format the email
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${record.name} (${record.email})</p>
      ${record.phone ? `<p><strong>Phone:</strong> ${record.phone}</p>` : ''}
      ${record.service ? `<p><strong>Service Interest:</strong> ${record.service}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${record.message}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        Submitted: ${new Date(record.created_at).toLocaleString()}<br>
        Source: ${record.source_page}<br>
        ID: ${record.id}
      </p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Copperhead Labs <notifications@copperheadlabs.com>",
        to: ["sales@copperheadlabs.com"],
        subject: `New Contact: ${record.name} - ${record.service || 'General Inquiry'}`,
        html: emailHtml,
        reply_to: record.email,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: res.ok ? 200 : 400,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

--- END EDGE FUNCTION CODE ---

Note: You'll need to verify your domain in Resend to send from @copperheadlabs.com,
or use their default "onboarding@resend.dev" sender while testing.


OPTION B: Using Web3Forms (Simplest - Free tier: 250 emails/month)
------------------------------------------------------------------

1. Go to https://web3forms.com and get a free access key (no signup required)
2. Add this line at the top of supabase-config.js (after line 4):
   
   const WEB3FORMS_KEY = 'your_access_key_here';
   window.WEB3FORMS_KEY = WEB3FORMS_KEY;

3. The email will be sent automatically when forms are submitted
   (Already configured in script.js)


OPTION C: Using Zapier/Make (No-code)
-------------------------------------

1. Create a Zapier account at https://zapier.com
2. Create a new Zap:
   - Trigger: Webhooks by Zapier > Catch Hook
   - Action: Email by Zapier > Send Outbound Email
3. In Supabase, go to Database > Webhooks > Create webhook
   - Table: contact_submissions
   - Events: INSERT
   - Type: HTTP Request
   - URL: Your Zapier webhook URL
   - Method: POST

===========================================
*/

