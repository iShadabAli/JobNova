-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming Supabase Auth
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('white', 'blue')) NOT NULL,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 7), -- For map-based discovery
    longitude DECIMAL(10, 7), -- For map-based discovery
    salary_range TEXT, -- For White Collar
    hourly_rate TEXT, -- For Blue Collar
    duration TEXT, -- For Blue Collar (e.g. "2 hours")
    skills TEXT, -- Comma separated skills
    experience_level TEXT, -- For White Collar (Entry, Mid, Senior)
    availability TEXT, -- For Blue Collar (Weekends, Evenings, etc.)
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (For Matching)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT, -- e.g. "Plumber", "Developer"
    location TEXT,
    skills TEXT, -- Comma separated
    experience_years INTEGER,
    availability TEXT,
    resume_url TEXT,
    bio TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avg_rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, reviewer_id) -- Prevent double reviews
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shortlisted', 'Rejected', 'Accepted', 'In Progress', 'Completed', 'Cancelled')),
    resume_url TEXT, -- For White Collar
    cover_letter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user ON profiles(user_id);
