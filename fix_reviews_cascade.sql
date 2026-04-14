-- 1. First, we need to find the name of the foreign key constraint. Usually, it's 'reviews_job_id_fkey'.
-- Run this command first just to be sure to drop the existing ON DELETE CASCADE constraint.
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_job_id_fkey;

-- 2. Now add it back with ON DELETE SET NULL instead of ON DELETE CASCADE
ALTER TABLE public.reviews
ADD CONSTRAINT reviews_job_id_fkey
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;
