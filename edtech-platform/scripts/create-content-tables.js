// This script creates and populates the features and testimonials tables in Supabase
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

async function createFeaturesTable() {
  // Check if the table exists
  const { error: checkError } = await supabase
    .from("features")
    .select("id")
    .limit(1);

  // If the table doesn't exist, create it
  if (checkError && checkError.code === "PGRST116") {
    console.log("Creating features table...");

    const { error } = await supabase.rpc("create_features_table", {});

    if (error) {
      console.error("Error creating features table:", error);
      return false;
    }

    console.log("Features table created successfully");
  } else {
    console.log("Features table already exists");
  }

  return true;
}

async function createTestimonialsTable() {
  // Check if the table exists
  const { error: checkError } = await supabase
    .from("testimonials")
    .select("id")
    .limit(1);

  // If the table doesn't exist, create it
  if (checkError && checkError.code === "PGRST116") {
    console.log("Creating testimonials table...");

    const { error } = await supabase.rpc("create_testimonials_table", {});

    if (error) {
      console.error("Error creating testimonials table:", error);
      return false;
    }

    console.log("Testimonials table created successfully");
  } else {
    console.log("Testimonials table already exists");
  }

  return true;
}

async function populateFeaturesData() {
  console.log("Populating features data...");

  // Delete existing data
  await supabase
    .from("features")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert sample data
  const { error } = await supabase.from("features").insert([
    {
      icon_name: "video",
      title: "AI-Enhanced Video Content",
      description:
        "Automatically generate transcripts for all your course videos, making content more accessible and searchable.",
      display_order: 1,
    },
    {
      icon_name: "users",
      title: "Real-Time Interaction",
      description:
        "Connect with tutors and peers through course-specific chat rooms for immediate feedback and collaboration.",
      display_order: 2,
    },
    {
      icon_name: "book",
      title: "Comprehensive Course Management",
      description:
        "Create, edit, and organize your courses with an intuitive dashboard for both tutors and students.",
      display_order: 3,
    },
    {
      icon_name: "message",
      title: "Live Chat Support",
      description:
        "Get help when you need it with our real-time messaging system integrated into every course.",
      display_order: 4,
    },
    {
      icon_name: "zap",
      title: "Seamless Learning Experience",
      description:
        "Enjoy a fluid, responsive interface designed to enhance your educational journey.",
      display_order: 5,
    },
    {
      icon_name: "award",
      title: "Certification & Achievement",
      description:
        "Track your progress and earn certificates upon course completion to showcase your new skills.",
      display_order: 6,
    },
  ]);

  if (error) {
    console.error("Error populating features data:", error);
    return false;
  }

  console.log("Features data populated successfully");
  return true;
}

async function populateTestimonialsData() {
  console.log("Populating testimonials data...");

  // Delete existing data
  await supabase
    .from("testimonials")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  // Insert sample data
  const { error } = await supabase.from("testimonials").insert([
    {
      name: "Sarah Johnson",
      role: "Math Tutor",
      image_url: "/placeholder.svg?height=80&width=80",
      content:
        "EduSphere has transformed how I teach. The AI transcription feature saves me hours of work, and the real-time chat keeps my students engaged like never before.",
      rating: 5,
      display_order: 1,
    },
    {
      name: "Michael Chen",
      role: "Computer Science Student",
      image_url: "/placeholder.svg?height=80&width=80",
      content:
        "As a student with a hearing impairment, the automatic transcripts have been a game-changer for me. I can now fully participate in all my courses without missing anything.",
      rating: 5,
      display_order: 2,
    },
    {
      name: "Emily Rodriguez",
      role: "Language Arts Professor",
      image_url: "/placeholder.svg?height=80&width=80",
      content:
        "The course management tools are intuitive and powerful. I've been able to create more engaging content and track my students' progress more effectively.",
      rating: 4,
      display_order: 3,
    },
  ]);

  if (error) {
    console.error("Error populating testimonials data:", error);
    return false;
  }

  console.log("Testimonials data populated successfully");
  return true;
}

async function main() {
  try {
    // First attempt to directly insert data - if tables exist
    const directInsertFeatures = await populateFeaturesData();
    const directInsertTestimonials = await populateTestimonialsData();

    if (directInsertFeatures && directInsertTestimonials) {
      console.log("All operations completed successfully using direct insert!");
      return;
    }

    // If we need to create tables first, let's create the SQL functions
    console.log("Creating SQL functions for table creation...");

    // Create SQL function to create features table
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_features_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.features (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            icon_name TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            display_order INT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    // Create SQL function to create testimonials table
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_testimonials_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS public.testimonials (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            image_url TEXT NOT NULL,
            content TEXT NOT NULL,
            rating INT NOT NULL,
            display_order INT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    // Create tables
    await createFeaturesTable();
    await createTestimonialsTable();

    // Populate data
    await populateFeaturesData();
    await populateTestimonialsData();

    console.log("All operations completed successfully!");
  } catch (error) {
    console.error("An error occurred during script execution:", error);
  }
}

main();
