-- NextGen Media Agency - Supabase Database Schema
-- This will be applied as migrations once the Lovable code is cloned

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE (Portfolio Items)
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'video', 'photo', 'branding', 'web', etc.
  client_name TEXT,
  project_date DATE,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  video_url TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Icon name or URL
  features TEXT[] DEFAULT '{}'::text[],
  price_starting DECIMAL(10,2),
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_company TEXT,
  client_position TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACT INQUIRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- These will be created via Supabase dashboard or API
-- Buckets needed:
-- - project-images (public)
-- - team-avatars (public)
-- - testimonial-avatars (public)

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects: Public read, admin write
CREATE POLICY "Published projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (published = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

-- Services: Public read, admin write
CREATE POLICY "Published services are viewable by everyone"
  ON public.services FOR SELECT
  USING (published = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

-- Testimonials: Public read, admin write
CREATE POLICY "Published testimonials are viewable by everyone"
  ON public.testimonials FOR SELECT
  USING (published = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

-- Team Members: Public read, admin write
CREATE POLICY "Published team members are viewable by everyone"
  ON public.team_members FOR SELECT
  USING (published = true OR auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

-- Contact Inquiries: Anyone can insert, admins can read/update
CREATE POLICY "Anyone can submit contact inquiry"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

CREATE POLICY "Admins can update inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  ));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_featured ON public.projects(featured) WHERE featured = true;
CREATE INDEX idx_projects_published ON public.projects(published) WHERE published = true;
CREATE INDEX idx_testimonials_featured ON public.testimonials(featured) WHERE featured = true;
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at DESC);
