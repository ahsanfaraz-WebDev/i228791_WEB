-- Create the progress table for video watching progress
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    watched_seconds FLOAT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(enrollment_id, video_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_enrollment_id ON public.progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_progress_video_id ON public.progress(video_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.progress
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 