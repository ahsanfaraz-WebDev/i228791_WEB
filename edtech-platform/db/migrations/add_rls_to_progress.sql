-- Enable Row Level Security on progress table
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create policies for the progress table
-- Allow insert for students who are enrolled in the course
CREATE POLICY "Students can insert their own progress"
    ON public.progress
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.id = progress.enrollment_id
            AND e.student_id = auth.uid()
        )
    );

-- Allow students to view their own progress
CREATE POLICY "Students can view their own progress"
    ON public.progress
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.id = progress.enrollment_id
            AND e.student_id = auth.uid()
        )
    );

-- Allow tutors to view progress for courses they own
CREATE POLICY "Tutors can view progress for their courses"
    ON public.progress
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.courses c ON e.course_id = c.id
            WHERE e.id = progress.enrollment_id
            AND c.tutor_id = auth.uid()
        )
    );

-- Allow students to update their own progress
CREATE POLICY "Students can update their own progress"
    ON public.progress
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.id = progress.enrollment_id
            AND e.student_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.id = progress.enrollment_id
            AND e.student_id = auth.uid()
        )
    );

-- Allow service role full access
CREATE POLICY "Service role can do anything"
    ON public.progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 