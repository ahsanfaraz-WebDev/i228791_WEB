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
3. Run the environment setup script: `npm run setup-env`
4. Edit the `.env.local` file and fill in your API keys (Supabase, Stripe, etc.)
5. Run the development server: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Stripe Integration

To enable payments with Stripe, you need to add the following environment variables to your `.env.local` file:

```bash
# Stripe API keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

You can obtain these keys from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys):

1. Sign up for a Stripe account if you don't have one
2. Navigate to Developers > API keys
3. Copy your Publishable key and Secret key
4. Add them to your `.env.local` file

For production, make sure to use your live Stripe keys instead of test keys.

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
