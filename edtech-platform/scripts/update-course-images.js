// This script updates course thumbnails in Supabase
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: Supabase URL or Service Key is missing in environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Course images to use
const courseImages = [
  {
    title: "Introduction to Mathematics",
    image: "/images/courses/mathematics.jpg",
  },
  {
    title: "Computer Science Fundamentals",
    image: "/images/courses/computer-science.jpg",
  },
  {
    title: "English Literature",
    image: "/images/courses/english-literature.jpg",
  },
  {
    title: "Physics for Beginners",
    image: "/images/courses/physics.jpg",
  },
  {
    title: "Web Development Bootcamp",
    image: "/images/courses/web-development.jpg",
  },
  {
    title: "Digital Marketing",
    image: "/images/courses/digital-marketing.jpg",
  },
];

// Update course thumbnails in Supabase
async function updateCourseThumbnails() {
  try {
    // Get all courses
    const { data: courses, error } = await supabase.from("courses").select("*");

    if (error) {
      throw error;
    }

    if (!courses || courses.length === 0) {
      console.log("No courses found");
      return;
    }

    console.log(`Found ${courses.length} courses to update`);

    // Update each course with a random image
    for (const course of courses) {
      // Select a random image from our collection
      const randomImageIndex = Math.floor(Math.random() * courseImages.length);
      const imageToUse = courseImages[randomImageIndex].image;

      console.log(
        `Updating course "${course.title}" with image: ${imageToUse}`
      );

      // Update the course thumbnail_url
      const { error: updateError } = await supabase
        .from("courses")
        .update({ thumbnail_url: imageToUse })
        .eq("id", course.id);

      if (updateError) {
        console.error(`Error updating course ${course.id}:`, updateError);
      }
    }

    console.log("Course thumbnails updated successfully");
  } catch (error) {
    console.error("Error updating course thumbnails:", error);
  }
}

// Update tutor profile images
async function updateTutorProfiles() {
  try {
    // Profile images to use
    const profileImages = [
      "/images/profiles/john-smith.jpg",
      "/images/profiles/maria-garcia.jpg",
      "/images/profiles/robert-johnson.jpg",
      "/images/profiles/lisa-wong.jpg",
    ];

    // Get profiles with role = 'tutor'
    const { data: tutors, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "tutor");

    if (error) {
      throw error;
    }

    if (!tutors || tutors.length === 0) {
      console.log("No tutors found");
      return;
    }

    console.log(`Found ${tutors.length} tutors to update`);

    // Update each tutor with a random profile image
    for (const tutor of tutors) {
      // Select a random image from our collection
      const randomImageIndex = Math.floor(Math.random() * profileImages.length);
      const imageToUse = profileImages[randomImageIndex];

      console.log(
        `Updating tutor "${tutor.full_name}" with image: ${imageToUse}`
      );

      // Update the tutor avatar_url
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: imageToUse })
        .eq("id", tutor.id);

      if (updateError) {
        console.error(`Error updating tutor ${tutor.id}:`, updateError);
      }
    }

    console.log("Tutor profile images updated successfully");
  } catch (error) {
    console.error("Error updating tutor profiles:", error);
  }
}

// Run the update functions
async function main() {
  await updateCourseThumbnails();
  await updateTutorProfiles();
  console.log("Image update complete!");
}

main();
