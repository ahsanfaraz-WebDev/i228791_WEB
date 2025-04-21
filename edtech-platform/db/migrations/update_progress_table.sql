-- Update the watched_seconds column in the progress table from FLOAT to INTEGER
-- This is needed because the production table seems to be using INTEGER instead of FLOAT

-- First try a simple alter table if the column exists as FLOAT
DO $$
BEGIN
  -- Check if the watched_seconds column is of type FLOAT
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'progress' 
      AND column_name = 'watched_seconds' 
      AND data_type IN ('double precision', 'real')
  ) THEN
    -- Alter the column to INTEGER, converting the existing values to integers
    ALTER TABLE public.progress 
    ALTER COLUMN watched_seconds TYPE INTEGER USING (watched_seconds::INTEGER);
    
    RAISE NOTICE 'Column watched_seconds converted from FLOAT to INTEGER';
  ELSE
    RAISE NOTICE 'Column watched_seconds is not of type FLOAT or does not exist';
  END IF;
END
$$; 