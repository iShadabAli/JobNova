

DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text UNIQUE NOT NULL,
  phone text UNIQUE,
  password_hash text NOT NULL,
  role text CHECK (role IN ('blue_collar', 'white_collar', 'employer', 'admin')) NOT NULL,
  first_name text,
  last_name text,
  created_at timestamptz DEFAULT now(),
  is_profile_completed boolean DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow registration (insert)
CREATE POLICY "Public can register" 
ON public.users FOR INSERT 
WITH CHECK (true);

-- Allow select for service role (backend uses service key)
CREATE POLICY "Service can select all"
ON public.users FOR SELECT
USING (true);

-- Allow update for service role
CREATE POLICY "Service can update all"
ON public.users FOR UPDATE
USING (true);

-- ----------------------------
-- MODULE 5 PREPARATION: PROFILES
-- ----------------------------

DROP TABLE IF EXISTS public.profiles;

CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Common Fields
  full_name text,
  bio text,
  location text,
  avatar_url text,

  -- Blue-Collar Specific
  trade text, -- e.g., Electrician, Plumber
  hourly_rate text,
  availability text, -- e.g., Weekends, 9-5
  radius integer, -- Work radius in km

  -- White-Collar Specific
  skills text, -- Comma separated or JSON array
  experience text,
  education text,
  resume_url text,

  -- Employer Specific
  company_name text,
  industry text,
  website text,

  -- Ratings
  avg_rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id); -- NOTE: This relies on Supabase Auth. Since we are using custom auth, we will handle this in backend mainly, but good to have.

-- Allow backend service role to do everything
CREATE POLICY "Service can manage profiles"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);

-- ----------------------------
-- MODULE 6 PREPARATION: JOBS
-- ----------------------------

DROP TABLE IF EXISTS public.jobs;

CREATE TABLE public.jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text CHECK (type IN ('blue', 'white')) NOT NULL,
  location text NOT NULL,
  salary_range text, -- For white collar
  hourly_rate text,  -- For blue collar
  duration text,     -- For blue collar
  skills text,       -- Stored as comma separated
  experience_level text,
  availability text,
  status text DEFAULT 'Active', -- Active, Closed, Draft
  latitude numeric,  -- For map (Module 7)
  longitude numeric, -- For map (Module 7)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Note: RLS disabled or handled via service role for simplicity in this MVP

-- ----------------------------
-- APPLICATIONS & HIRING (Modules 6 & 8)
-- ----------------------------

DROP TABLE IF EXISTS public.applications;

CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shortlisted', 'Rejected', 'In Progress', 'Completed')),
  resume_url text,      -- Used if applicant uploads a specific CV
  cover_letter text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, applicant_id) -- One application per job per user
);

-- ----------------------------
-- REVIEWS (Module 9)
-- ----------------------------

DROP TABLE IF EXISTS public.reviews;

CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  reviewee_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, reviewer_id, reviewee_id) -- Only one review per interaction
);

