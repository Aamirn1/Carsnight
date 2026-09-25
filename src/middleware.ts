import { type NextRequest } from "next/server";
import { createClient as createSupabaseClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const supabaseResponse = createSupabaseClient(request);
  return supabaseResponse;
}
