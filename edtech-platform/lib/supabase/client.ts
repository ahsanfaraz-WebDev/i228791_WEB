import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  try {
    // Check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      throw new Error("Supabase configuration missing");
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Error creating Supabase client:", error);
    // Return a mock client that won't throw errors but won't do anything
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: null,
              error: new Error(
                "Mock client used due to initialization failure"
              ),
            }),
            single: async () => ({
              data: null,
              error: new Error(
                "Mock client used due to initialization failure"
              ),
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: new Error(
                "Mock client used due to initialization failure"
              ),
            }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({
                data: null,
                error: new Error(
                  "Mock client used due to initialization failure"
                ),
              }),
            }),
          }),
        }),
      }),
    };
  }
}
