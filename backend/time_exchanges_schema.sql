-- Create time_exchanges table
CREATE TABLE IF NOT EXISTS public.time_exchanges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    travel_date_start DATE NOT NULL,
    travel_date_end DATE NOT NULL,
    available_for_work BOOLEAN DEFAULT false,
    skills TEXT, -- Comma separated skills
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS (Row Level Security)
ALTER TABLE public.time_exchanges ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public time exchanges are viewable by everyone" 
ON public.time_exchanges FOR SELECT USING (true);

CREATE POLICY "Users can create their own time exchanges" 
ON public.time_exchanges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time exchanges" 
ON public.time_exchanges FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time exchanges" 
ON public.time_exchanges FOR DELETE USING (auth.uid() = user_id);
