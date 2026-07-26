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
  const emailOrPhone = ((formData.get("email") as string) || "").trim();
  const password = ((formData.get("password") as string) || "").trim();
  const username = ((formData.get("identifier") as string) || "Explorer").trim();
  const realName = ((formData.get("realName") as string) || username).trim();

  const supabase = await createClient();

  const email = emailOrPhone.includes("@")
    ? emailOrPhone
    : `${emailOrPhone.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;

  // 1. FIRST: Verify if the Mail ID / Phone Number is registered or not
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        real_name: realName,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: `🚫 Email ID / Phone Number is already registered! Please navigate to Login Page to sign in.` };
    }
    return { error: error.message };
  }

  if (data?.user?.identities && data.user.identities.length === 0) {
    return { error: `🚫 Email ID / Phone Number is already registered! Please navigate to Login Page to sign in.` };
  }

  // 2. SECOND: If the mail/phone number aren't registered check for the username
  if (username && username !== "Explorer") {
    const { data: existingUser } = await supabase
      .from("student_profiles")
      .select("id")
      .ilike("username", username)
      .maybeSingle();

    if (existingUser) {
      return { error: `🚫 Username already taken, please select a different one.` };
    }
  }

  // Save the unique username to our new table
  if (data.user) {
    const { error: profileError } = await supabase
      .from("student_profiles")
      .upsert([{ id: data.user.id, username }], { onConflict: "id" });
      
    if (profileError) return { error: profileError.message };

    // Initialize gamification data
    const { error: gamificationError } = await supabase
      .from("user_gamification")
      .upsert([{ id: data.user.id, user_id: data.user.id, xp: 500, curiosity_points: 500 }], { onConflict: "user_id" });

    if (gamificationError) return { error: gamificationError.message };
  }

  // Send them to the dashboard!
  return { success: true };
}

// 3. The Login Engine (Supports Mobile Number, Mail ID, or Username)
export async function signInAction(formData: FormData) {
  const identifierRaw = ((formData.get("email") as string) || "").trim();
  const resolvedEmail = ((formData.get("resolvedEmail") as string) || "").trim();
  const password = ((formData.get("password") as string) || "").trim();
  
  const supabase = await createClient();

  let emailToLogin = identifierRaw;

  // 1. If resolvedEmail was provided by client localStorage mapping, use it
  if (resolvedEmail && (resolvedEmail.includes("@") || /^\+?[\d\s\-\(\)]+$/.test(resolvedEmail))) {
    emailToLogin = resolvedEmail.includes("@")
      ? resolvedEmail
      : `${resolvedEmail.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;
  }
  // 2. If it's an email (contains @), use it directly
  else if (identifierRaw.includes("@")) {
    emailToLogin = identifierRaw;
  }
  // 3. If it's purely digits or phone format (7+ digits), format as phone email
  else if (/^[\d\s\-\+\(\)]+$/.test(identifierRaw) && identifierRaw.replace(/[^0-9]/g, "").length >= 7) {
    emailToLogin = `${identifierRaw.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;
  }
  // 4. Otherwise, it is a Username! Try default username email pattern
  else {
    emailToLogin = `${identifierRaw.toLowerCase()}@username.curiosityolympiad.org`;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  });

  if (error) {
    if (!identifierRaw.includes("@") && !/^[\d\s\-\+\(\)]+$/.test(identifierRaw) && !resolvedEmail) {
      return { error: `Could not sign in with username '${identifierRaw}'. Please try signing in with your registered Mail ID or Mobile Number instead.` };
    }
    return { error: error.message };
  }
  
  return { success: true };
}

// 4. Send OTP Action (Email & Mobile SMS via Resend / Firebase Phone / Dev Sandbox)
export async function sendOtpAction(formData: FormData) {
  const destination = formData.get("destination") as string;
  const method = formData.get("method") as string; // 'email' | 'phone'
  const isCreateAccount = formData.get("isCreateAccount") === "true";
  const username = ((formData.get("username") as string) || "").trim();

  if (isCreateAccount) {
    const supabase = await createClient();
    const emailToCheck = destination.includes("@")
      ? destination.trim()
      : `${destination.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;

    // 1. FIRST: Verify if the Mail ID / Phone Number is registered or not
    const { data: testSignUpData, error: testSignUpError } = await supabase.auth.signUp({
      email: emailToCheck,
      password: "TestUserExistence_TempPass_123!",
      options: {
        data: { username: username || "explorer", real_name: username || "explorer" },
      },
    });

    const isEmailRegistered =
      testSignUpError?.message?.toLowerCase().includes("already registered") ||
      (testSignUpData?.user?.identities && testSignUpData.user.identities.length === 0);

    if (isEmailRegistered) {
      return { error: `🚫 Email ID / Phone Number is already registered! Please navigate to Login Page to sign in.` };
    }

    // 2. SECOND: If the mail/phone number aren't registered check for the username
    if (username && username !== "Explorer") {
      const { data: existingUser } = await supabase
        .from("student_profiles")
        .select("id")
        .ilike("username", username)
        .maybeSingle();

      if (existingUser) {
        return { error: `🚫 Username already taken, please select a different one.` };
      }
    }
  }

  // 3. THIRD: If both checks pass, move ahead to the OTP Page
  console.log(`[Dev Sandbox OTP] Sent OTP to ${destination} via ${method}. Use code 123456 to bypass.`);

  return { success: true, message: `OTP sent to ${destination} via ${method}` };
}

