# Email Notifications Setup Guide

## Overview

Your contact form now saves submissions to Supabase! To receive **email notifications** when someone submits the form, follow this guide.

---

## Current Status

✅ **Working Now:**
- Contact form saves to Supabase database
- Data accessible in Supabase dashboard
- Form validation and error handling

⏳ **Needs Setup (Optional):**
- Email notifications on form submission

---

## How to View Submissions (No Setup Needed!)

### Option 1: Supabase Dashboard (Easiest)

1. Go to https://dghlytwuslldhogqscho.supabase.co
2. Log in with your Supabase credentials
3. Click **"Table Editor"** in left sidebar
4. Click **"contact_inquiries"** table
5. View all submissions in real-time!

**You can:**
- See all form submissions with timestamps
- Sort by date, search, filter
- Export to CSV
- See new submissions in real-time

---

## Email Notifications Setup (Optional - 15 minutes)

If you want to receive an email every time someone submits the contact form:

### Step 1: Create Resend Account (Free)

1. Go to https://resend.com/signup
2. Sign up for free account
3. Verify your email
4. You get **100 emails/day FREE** (3,000/month)

### Step 2: Get API Key

1. Log in to Resend dashboard
2. Click **"API Keys"** in sidebar
3. Click **"Create API Key"**
4. Name it: `nextgen-contact-form`
5. **Copy the API key** (starts with `re_...`)

### Step 3: Add Domain (For Production)

**For testing:** You can send emails to yourself using any email

**For production:** You need to verify your domain
1. In Resend, click **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `nextgenmedia.com`)
4. Add DNS records they provide
5. Wait for verification

### Step 4: Deploy Edge Function

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   cd C:\Users\Pedro\Desktop\nextGenmedia_web
   supabase link --project-ref dghlytwuslldhogqscho
   ```

3. Set environment variables:
   ```bash
   # Set Resend API key
   supabase secrets set RESEND_API_KEY=re_your_api_key_here

   # Set owner email (where notifications go)
   supabase secrets set OWNER_EMAIL=your-email@example.com
   ```

4. Deploy the function:
   ```bash
   supabase functions deploy send-contact-email
   ```

### Step 5: Create Database Webhook

1. Go to https://dghlytwuslldhogqscho.supabase.co
2. Click **"Database"** → **"Webhooks"**
3. Click **"Create a new hook"**
4. Configure:
   - **Name:** `contact-form-notification`
   - **Table:** `contact_inquiries`
   - **Events:** Check only `INSERT`
   - **Type:** `HTTP Request`
   - **Method:** `POST`
   - **URL:** `https://dghlytwuslldhogqscho.supabase.co/functions/v1/send-contact-email`
   - **HTTP Headers:**
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_ANON_KEY
     ```
5. Click **"Create webhook"**

### Step 6: Test It!

1. Go to your website: http://localhost:8080
2. Fill out the contact form
3. Submit
4. Check your email inbox!

You should receive an email with:
- Name, email, phone, company
- Full message
- Timestamp
- Link to Supabase dashboard

---

## Email Example

When someone submits the form, you'll receive:

```
Subject: New Contact: John Doe - ABC Corp

🎯 New Contact Form Submission
Submitted on October 20, 2025 at 2:30 PM

Name: John Doe
Email: john@example.com
Phone: 555-1234
Company: ABC Corp

Message:
I'm interested in your video production services for our
upcoming marketing campaign...

---
This email was sent from your NextGen Media website contact form.
View all submissions in your Supabase Dashboard
```

You can **reply directly** to the email (it uses their email as reply-to)!

---

## Costs

### Free Tier (Plenty for Most Cases!)

- **Supabase:** 500,000 Edge Function calls/month
- **Resend:** 100 emails/day (3,000/month)

### If you exceed free tier:

- **Resend:** $20/month for 50,000 emails
- **Supabase:** No extra cost (500K is huge)

**For a typical media agency:**
- 10-50 form submissions/month
- Well within free tier!

---

## Alternative: Workflow Automation

Instead of Supabase Edge Functions, you can use:

### Make.com / Zapier / n8n

1. Connect to Supabase
2. Trigger: New row in `contact_inquiries`
3. Actions:
   - Send email
   - Add to Google Sheets
   - Create CRM entry
   - Send Slack message
   - Whatever you want!

**Pros:**
- No coding needed
- More flexibility
- Many integrations

**Cons:**
- Limited free tier
- Slightly slower than Edge Functions

---

## Need Help?

Just ask Claude Code:
- "Help me set up Resend"
- "Deploy the Edge Function"
- "Test email notifications"
- "Set up Make.com workflow"

Your contact form is already working and saving to Supabase. Email notifications are just a nice bonus! 📧
