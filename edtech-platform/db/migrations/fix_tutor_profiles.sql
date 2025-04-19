-- Ensure all tutor_id values in courses reference valid user IDs
-- This script creates default profiles for any tutor_id values that don't have matching profile records

-- Find course tutor_ids that don't have matching profiles
DO $$ 
DECLARE
    tutor_id_without_profile UUID;
    tutor_cursor CURSOR FOR 
        SELECT DISTINCT c.tutor_id 
        FROM courses c
        LEFT JOIN profiles p ON c.tutor_id = p.id
        WHERE p.id IS NULL AND c.tutor_id IS NOT NULL;
BEGIN
    -- For each tutor_id without a profile
    OPEN tutor_cursor;
    LOOP
        -- Get the next tutor ID
        FETCH tutor_cursor INTO tutor_id_without_profile;
        EXIT WHEN NOT FOUND;
        
        -- Insert a default profile for this tutor ID
        INSERT INTO profiles (
            id, 
            full_name, 
            avatar_url, 
            bio, 
            role,
            created_at,
            updated_at
        ) VALUES (
            tutor_id_without_profile,
            'Instructor ' || SUBSTR(tutor_id_without_profile::text, 1, 6),
            '/placeholder.svg',
            'Course instructor profile.',
            'tutor',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created missing profile for tutor ID: %', tutor_id_without_profile;
    END LOOP;
    CLOSE tutor_cursor;
END $$;

-- Update any NULL avatar_url values to use placeholder
UPDATE profiles 
SET avatar_url = '/placeholder.svg' 
WHERE avatar_url IS NULL OR avatar_url = '';

-- Ensure the student_count column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'student_count'
    ) THEN
        ALTER TABLE public.courses ADD COLUMN student_count INTEGER DEFAULT 0;
    END IF;
END $$; 