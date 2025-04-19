// This script downloads assets for the EduSphere platform
const fs = require("fs");
const path = require("path");
const https = require("https");
const { exec } = require("child_process");

// Create directories if they don't exist
const directories = [
  "public/images",
  "public/images/profiles",
  "public/images/courses",
  "public/images/testimonials",
  "public/images/team",
  "public/images/banners",
  "public/assets/3d",
];

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${filename}`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filename);
        console.error(`Error downloading ${url}: ${err.message}`);
        reject(err);
      });
  });
}

// Testimonial profile images
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Math Tutor",
    url: "https://randomuser.me/api/portraits/women/55.jpg",
    filename: "public/images/testimonials/sarah-johnson.jpg",
  },
  {
    name: "Michael Chen",
    role: "Computer Science Student",
    url: "https://randomuser.me/api/portraits/men/34.jpg",
    filename: "public/images/testimonials/michael-chen.jpg",
  },
  {
    name: "Emily Rodriguez",
    role: "Language Arts Professor",
    url: "https://randomuser.me/api/portraits/women/68.jpg",
    filename: "public/images/testimonials/emily-rodriguez.jpg",
  },
];

// Team member profile images
const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-founder",
    url: "https://randomuser.me/api/portraits/women/23.jpg",
    filename: "public/images/team/sarah-johnson.jpg",
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-founder",
    url: "https://randomuser.me/api/portraits/men/45.jpg",
    filename: "public/images/team/michael-chen.jpg",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Education",
    url: "https://randomuser.me/api/portraits/women/33.jpg",
    filename: "public/images/team/emily-rodriguez.jpg",
  },
  {
    name: "David Kim",
    role: "Lead Designer",
    url: "https://randomuser.me/api/portraits/men/22.jpg",
    filename: "public/images/team/david-kim.jpg",
  },
];

// Tutor profile images
const tutors = [
  {
    name: "John Smith",
    url: "https://randomuser.me/api/portraits/men/32.jpg",
    filename: "public/images/profiles/john-smith.jpg",
  },
  {
    name: "Maria Garcia",
    url: "https://randomuser.me/api/portraits/women/28.jpg",
    filename: "public/images/profiles/maria-garcia.jpg",
  },
  {
    name: "Robert Johnson",
    url: "https://randomuser.me/api/portraits/men/52.jpg",
    filename: "public/images/profiles/robert-johnson.jpg",
  },
  {
    name: "Lisa Wong",
    url: "https://randomuser.me/api/portraits/women/42.jpg",
    filename: "public/images/profiles/lisa-wong.jpg",
  },
];

// Course thumbnails from Unsplash (education related)
const courses = [
  {
    title: "Introduction to Mathematics",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
    filename: "public/images/courses/mathematics.jpg",
  },
  {
    title: "Computer Science Fundamentals",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    filename: "public/images/courses/computer-science.jpg",
  },
  {
    title: "English Literature",
    url: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7",
    filename: "public/images/courses/english-literature.jpg",
  },
  {
    title: "Physics for Beginners",
    url: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    filename: "public/images/courses/physics.jpg",
  },
  {
    title: "Web Development Bootcamp",
    url: "https://images.unsplash.com/photo-1579403124614-197f69d8187b",
    filename: "public/images/courses/web-development.jpg",
  },
  {
    title: "Digital Marketing",
    url: "https://images.unsplash.com/photo-1611926653458-09294b3142bf",
    filename: "public/images/courses/digital-marketing.jpg",
  },
];

// Banner images
const banners = [
  {
    name: "Learning Banner",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
    filename: "public/images/banners/learning-banner.jpg",
  },
  {
    name: "Education Banner",
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    filename: "public/images/banners/education-banner.jpg",
  },
  {
    name: "Team Banner",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    filename: "public/images/banners/team-banner.jpg",
  },
];

// 3D model URLs (these could be GitHub raw URLs to GLB files)
const models3D = [
  {
    name: "Book 3D Model",
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/book.glb",
    filename: "public/assets/3d/book.glb",
  },
  {
    name: "Globe 3D Model",
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/globe.glb",
    filename: "public/assets/3d/globe.glb",
  },
  {
    name: "Classroom 3D Model",
    url: "https://raw.githubusercontent.com/pmndrs/drei-assets/master/classroom.glb",
    filename: "public/assets/3d/classroom.glb",
  },
];

// Combine all assets to download
const allAssets = [
  ...testimonials,
  ...teamMembers,
  ...tutors,
  ...courses,
  ...banners,
  ...models3D,
];

// Download all assets
async function downloadAllAssets() {
  const promises = allAssets.map((asset) =>
    downloadImage(asset.url, asset.filename)
  );

  try {
    await Promise.all(promises);
    console.log("All assets downloaded successfully!");

    // Update the testimonials in the seed file
    updateTestimonialsInSeedFile();

    // Update the fallback testimonials in the API content route
    updateFallbackTestimonials();
  } catch (error) {
    console.error("Error downloading assets:", error);
  }
}

// Update the testimonials in the seed.sql file
function updateTestimonialsInSeedFile() {
  const seedFilePath = path.join(__dirname, "../supabase/seed.sql");

  if (fs.existsSync(seedFilePath)) {
    let seedContent = fs.readFileSync(seedFilePath, "utf8");

    // Replace placeholder image URLs with the downloaded ones
    testimonials.forEach((testimonial) => {
      const imageRelativePath = testimonial.filename.replace("public", "");
      const regex = new RegExp(
        `'${testimonial.name}'.*?'/placeholder\\.svg\\?height=80&width=80'`,
        "s"
      );
      seedContent = seedContent.replace(
        regex,
        `'${testimonial.name}', '${testimonial.role}', '${imageRelativePath}'`
      );
    });

    fs.writeFileSync(seedFilePath, seedContent);
    console.log("Updated testimonials in seed.sql file");
  } else {
    console.log("seed.sql file not found, skipping testimonials update");
  }
}

// Update the fallback testimonials in the API content route
function updateFallbackTestimonials() {
  const contentFilePath = path.join(__dirname, "../app/api/content/route.ts");

  if (fs.existsSync(contentFilePath)) {
    let content = fs.readFileSync(contentFilePath, "utf8");

    // Replace placeholder image URLs with the downloaded ones
    testimonials.forEach((testimonial) => {
      const imageRelativePath = testimonial.filename.replace("public", "");
      const regex = new RegExp(
        `name: "${testimonial.name}",[\\s\\S]*?image_url: "/placeholder\\.svg\\?height=80&width=80"`,
        "g"
      );
      content = content.replace(
        regex,
        `name: "${testimonial.name}",\n      role: "${testimonial.role}",\n      image_url: "${imageRelativePath}"`
      );
    });

    fs.writeFileSync(contentFilePath, content);
    console.log("Updated fallback testimonials in API content route");
  } else {
    console.log(
      "API content route file not found, skipping fallback testimonials update"
    );
  }
}

// Execute the download
downloadAllAssets();

console.log("Asset download script started...");
