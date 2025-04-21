// This script creates the progress table in Supabase
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

async function createProgressTable() {
  try {
    console.log("Checking if progress table exists...");
    
    // Check if the table exists
    const { error: checkError } = await supabase
      .from("progress")
      .select("id")
      .limit(1);

    // If the table exists, we're done
    if (!checkError) {
      console.log("Progress table already exists");
      return true;
    }

    if (checkError.code !== "PGRST116") {
      console.error("Unexpected error checking for progress table:", checkError);
      return false;
    }

    console.log("Creating progress table...");

    // Read the SQL file
    const sqlPath = path.resolve(__dirname, "../db/migrations/create_progress_table.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", {
      sql_string: sql
    });

    if (error) {
      console.error("Error creating progress table:", error);
      
      // Fallback to direct SQL function creation if exec_sql doesn't exist
      if (error.message.includes("function \"exec_sql\" does not exist")) {
        console.log("Creating exec_sql function...");
        
        // Create the exec_sql function first
        const { error: funcError } = await supabase.rpc("create_exec_sql_function", {});
        
        if (funcError) {
          console.error("Error creating exec_sql function:", funcError);
          
          // Final fallback: Create the function directly via SQL
          console.log("Creating exec_sql function directly...");
          const { error: directError } = await supabase.rpc("rls_disable");
          
          if (directError) {
            console.error("Cannot disable RLS to create function:", directError);
            return false;
          }
          
          const { error: sqlError } = await supabase.sql(`
            CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql_string;
            END;
            $$;
          `);
          
          if (sqlError) {
            console.error("Error creating exec_sql function directly:", sqlError);
            return false;
          }
          
          // Re-enable RLS
          await supabase.rpc("rls_enable");
          
          // Try again with the newly created function
          const { error: retryError } = await supabase.rpc("exec_sql", {
            sql_string: sql
          });
          
          if (retryError) {
            console.error("Error creating progress table after creating exec_sql function:", retryError);
            return false;
          }
        } else {
          // Try again with the newly created function
          const { error: retryError } = await supabase.rpc("exec_sql", {
            sql_string: sql
          });
          
          if (retryError) {
            console.error("Error creating progress table after creating exec_sql function:", retryError);
            return false;
          }
        }
      } else {
        return false;
      }
    }

    console.log("Progress table created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating progress table:", error);
    return false;
  }
}

async function main() {
  try {
    const success = await createProgressTable();
    
    if (success) {
      console.log("Progress table setup completed successfully");
    } else {
      console.error("Progress table setup failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("An error occurred during script execution:", error);
    process.exit(1);
  }
}

main(); 