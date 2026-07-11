"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. Secure Cookie Client Setup
const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {}
        },
      },
    }
  );
};

// 2. The Registration Engine
export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("identifier") as string;

  const supabase = await createClient();

  // Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) return { error: error.message };

  // Save the unique username to our new table
  if (data.user) {
    const { error: profileError } = await supabase
      .from("student_profiles")
      .insert([{ id: data.user.id, username }]);
      
    if (profileError) return { error: profileError.message };

    // Initialize gamification data
    const { error: gamificationError } = await supabase
      .from("user_gamification")
      .insert([{ id: data.user.id, user_id: data.user.id, xp: 0, curiosity_points: 0 }]);

    if (gamificationError) return { error: gamificationError.message };
  }

  // Send them to the dashboard!
  redirect("/dashboard");
}

// 3. The Login Engine
export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  
  redirect("/dashboard");
}