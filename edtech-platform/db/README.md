# Database Setup Guide

This directory contains SQL migrations to set up the necessary database tables for the EdTech platform.

## Creating Content Tables

The `migrations/create_content_tables.sql` script creates and populates the following tables:

- `features` - Contains feature information displayed on the homepage
- `testimonials` - Contains testimonial information displayed on the homepage

## Course-Related Tables

The `migrations/create_courses_tables.sql` script updates the course-related tables with:

- Adds `student_count` column to the courses table if it doesn't exist
- Creates an `increment` function for efficiently incrementing counter columns

## Fixing Data Issues

The `migrations/fix_tutor_profiles.sql` script fixes common data issues:

- Creates default profiles for any tutor_id values in courses that don't have matching profile records
- Updates any NULL avatar_url values to use placeholders
- Ensures the student_count column exists on the courses table

## User Profiles

The `migrations/update_profiles_table.sql` script updates the user profiles table with:

- Adds bio and avatar_url columns for all users
- Adds teaching-specific fields for tutors (teaching_experience, credentials, teaching_areas)
- Creates an auto-updating timestamp trigger for the updated_at column

## Creating Core Tables

The `migrations/create_profiles_table.sql` script creates the core profiles table if it doesn't exist:

- Creates the profiles table linked to Supabase Auth users
- Sets up an automatic trigger to create profile entries for new users
- Includes fields for basic user information and tutor-specific details

### Running the Migration

You can run the migration script in one of the following ways:

#### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `migrations/create_content_tables.sql`
4. Click "Run" to execute the script

#### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db reset
```

This will apply all migrations in the `migrations` directory.

#### Option 3: Using psql

If you have direct access to the database with psql:

```bash
psql -h YOUR_POSTGRES_HOST -U postgres -d postgres -f migrations/create_content_tables.sql
```

Replace `YOUR_POSTGRES_HOST` with your actual Postgres host.

## Troubleshooting

If you're still encountering errors about missing tables:

1. Check that the migration was applied successfully
2. Verify that the tables exist in the public schema
3. Ensure your application has the correct permissions to access these tables

You can query the tables to verify they exist:

```sql
SELECT * FROM public.features;
SELECT * FROM public.testimonials;
```

## Troubleshooting Tutor Profiles

If you're experiencing 404 errors or missing tutor profiles:

1. Run the `fix_tutor_profiles.sql` migration to create default profiles for any missing tutors
2. Check the structure of your avatar URLs in the profiles table:
   ```sql
   SELECT id, full_name, avatar_url FROM profiles WHERE role = 'tutor';
   ```
3. If using Supabase Storage for avatar images, ensure the URLs are properly formatted
   - Full URLs should begin with 'http://' or 'https://'
   - Relative paths should begin with '/'
   - Storage paths (like 'avatars/image.jpg') will be automatically converted by the application

This application includes a helper utility (`formatStorageUrl` in `lib/utils.ts`) that handles various URL formats and provides fallbacks when images are not found.
