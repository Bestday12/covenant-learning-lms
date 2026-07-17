import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Better error handling — throw error if missing
if (!url || !anonKey) {
  console.error("❌ Supabase: Missing environment variables! Check your .env file.");
  console.error("   VITE_SUPABASE_URL:", url);
  console.error("   VITE_SUPABASE_ANON_KEY:", anonKey ? "set" : "missing");
}

// Always export a client — even if missing env vars, throw a helpful error
export const supabase = url && anonKey 
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Helper to check if Supabase is ready
export function isSupabaseReady() {
  return supabase !== null;
}

// Log status
console.log("🔌 Supabase client:", supabase ? "✅ Connected" : "❌ Not connected");