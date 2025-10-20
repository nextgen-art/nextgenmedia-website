# Post-Clone Setup Guide

## What to Do After Cloning the Lovable Repository

Once you've cloned the Lovable GitHub repo to this directory, here's what Claude Code will help you do:

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

Your `.env.local` should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dghlytwuslldhogqscho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<will-get-from-supabase-mcp>
```

### 2. Apply Supabase Migrations

Claude Code will use the Supabase MCP to apply the schema in `SUPABASE_SCHEMA.sql` as proper migrations. This ensures:
- Proper version control of database changes
- Ability to rollback if needed
- Production-ready setup

### 3. Create Storage Buckets

Set up Supabase Storage buckets for:
- `project-images` - Portfolio project images
- `team-avatars` - Team member photos
- `testimonial-avatars` - Client testimonial photos

### 4. Generate TypeScript Types

Run via Supabase MCP to get fully typed database access in your code:
```typescript
// Auto-generated types for type-safe queries
import { Database } from './types/supabase'
```

### 5. Local Development Enhancements

Claude Code will help you:

**Frontend Improvements:**
- Add loading skeletons for better UX
- Implement optimistic UI updates
- Add image optimization with Next.js Image
- Improve form validation
- Add error boundaries
- Implement better animations

**Backend Enhancements:**
- Create Edge Functions for:
  - Contact form email notifications
  - Image processing/optimization
  - Admin notifications
- Set up proper error handling
- Add rate limiting for contact forms

**SEO & Performance:**
- Add metadata and Open Graph tags
- Implement sitemap generation
- Add robots.txt
- Optimize bundle size
- Add analytics setup

### 6. Deploy Edge Functions

Example Edge Function for contact form emails:
```typescript
// supabase/functions/send-contact-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { name, email, message } = await req.json()

  // Send email via your email service
  // Save to database
  // Return response
})
```

### 7. Testing & Quality Assurance

- Test authentication flows
- Verify RLS policies work correctly
- Test image uploads
- Check responsive design on all devices
- Verify admin dashboard functionality
- Test contact form submissions

### 8. Security Check

Use Supabase MCP to run security advisories:
```bash
# Claude Code will run this automatically
mcp__supabase__get_advisors({ type: "security" })
```

### 9. Continuous Development Workflow

Going forward:
1. Make changes locally with Claude Code (0 credits)
2. Test locally: `npm run dev`
3. Commit to GitHub: `git push`
4. Lovable automatically syncs changes
5. If you need major UI redesign, use Lovable AI (~2-3 credits)
6. Otherwise, keep editing locally forever (0 credits)

### 10. Deployment

**Frontend (Vercel):**
```bash
# Connect GitHub repo to Vercel
# Auto-deploys on push
```

**Backend (Supabase):**
- Already configured via Supabase MCP
- Edge Functions deployed via MCP tools
- Database migrations applied

## Next Steps Checklist

- [ ] Clone repo: `git clone YOUR_REPO_URL .`
- [ ] Install dependencies: `npm install`
- [ ] Get Supabase anon key via MCP
- [ ] Create `.env.local` file
- [ ] Apply database migrations
- [ ] Create storage buckets
- [ ] Generate TypeScript types
- [ ] Run security advisories
- [ ] Test locally
- [ ] Deploy to Vercel

## Support

If you encounter any issues:
1. Check Supabase logs: `mcp__supabase__get_logs`
2. Review security advisories
3. Ask Claude Code for help!

Remember: All code changes can be done locally with Claude Code at ZERO additional Lovable credits!
