// This script diagnoses issues with the progress table in Supabase
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

async function checkTableInfo(tableName) {
  console.log(`\n=== Checking Table: ${tableName} ===`);

  try {
    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    if (tableError) {
      console.error(`Table check error: ${JSON.stringify(tableError)}`);
      console.log(
        `Table '${tableName}' likely doesn't exist or has permission issues`
      );
      return false;
    }

    console.log(`Table '${tableName}' exists and is accessible`);

    // Get table structure info
    const { data: tableInfo, error: infoError } = await supabase.rpc(
      "get_table_info",
      {
        table_name: tableName,
      }
    );

    if (infoError) {
      console.error(`Unable to get table info: ${JSON.stringify(infoError)}`);

      // Try to create the function if it doesn't exist
      if (
        infoError.message &&
        infoError.message.includes('function "get_table_info" does not exist')
      ) {
        console.log("Creating table info function...");

        try {
          // Create a function to get table structure
          const { error: createFuncError } = await supabase.sql(`
            CREATE OR REPLACE FUNCTION get_table_info(table_name text)
            RETURNS TABLE (
              column_name text,
              data_type text,
              is_nullable text,
              column_default text
            )
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                columns.column_name::text,
                columns.data_type::text,
                columns.is_nullable::text,
                columns.column_default::text
              FROM 
                information_schema.columns
              WHERE 
                columns.table_name = table_name
                AND columns.table_schema = 'public';
            END;
            $$;
          `);

          if (createFuncError) {
            console.error(
              `Failed to create function: ${JSON.stringify(createFuncError)}`
            );
            return false;
          }

          // Try again
          const { data: retryTableInfo, error: retryInfoError } =
            await supabase.rpc("get_table_info", {
              table_name: tableName,
            });

          if (retryInfoError) {
            console.error(
              `Still unable to get table info: ${JSON.stringify(
                retryInfoError
              )}`
            );
            return false;
          }

          console.log("Table structure:");
          console.table(retryTableInfo);
        } catch (funcError) {
          console.error(`Error creating function: ${funcError}`);
          return false;
        }
      } else {
        return false;
      }
    } else {
      console.log("Table structure:");
      console.table(tableInfo);
    }

    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error(`Unable to get row count: ${JSON.stringify(countError)}`);
    } else {
      console.log(`Row count: ${count}`);
    }

    // Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select("*")
      .limit(3);

    if (sampleError) {
      console.error(
        `Unable to get sample data: ${JSON.stringify(sampleError)}`
      );
    } else {
      console.log("Sample data:");
      console.log(JSON.stringify(sampleData, null, 2));
    }

    return true;
  } catch (err) {
    console.error(`Unexpected error checking table ${tableName}: ${err}`);
    return false;
  }
}

async function checkRLS(tableName) {
  console.log(`\n=== Checking RLS Policies for Table: ${tableName} ===`);

  try {
    // Check RLS policies
    const { data: rlsPolicies, error: rlsError } = await supabase.rpc(
      "get_rls_policies",
      {
        table_name: tableName,
      }
    );

    if (rlsError) {
      console.error(`Unable to get RLS policies: ${JSON.stringify(rlsError)}`);

      // Try to create the function if it doesn't exist
      if (
        rlsError.message &&
        rlsError.message.includes('function "get_rls_policies" does not exist')
      ) {
        console.log("Creating RLS policy function...");

        try {
          // Create a function to get RLS policies
          const { error: createFuncError } = await supabase.sql(`
            CREATE OR REPLACE FUNCTION get_rls_policies(table_name text)
            RETURNS TABLE (
              policy_name text,
              operation text,
              definition text,
              check_clause text,
              is_enabled boolean
            )
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                policies.policyname::text,
                policies.operation::text,
                policies.definition::text,
                policies.check::text,
                policies.permissive = 'PERMISSIVE' as is_enabled
              FROM 
                pg_policies policies
              WHERE 
                policies.tablename = table_name
                AND policies.schemaname = 'public';
            END;
            $$;
          `);

          if (createFuncError) {
            console.error(
              `Failed to create RLS function: ${JSON.stringify(
                createFuncError
              )}`
            );
          } else {
            // Try again
            const { data: retryRlsPolicies, error: retryRlsError } =
              await supabase.rpc("get_rls_policies", {
                table_name: tableName,
              });

            if (retryRlsError) {
              console.error(
                `Still unable to get RLS policies: ${JSON.stringify(
                  retryRlsError
                )}`
              );
            } else {
              console.log("RLS Policies:");
              console.table(retryRlsPolicies);
            }
          }
        } catch (funcError) {
          console.error(`Error creating RLS function: ${funcError}`);
        }
      }
    } else {
      console.log("RLS Policies:");
      console.table(rlsPolicies);
    }

    // Check if RLS is enabled
    const { data: rlsStatus, error: statusError } = await supabase.rpc(
      "check_rls_enabled",
      {
        table_name: tableName,
      }
    );

    if (statusError) {
      console.error(
        `Unable to check RLS status: ${JSON.stringify(statusError)}`
      );

      // Try to create the function if it doesn't exist
      if (
        statusError.message &&
        statusError.message.includes(
          'function "check_rls_enabled" does not exist'
        )
      ) {
        console.log("Creating RLS status function...");

        try {
          // Create a function to check RLS status
          const { error: createFuncError } = await supabase.sql(`
            CREATE OR REPLACE FUNCTION check_rls_enabled(table_name text)
            RETURNS boolean
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
              rls_enabled boolean;
            BEGIN
              SELECT relrowsecurity INTO rls_enabled
              FROM pg_class
              WHERE oid = (table_name::regclass);
              
              RETURN rls_enabled;
            END;
            $$;
          `);

          if (createFuncError) {
            console.error(
              `Failed to create RLS status function: ${JSON.stringify(
                createFuncError
              )}`
            );
          } else {
            // Try again
            const { data: retryRlsStatus, error: retryStatusError } =
              await supabase.rpc("check_rls_enabled", {
                table_name: tableName,
              });

            if (retryStatusError) {
              console.error(
                `Still unable to check RLS status: ${JSON.stringify(
                  retryStatusError
                )}`
              );
            } else {
              console.log(
                `RLS is ${
                  retryRlsStatus ? "ENABLED" : "DISABLED"
                } for this table`
              );
            }
          }
        } catch (funcError) {
          console.error(`Error creating RLS status function: ${funcError}`);
        }
      }
    } else {
      console.log(
        `RLS is ${rlsStatus ? "ENABLED" : "DISABLED"} for this table`
      );
    }
  } catch (err) {
    console.error(
      `Unexpected error checking RLS for table ${tableName}: ${err}`
    );
  }
}

