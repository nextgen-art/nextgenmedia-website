# Figma to Lovable Guide - NextGen Media Agency

## 🎨 You Have a Figma Design - Perfect!

Since you already have your media agency website designed in Figma, we'll use the **Figma → Builder.io → Lovable** workflow to convert it to code efficiently.

---

## 📋 Prerequisites

### In Figma:
- ✅ Your media agency design is ready
- ⚠️ **Important**: Use Auto Layout for best results
  - Apply Auto Layout to all parent containers
  - Set proper padding, margins, and alignment
  - Name layers clearly (e.g., "Header", "Hero Section", "Portfolio Grid")

### Tools Needed:
- Builder.io Figma plugin (free)
- Lovable account
- GitHub account

---

## 🚀 Step-by-Step Process

### Step 1: Install Builder.io Plugin (2 minutes)

1. Open your Figma file
2. Go to Plugins → Browse plugins in Community
3. Search for "Builder.io - Figma to Code"
4. Click "Install"

**Plugin URL:** https://www.figma.com/community/plugin/747985167520967365

---

### Step 2: Prepare Your Figma Design (5-10 minutes)

**Quick Checklist:**

✅ **Use Auto Layout**
- Right-click containers → Add Auto Layout
- Ensures responsive layouts work properly

✅ **Name Layers Clearly**
- Good: "Header", "CTA Button", "Portfolio Grid"
- Bad: "Frame 1", "Rectangle 2", "Group 15"

✅ **Organize Pages**
- Homepage
- Portfolio/Projects
- Services
- About
- Contact
- Admin Dashboard (optional - can add later)

✅ **Export Mode**
- **Easy Mode**: Fast export, good for quick starts
- **Precise Mode**: Pixel-perfect, takes longer

**Recommended:** Start with Easy Mode, refine with Claude Code later

---

### Step 3: Export to Lovable (5 minutes)

1. **Select Your Design**
   - Click on the main frame/page in Figma
   - Run Builder.io plugin (Plugins → Builder.io)

2. **Configure Export**
   - Choose "Easy Mode" for speed
   - Select framework: React (default for Lovable)
   - Check "Include responsive settings"

3. **Open in Lovable**
   - Click "Open in Lovable" button
   - Lovable will create a new project
   - Wait for code generation (30-60 seconds)

4. **Review Generated Code**
   - Lovable will show your design as working code
   - Check if layout matches your Figma design
   - Note any visual quirks (Claude Code will fix these later)

**Credits Used:** ~3-5 credits for initial import

---

### Step 4: Add Backend Functionality in Lovable (2-3 credits)

Now enhance your static design with dynamic features:

**Prompt 1:** (Paste in Lovable chat)
```
Connect this project to Supabase. Add authentication with login/signup pages.
Create database tables for: projects, services, testimonials, team_members,
and contact_inquiries. Make the contact form save submissions to the database.
```

**Prompt 2:** (If you want admin features)
```
Create an admin dashboard at /admin (protected route) where authenticated
admins can:
- Add/edit/delete portfolio projects
- Manage services and testimonials
- View contact form submissions
- Upload images for projects

Include proper authorization checks.
```

**Credits Used:** ~2-3 credits for backend setup

---

### Step 5: Connect Supabase (2 minutes)

1. In Lovable, go to Settings → Integrations
2. Click "Connect Supabase"
3. Authorize Lovable
4. Select project: `dghlytwuslldhogqscho`
5. Confirm connection

---

### Step 6: Connect GitHub & Export (3 minutes)

1. Click GitHub icon in Lovable
2. Authorize GitHub access
3. Create new repository: `nextgenmedia-web`
4. Let Lovable push the code
5. Copy your GitHub repo URL

---

### Step 7: Clone to Local (1 minute)

```bash
cd C:\Users\Pedro\Desktop\nextGenmedia_web
git clone YOUR_GITHUB_REPO_URL .
```

---

### Step 8: Let Claude Code Take Over (0 Credits!)

Tell Claude Code: **"I've cloned the Figma-imported Lovable repo!"**

Then Claude Code will help you with:

#### Visual Refinements (0 credits)
- Fix any spacing inconsistencies from Figma import
- Adjust responsive breakpoints
- Fine-tune animations and transitions
- Optimize images and assets
- Ensure pixel-perfect match to your Figma design

#### Database Setup (0 credits)
- Create proper migrations from SUPABASE_SCHEMA.sql
- Set up RLS policies for security
- Generate TypeScript types
- Create storage buckets for media

#### Feature Enhancements (0 credits)
- Add loading states and error handling
- Implement optimistic UI updates
- Create Edge Functions for emails
- Add image optimization
- Improve form validation
- Add SEO metadata

#### Performance (0 credits)
- Optimize bundle size
- Add lazy loading
- Implement caching strategies
- Run security audits

---

## 📊 Credit Usage Breakdown

| Task | Credits |
|------|---------|
| Figma → Lovable import | 3-5 |
| Add Supabase backend | 2-3 |
| Add admin dashboard | 1-2 |
| **Total in Lovable** | **6-10** |
| All refinements (Claude Code) | **0** |
| Database setup (Supabase MCP) | **0** |
| **Grand Total** | **6-10** |

**You save: 70+ credits compared to traditional approach!**

---

## 🎯 Expected Results

After this workflow, you'll have:

✅ Your exact Figma design as working code
✅ Responsive across all devices
✅ User authentication
✅ Admin dashboard
✅ Database with RLS security
✅ Contact form functionality
✅ Image upload capabilities
✅ Type-safe TypeScript
✅ Production-ready code
✅ Only used ~6-10 Lovable credits!

---

## ⚠️ Common Issues & Solutions

### Issue: "Visual quirks after Figma import"
**Solution:** Clone locally and use Claude Code to fix (0 credits)

### Issue: "Auto Layout not applied in Figma"
**Solution:** Either add Auto Layout in Figma, or use screenshots instead

### Issue: "Components don't match exactly"
**Solution:** Claude Code can refine spacing, colors, fonts locally (0 credits)

### Issue: "Need custom functionality not in Figma"
**Solution:** Add via Claude Code after cloning (0 credits)

---

## 🆘 Need Help?

**During Figma export:**
- Check Builder.io documentation
- Try Easy Mode first
- Ensure Auto Layout is applied

**After cloning:**
- Ask Claude Code: "Fix visual quirks from Figma import"
- Ask Claude Code: "Match this component exactly to my Figma design"
- Share Figma screenshots for reference

---

## 🚀 Ready to Start?

1. Open your Figma file
2. Install Builder.io plugin
3. Apply Auto Layout to main containers
4. Export to Lovable
5. Come back when you've cloned the repo!

**Your design is already done - let's turn it into a working app! 🎨✨**
