// src/lib/supabase-server.js
// ⚠️ SERVER-ONLY — never import this in frontend/Vite code
// Uses process.env (Next.js server) + service role key to bypass RLS

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ← service role, NOT anon key

if (!url || !serviceRoleKey) {
  console.error("❌ supabase-server: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Service role client — bypasses Row Level Security
// NEVER expose this client or its key to the browser
export const supabaseAdmin = url && serviceRoleKey
  ? createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
