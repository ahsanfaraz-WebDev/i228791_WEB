-- Create features table
CREATE TABLE IF NOT EXISTS public.features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    icon_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order SMALLINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT,
    content TEXT NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    display_order SMALLINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Insert default features data
INSERT INTO public.features (icon_name, title, description, display_order) 
VALUES
    ('video', 'AI-Enhanced Video Content', 'Automatically generate transcripts for all your course videos, making content more accessible and searchable.', 1),
    ('users', 'Real-Time Interaction', 'Connect with tutors and peers through course-specific chat rooms for immediate feedback and collaboration.', 2),
    ('book', 'Comprehensive Course Management', 'Create, edit, and organize your courses with an intuitive dashboard for both tutors and students.', 3),
    ('message', 'Live Chat Support', 'Get help when you need it with our real-time messaging system integrated into every course.', 4),
    ('zap', 'Seamless Learning Experience', 'Enjoy a fluid, responsive interface designed to enhance your educational journey.', 5),
    ('award', 'Certification & Achievement', 'Track your progress and earn certificates upon course completion to showcase your new skills.', 6);

-- Insert default testimonials data
INSERT INTO public.testimonials (name, role, image_url, content, rating, display_order)
VALUES
    ('Sarah Johnson', 'Math Tutor', '/images/testimonials/sarah-johnson.jpg', 'EduSphere has transformed how I teach. The AI transcription feature saves me hours of work, and the real-time chat keeps my students engaged like never before.', 5, 1),
    ('Michael Chen', 'Computer Science Student', '/images/testimonials/michael-chen.jpg', 'As a student with a hearing impairment, the automatic transcripts have been a game-changer for me. I can now fully participate in all my courses without missing anything.', 5, 2),
    ('Emily Rodriguez', 'Language Arts Professor', '/images/testimonials/emily-rodriguez.jpg', 'The course management tools are intuitive and powerful. I've been able to create more engaging content and track my students' progress more effectively.', 4, 3); 