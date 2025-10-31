import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

/**
 * Initialize or return an existing Supabase client.
 * Requires SUPABASE_URL and SUPABASE_KEY environment variables to be set.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_KEY environment variables for Supabase client"
    );
  }

  // createClient options: do not persist sessions in server-side contexts
  supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabase;
}

/**
 * Simple helper to fetch rows from a `demo` table (if present).
 * This is intentionally generic/limited — adapt table names and shapes as needed.
 */
export async function fetchDemoRows(): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("demo").select("*").limit(50);
  if (error) throw error;
  return data ?? [];
}

/**
 * Insert a row into `demo` table. Returns the inserted rows array.
 */
export async function insertDemoRow(payload: Record<string, unknown>): Promise<any[]> {
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("demo").insert([payload]);
  if (error) throw error;
  return data ?? [];
}