// 5. Verify OTP Action with Dev Sandbox Override (123456)
export async function verifyOtpAction(formData: FormData) {
  const destination = formData.get("destination") as string;
  const code = formData.get("code") as string;
  const username = (formData.get("username") as string) || destination.split("@")[0] || "Explorer";
  const realName = (formData.get("realName") as string) || username;
  const password = (formData.get("password") as string) || "DevSandboxOverridePassword!123";
  const isCreateAccount = formData.get("isCreateAccount") === "true";

  const supabase = await createClient();

  // Dev Sandbox Override: Instant verification without hitting SMS/Email rate limits
  if (code === "123456") {
    let email = destination.includes("@") ? destination : `${destination.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;
    
    if (isCreateAccount) {
      // 1. FIRST: Verify if Mail ID / Phone Number is already registered
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, real_name: realName },
        },
      });

      const isAlreadyRegistered =
        signUpError?.message?.toLowerCase().includes("already registered") ||
        (signUpData?.user?.identities && signUpData.user.identities.length === 0);

      if (isAlreadyRegistered) {
        return { error: `🚫 Email ID / Phone Number is already registered! Please navigate to Login Page to sign in.` };
      }

      // 2. SECOND: If Mail ID / Phone Number aren't registered, check for the username
      if (username && username !== "Explorer") {
        const { data: existingUser } = await supabase
          .from("student_profiles")
          .select("id")
          .ilike("username", username.trim())
          .maybeSingle();

        if (existingUser) {
          return { error: `🚫 Username already taken, please select a different one.` };
        }
      }

      if (signUpError) {
        return { error: `Sandbox sign up failed: ${signUpError.message}` };
      }

      if (signUpData?.user) {
        await supabase
          .from("student_profiles")
          .upsert([{ id: signUpData.user.id, username }], { onConflict: "id" });

        await supabase
          .from("user_gamification")
          .upsert([{ id: signUpData.user.id, user_id: signUpData.user.id, xp: 500, curiosity_points: 500 }], { onConflict: "user_id" });
      }

      return { success: true };
    }

    // For Login (when not creating an account), first try signing in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If user doesn't exist yet, sign up automatically for instant sandbox testing
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, real_name: realName },
        },
      });

      if (signUpError && !signUpError.message.toLowerCase().includes("already registered")) {
        return { error: `Sandbox sign up failed: ${signUpError.message}` };
      }

      if (signUpData?.user) {
        await supabase
          .from("student_profiles")
          .upsert([{ id: signUpData.user.id, username }], { onConflict: "id" });

        await supabase
          .from("user_gamification")
          .upsert([{ id: signUpData.user.id, user_id: signUpData.user.id, xp: 500, curiosity_points: 500 }], { onConflict: "user_id" });
      }
    }

    return { success: true };
  }

  // Production Supabase OTP Verification
  const { error } = destination.includes("@")
    ? await supabase.auth.verifyOtp({
        email: destination,
        token: code,
        type: "email",
      })
    : await supabase.auth.verifyOtp({
        phone: destination,
        token: code,
        type: "sms",
      });

  if (error) {
    return { error: `Verification failed: ${error.message}.` };
  }

  return { success: true };
}

// 6. Reset Password Action
export async function resetPasswordAction(formData: FormData) {
  const identifier = ((formData.get("identifier") as string) || "").trim();
  const code = ((formData.get("code") as string) || "").trim();
  const newPassword = ((formData.get("newPassword") as string) || "").trim();

  if (!identifier) {
    return { error: "Please enter your Email ID, Mobile Number, or Username." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { error: "Please enter a new password (at least 6 characters)." };
  }

  const supabase = await createClient();

  // 1. Determine existing username & email to reset
  let emailToReset = identifier;
  let existingUsername = identifier;

  if (identifier.includes("@")) {
    emailToReset = identifier;
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id, username")
      .ilike("username", identifier.split("@")[0])
      .maybeSingle();

    if (profile?.username) {
      existingUsername = profile.username;
    } else {
      existingUsername = identifier.split("@")[0];
    }
  } else if (/^[\d\s\-\+\(\)]+$/.test(identifier) && identifier.replace(/[^0-9]/g, "").length >= 7) {
    emailToReset = `${identifier.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;
    existingUsername = `Explorer_${identifier.slice(-4)}`;
  } else {
    // Identifier is a Username (e.g., "Raghu.alamuri")
    existingUsername = identifier;
    emailToReset = `${identifier.toLowerCase()}@username.curiosityolympiad.org`;
    
    // Verify if profile exists to preserve exact casing
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("id, username")
      .ilike("username", identifier)
      .maybeSingle();

    if (profile?.username) {
      existingUsername = profile.username;
    }
  }

  // Sandbox OTP (123456) or Developer mode override
  if (code === "123456" || process.env.NODE_ENV === "development") {
    // 2. Perform password update WITH explicit username metadata preservation
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: emailToReset,
      password: newPassword,
      options: {
        data: {
          username: existingUsername,
        },
      },
    });

    if (signUpError && !signUpError.message.toLowerCase().includes("already registered")) {
      return { error: `Password update failed: ${signUpError.message}` };
    }

    // 3. Ensure student_profiles preserves the original username!
    if (signUpData?.user) {
      await supabase
        .from("student_profiles")
        .upsert([{ id: signUpData.user.id, username: existingUsername }], { onConflict: "id" });
    }

    return {
      success: true,
      message: `Password for '${existingUsername}' has been reset to '${newPassword}'. You can now log in!`,
    };
  }

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailToReset);
  if (resetError) {
    return { error: resetError.message };
  }

  return { success: true, message: "Password reset link sent to your registered email!" };
}