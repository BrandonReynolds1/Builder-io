import { createClient } from "@supabase/supabase-js";

// Vite exposes env vars prefixed with VITE_ via import.meta.env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // We don't throw in the browser build to avoid breaking dev server when not configured;
  // client code should check for `supabase` being defined before using.
  // eslint-disable-next-line no-console
  console.warn("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set - Supabase client will be unavailable in the browser");
}

export const supabase = (
  SUPABASE_URL && SUPABASE_ANON_KEY
) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export async function fetchDemoRowsClient() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("demo").select("*").limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function insertDemoRowClient(payload: Record<string, unknown>) {
  if (!supabase) return [];
  const { data, error } = await supabase.from("demo").insert([payload]);
  if (error) throw error;
  return data ?? [];
}
