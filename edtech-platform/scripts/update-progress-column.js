// This script applies the SQL to update the watched_seconds column type
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

async function updateProgressColumn() {
  try {
    console.log("Updating progress table column type...");

    // Read the SQL file
    const sqlPath = path.resolve(
      __dirname,
      "../db/migrations/update_progress_table.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Create a function to execute the SQL
    const { error: funcError } = await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION convert_watched_seconds_to_integer()
        RETURNS void AS $$
        BEGIN
          IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'progress' 
              AND column_name = 'watched_seconds' 
              AND data_type IN ('double precision', 'real')
          ) THEN
            ALTER TABLE public.progress 
            ALTER COLUMN watched_seconds TYPE INTEGER USING (watched_seconds::INTEGER);
            
            RAISE NOTICE 'Column watched_seconds converted from FLOAT to INTEGER';
          ELSE
            RAISE NOTICE 'Column watched_seconds is not of type FLOAT or does not exist';
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `,
    });

    if (funcError) {
      if (
        funcError.message &&
        funcError.message.includes('function "exec_sql" does not exist')
      ) {
        // Create exec_sql function first
        const { error: createFuncError } = await supabase.rpc(
          "create_exec_sql_function",
          {}
        );

        if (createFuncError) {
          console.error(
            `Error creating exec_sql function: ${JSON.stringify(
              createFuncError
            )}`
          );
          return false;
        }

        // Try again
        const { error: retryFuncError } = await supabase.rpc("exec_sql", {
          sql_string: `
            CREATE OR REPLACE FUNCTION convert_watched_seconds_to_integer()
            RETURNS void AS $$
            BEGIN
              IF EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'progress' 
                  AND column_name = 'watched_seconds' 
                  AND data_type IN ('double precision', 'real')
              ) THEN
                ALTER TABLE public.progress 
                ALTER COLUMN watched_seconds TYPE INTEGER USING (watched_seconds::INTEGER);
                
                RAISE NOTICE 'Column watched_seconds converted from FLOAT to INTEGER';
              ELSE
                RAISE NOTICE 'Column watched_seconds is not of type FLOAT or does not exist';
              END IF;
            END;
            $$ LANGUAGE plpgsql;
          `,
        });

        if (retryFuncError) {
          console.error(
            `Error creating conversion function: ${JSON.stringify(
              retryFuncError
            )}`
          );
          return false;
        }
      } else {
        console.error(
          `Error creating conversion function: ${JSON.stringify(funcError)}`
        );
        return false;
      }
    }

    // Execute the function
    const { error } = await supabase.rpc("convert_watched_seconds_to_integer");

    if (error) {
      console.error(`Error updating column type: ${JSON.stringify(error)}`);
      return false;
    }

    console.log("Progress table column type update applied!");
    return true;
  } catch (error) {
    console.error("Error updating column type:", error);
    return false;
  }
}

// Also check the current type for better diagnosis
async function checkColumnType() {
  try {
    console.log("Checking the current watched_seconds column type...");

    const { data, error } = await supabase.rpc("exec_sql", {
      sql_string: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'progress' 
          AND column_name = 'watched_seconds'
      `,
    });

    if (error) {
      if (
        error.message &&
        error.message.includes('function "exec_sql" does not exist')
      ) {
        console.log("exec_sql function doesn't exist yet, skipping check");
      } else {
        console.error(`Error checking column type: ${JSON.stringify(error)}`);
      }
    } else {
      console.log("Column type:", data);
    }

    return true;
  } catch (error) {
    console.error("Error checking column type:", error);
    return false;
  }
}

async function main() {
  try {
    await checkColumnType();
    const success = await updateProgressColumn();

    if (success) {
      console.log("Column type update completed successfully");

      // Check again after the update
      await checkColumnType();
    } else {
      console.error("Column type update failed");
      process.exit(1);
    }
  } catch (error) {
    console.error("An error occurred during script execution:", error);
    process.exit(1);
  }
}

main();
