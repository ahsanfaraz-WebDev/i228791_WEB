-- Add new columns to the profiles table if they don't exist already

-- Check and add bio column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
  END IF;
END $$;

-- Check and add avatar_url column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Tutor-specific columns

-- Check and add teaching_experience column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'teaching_experience'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN teaching_experience TEXT;
  END IF;
END $$;

-- Check and add credentials column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'credentials'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN credentials TEXT;
  END IF;
END $$;

-- Check and add teaching_areas column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'teaching_areas'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN teaching_areas TEXT;
  END IF;
END $$;

-- Make sure the updated_at column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END $$;

-- Add a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS set_timestamp ON public.profiles;

-- Create the trigger
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Update any NULL avatar_url values to use placeholder
UPDATE profiles 
SET avatar_url = '/placeholder.svg' 
WHERE avatar_url IS NULL OR avatar_url = ''; 