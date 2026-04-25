-- Create table for Time Exchange hiring requests
CREATE TABLE IF NOT EXISTS public.time_exchange_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    time_exchange_id UUID REFERENCES public.time_exchanges(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add notification type for TE requests
-- (No SQL needed for types if they are just strings in the notification table)
