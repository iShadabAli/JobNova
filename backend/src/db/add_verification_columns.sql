-- Script to add verification columns to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_document_url TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Update existing profiles to 'unverified' if null
UPDATE profiles SET verification_status = 'unverified' WHERE verification_status IS NULL;
