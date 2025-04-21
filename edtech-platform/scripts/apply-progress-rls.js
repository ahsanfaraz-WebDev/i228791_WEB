// This script applies RLS policies to the progress table
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
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

async function applyRLSPolicies() {
  try {
    console.log("Applying RLS policies to progress table...");

    // Read the SQL file
    const sqlPath = path.resolve(
      __dirname,
      "../db/migrations/add_rls_to_progress.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split SQL statements and execute them one by one
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 60)}...`);

      const { error } = await supabase.sql(`${statement};`);

      if (error) {
        // If policy already exists, that's okay
        if (error.message && error.message.includes("already exists")) {
          console.log("Policy already exists, continuing...");
        } else {
          console.error(`Error executing SQL: ${JSON.stringify(error)}`);
          return false;
        }
      }
    }

    console.log("RLS policies applied successfully!");
    return true;
  } catch (error) {
    console.error("Error applying RLS policies:", error);
    return false;
  }
}

async function main() {
  try {
    const success = await applyRLSPolicies();

    if (success) {
      console.log("RLS setup completed successfully");
    } else {
      console.error("RLS setup failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("An error occurred during script execution:", error);
    process.exit(1);
  }
}

main();
