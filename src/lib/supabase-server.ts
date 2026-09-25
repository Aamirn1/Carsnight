import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client && supabaseUrl && supabaseKey) {
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client!;
}

// Check if Supabase is configured (i.e. we should use it instead of Prisma)
export function hasSupabase(): boolean {
  return !!(supabaseUrl && supabaseKey);
}