async function testProgress(enrollmentId, videoId) {
  console.log(
    `\n=== Testing Progress Record (enrollment: ${enrollmentId}, video: ${videoId}) ===`
  );

  try {
    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from("progress")
      .select()
      .eq("enrollment_id", enrollmentId)
      .eq("video_id", videoId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking progress: ${JSON.stringify(checkError)}`);
    } else {
      if (existingProgress) {
        console.log(
          "Found existing progress record:",
          JSON.stringify(existingProgress, null, 2)
        );

        // Try updating
        const testUpdate = {
          watched_seconds: 50,
          completed: false,
          last_watched_at: new Date().toISOString(),
        };

        console.log(
          "Trying to update with:",
          JSON.stringify(testUpdate, null, 2)
        );

        const { data: updateResult, error: updateError } = await supabase
          .from("progress")
          .update(testUpdate)
          .eq("id", existingProgress.id)
          .select()
          .single();

        if (updateError) {
          console.error(`Update error: ${JSON.stringify(updateError)}`);
        } else {
          console.log(
            "Update successful:",
            JSON.stringify(updateResult, null, 2)
          );
        }
      } else {
        console.log(
          "No existing progress record found. Creating a test record."
        );

        // Create new record
        const testProgress = {
          enrollment_id: enrollmentId,
          video_id: videoId,
          watched_seconds: 10,
          completed: false,
          last_watched_at: new Date().toISOString(),
        };

        console.log("Trying to insert:", JSON.stringify(testProgress, null, 2));

        const { data: insertResult, error: insertError } = await supabase
          .from("progress")
          .insert(testProgress)
          .select()
          .single();

        if (insertError) {
          console.error(`Insert error: ${JSON.stringify(insertError)}`);
        } else {
          console.log(
            "Insert successful:",
            JSON.stringify(insertResult, null, 2)
          );
        }
      }
    }
  } catch (err) {
    console.error(`Unexpected error testing progress: ${err}`);
  }
}

async function main() {
  try {
    console.log("=== Progress Table Diagnostics ===");

    // Check related tables
    await checkTableInfo("progress");
    await checkTableInfo("enrollments");
    await checkTableInfo("videos");

    // Check RLS policies
    await checkRLS("progress");

    // Ask if user wants to test with specific IDs
    console.log(
      "\nTo test a specific enrollment and video, please edit this script with the IDs"
    );
    const enrollmentId = "3cfeddb3-3e4a-41e0-aca4-0bf54b1fa36c"; // Replace with your test enrollment ID
    const videoId = "3effd958-8293-490e-b610-86752a7b92a5"; // Replace with your test video ID

    if (enrollmentId && videoId) {
      await testProgress(enrollmentId, videoId);
    }

    console.log("\n=== Diagnostics Complete ===");
  } catch (error) {
    console.error("An error occurred during diagnostics:", error);
    process.exit(1);
  }
}

main();
