# EduSphere - Modern Education Platform

EduSphere is a comprehensive education platform built with Next.js, Supabase, and React Three Fiber, designed to connect tutors with students through interactive courses.

## Features

- User authentication with Supabase Auth
- Course creation and management
- Video lessons with progress tracking
- Student enrollment and payment with Stripe
- Interactive 3D elements using React Three Fiber
- Responsive design with modern UI using Tailwind CSS

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Image Assets Management

The project includes scripts to download and update images for a better visual experience:

### Downloading Assets

Run the download script to fetch profile pictures, course thumbnails, and other images:

```bash
node scripts/download-assets.js
```

This will:

- Create necessary directories in `/public/images/`
- Download profile pictures for testimonials and team members
- Download course thumbnails from Unsplash
- Download banner images for different sections
- Download 3D models for the interactive elements

### Updating Supabase Images

After downloading the images, you can update the Supabase database to use these images:

```bash
node scripts/update-course-images.js
```

This script will:

- Update course thumbnails with the downloaded images
- Update tutor profile pictures with the downloaded images

## Image Asset Structure

The project organizes images in the following structure:

```
/public
  /images
    /profiles      # User profile pictures
    /courses       # Course thumbnails
    /testimonials  # Testimonial profile pictures
    /team          # Team member pictures
    /banners       # Banner images for different sections
  /assets
    /3d            # 3D models for interactive elements
```

## Development

- The project uses Next.js App Router
- Authentication is handled through Supabase Auth
- Database operations are performed via Supabase API
- Styling is done with Tailwind CSS with shadcn/ui components
- 3D elements are created with React Three Fiber and drei

## Deployment

Deploy to Vercel or any other Next.js-compatible hosting service.

## License

MIT
