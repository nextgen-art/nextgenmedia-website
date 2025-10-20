# Lovable Setup Guide - NextGen Media Agency

## Step 1: Create Lovable Project

1. Go to https://lovable.dev
2. Click "Create New Project"
3. Use these prompts in order (copy-paste exactly):

### Prompt 1: Initial Structure
```
Create a modern media agency website called "NextGen Media" with the following pages:

1. Homepage with:
   - Hero section with call-to-action
   - Featured services overview
   - Recent projects showcase
   - Client testimonials
   - Contact CTA

2. Portfolio page with filterable project gallery
3. Services page listing our media services
4. About page with team section
5. Contact page with form

Use a professional dark theme with vibrant accent colors. Make it fully responsive and modern.
```

### Prompt 2: Supabase Integration
```
Connect this project to Supabase and add:
- User authentication (login/signup pages)
- Database tables for: projects, services, testimonials, team_members, contact_inquiries
- Store form submissions in the database
```

### Prompt 3: Admin Dashboard
```
Create an admin dashboard at /admin (protected route) where authenticated users can:
- Add/edit/delete portfolio projects
- Manage services
- Manage testimonials
- View contact form submissions
- Manage team members

Include image upload functionality for projects and team members.
```

### Prompt 4: Polish
```
Add smooth animations, improve the design with better spacing and typography, ensure all forms have proper validation and error handling, and add loading states.
```

## Step 2: Connect Supabase

After the initial project is created:

1. In Lovable, go to Settings → Integrations
2. Click "Connect Supabase"
3. Authorize Lovable to access your Supabase account
4. Select the project: `dghlytwuslldhogqscho`
5. Confirm connection

## Step 3: Enable GitHub Integration

1. In Lovable, click the GitHub icon
2. Connect your GitHub account
3. Create a new repository: `nextgenmedia-web`
4. Let Lovable sync the code

## Step 4: Export to Local

Once GitHub is connected:

1. Go to your GitHub repo: https://github.com/YOUR_USERNAME/nextgenmedia-web
2. Copy the clone URL
3. Return to this directory and run:
   ```bash
   git clone YOUR_REPO_URL .
   ```

## Credits Used Estimate

- Prompt 1: ~3-4 credits
- Prompt 2: ~2-3 credits
- Prompt 3: ~3-4 credits
- Prompt 4: ~1-2 credits
- **Total: ~10-13 credits**

## What Happens Next

After you clone the repo locally, Claude Code will:
- Set up the development environment
- Enhance the Supabase schema with proper migrations
- Add RLS policies
- Refine components and add custom features
- Deploy Edge Functions
- All at ZERO additional Lovable credits!

## Important Notes

- The Supabase URL is already configured in your `.mcp.json`
- Don't commit `.env` files with secrets
- Lovable will auto-sync changes from GitHub
- You can edit locally forever without using Lovable credits
