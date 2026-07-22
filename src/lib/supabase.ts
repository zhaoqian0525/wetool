import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Returns the Supabase client, or null if not configured */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "your_supabase_project_url") return null;

  try {
    return createClient(url, key);
  } catch {
    return null;
  }
}

/** Whether Supabase is configured with real credentials */
export const isSupabaseConfigured = (): boolean => {
  return getSupabase() !== null;
};
