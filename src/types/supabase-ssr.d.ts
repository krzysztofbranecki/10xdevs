declare module "@supabase/ssr" {
  import type { SupabaseClient } from "@supabase/supabase-js";

  export function createServerClient<Database>(url: string, key: string, opts: any): SupabaseClient<Database>;

  export type CookieOptionsWithName = any;
}
