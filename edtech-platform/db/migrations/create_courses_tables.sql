-- Update courses table to add student_count column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'courses' AND column_name = 'student_count'
  ) THEN
    ALTER TABLE public.courses ADD COLUMN student_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function for incrementing counters
CREATE OR REPLACE FUNCTION increment(row_id UUID, table_name TEXT, column_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  current_value INTEGER;
BEGIN
  EXECUTE format('SELECT %I FROM %I WHERE id = $1', column_name, table_name)
  INTO current_value
  USING row_id;
  
  current_value := COALESCE(current_value, 0) + 1;
  
  EXECUTE format('UPDATE %I SET %I = $1 WHERE id = $2', table_name, column_name)
  USING current_value, row_id;
  
  RETURN current_value;
END;
$$ LANGUAGE plpgsql; 