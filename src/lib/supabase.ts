import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized Supabase client.
// Importing this module at build time previously failed when SUPABASE_URL/SUPABASE_SERVICE_KEY
// were absent (Next.js "Collecting page data" step instantiates every imported module),
// which caused the lab-operations-logs routes to be dropped from the production build.
// Creating the client on first call keeps build-time module imports safe.

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars missing at runtime: ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in this environment."
    );
  }
  client = createClient(url, key);
  return client;
}

// Backwards-compatible export: route handlers can keep `import { supabase } from "@/lib/supabase"`.
// Calls are proxied through getSupabase() so the client is constructed on first method access,
// not at module import time.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const real = getSupabase();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
