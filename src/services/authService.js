import { supabase } from "@/lib/supabase.js";

export async function signUp(email, password, fullName) {
  if (!supabase) {
    return {
      user: {
        id: "demo-user",
        email,
        user_metadata: { fullname: fullName },
        demo: true,
      },
    };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  if (!supabase) {
    return { user: { id: "demo-user", email, user_metadata: {}, demo: true } };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}