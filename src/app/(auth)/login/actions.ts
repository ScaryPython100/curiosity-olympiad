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
      .upsert([{ id: data.user.id, user_id: data.user.id, xp: 0, curiosity_points: 0 }], { onConflict: "user_id" });

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

export async function sendOtpAction(formData: FormData) {
  const destination = formData.get("destination") as string;
  const method = formData.get("method") as string; // 'email' | 'phone'
  const isCreateAccount = formData.get("isCreateAccount") === "true";
  const username = ((formData.get("username") as string) || "").trim();

  if (isCreateAccount) {
    const supabase = await createClient();

    // 1. We skip Supabase Auth email existence check because it creates ghost accounts
    // Descope will handle OTP, and verifyOtpAction will handle existing users safely.

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

  // 3. THIRD: Send OTP via Descope Authentication (with Supabase fallback)
  const supabase = await createClient();
  const descopeProjectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID?.replace(/^["']|["']$/g, "");

  if (descopeProjectId) {
    const isEmail = destination.includes("@");
    const endpoint = isEmail ? "signup-in/email" : "signup-in/sms";
    let loginId = destination.trim();
    if (!isEmail) {
      loginId = loginId.replace(/[^0-9+]/g, "");
      if (!loginId.startsWith("+")) {
        loginId = loginId.length === 10 ? `+91${loginId}` : `+${loginId}`;
      }
    }

    try {
      const res = await fetch(`https://api.descope.com/v1/auth/otp/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${descopeProjectId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data?.errorDescription || data?.message || data?.errorMessage || `Descope Error (${res.status})`;
        return { error: `Failed to send OTP via Descope: ${errMsg}` };
      }
      return { success: true, message: `6-Digit OTP sent to ${loginId} via Descope!` };
    } catch (err: any) {
      return { error: `Network error sending OTP: ${err.message || "Please check your connection."}` };
    }
  }

  if (destination.includes("@")) {
    const { error } = await supabase.auth.signInWithOtp({
      email: destination.trim(),
      options: {
        shouldCreateUser: isCreateAccount,
        data: isCreateAccount ? { username: username || "Explorer", real_name: username || "Explorer" } : undefined,
      },
    });

    if (error && !error.message.toLowerCase().includes("rate limit")) {
      return { error: `Failed to send OTP to email: ${error.message}` };
    }
  } else {
    let phoneNum = destination.replace(/[^0-9+]/g, "");
    if (!phoneNum.startsWith("+")) {
      phoneNum = phoneNum.length === 10 ? `+91${phoneNum}` : `+${phoneNum}`;
    }
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNum,
      options: {
        shouldCreateUser: isCreateAccount,
        data: isCreateAccount ? { username: username || "Explorer", real_name: username || "Explorer" } : undefined,
      },
    });

    if (error && !error.message.toLowerCase().includes("rate limit")) {
      return { error: `Failed to send OTP to mobile: ${error.message}` };
    }
  }

  return { success: true, message: `OTP sent to ${destination} via ${method}` };
}

export async function verifyOtpAction(formData: FormData) {
  const destination = formData.get("destination") as string;
  const code = formData.get("code") as string;
  const username = (formData.get("username") as string) || destination.split("@")[0] || "Explorer";
  const realName = (formData.get("realName") as string) || username;
  const password = (formData.get("password") as string) || "DevSandboxOverridePassword!123";
  const isCreateAccount = formData.get("isCreateAccount") === "true";

  const supabase = await createClient();
  const descopeProjectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID?.replace(/^["']|["']$/g, "");

  let userId: string | null = null;
  let descopeVerified = false;

  if (descopeProjectId) {
    const isEmail = destination.includes("@");
    const endpoint = isEmail ? "verify/email" : "verify/sms";
    let loginId = destination.trim();
    if (!isEmail) {
      loginId = loginId.replace(/[^0-9+]/g, "");
      if (!loginId.startsWith("+")) {
        loginId = loginId.length === 10 ? `+91${loginId}` : `+${loginId}`;
      }
    }

    try {
      const res = await fetch(`https://api.descope.com/v1/auth/otp/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${descopeProjectId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId, code: code.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data?.errorDescription || data?.message || data?.errorMessage || "Invalid verification code";
        return { error: `Verification failed: ${errMsg}. Please check the 6-digit OTP code.` };
      }
      
      descopeVerified = true;
    } catch (err: any) {
      return { error: `Verification request failed: ${err.message || "Network error"}` };
    }
  } else {
    let error;
    let data;

    if (destination.includes("@")) {
      const res = await supabase.auth.verifyOtp({
        email: destination.trim(),
        token: code.trim(),
        type: "email",
      });
      error = res.error;
      data = res.data;
    } else {
      let phoneNum = destination.replace(/[^0-9+]/g, "");
      if (!phoneNum.startsWith("+")) {
        phoneNum = phoneNum.length === 10 ? `+91${phoneNum}` : `+${phoneNum}`;
      }
      const res = await supabase.auth.verifyOtp({
        phone: phoneNum,
        token: code.trim(),
        type: "sms",
      });
      error = res.error;
      data = res.data;
    }

    if (error) {
      return { error: `Verification failed: ${error.message}. Please check the OTP code and try again.` };
    }

    userId = data?.user?.id || null;
  }

  // HYBRID LOGIC: If Descope verified them, we MUST silently create/login them in Supabase Auth!
  if (descopeVerified) {
    const emailToCheck = destination.includes("@")
      ? destination.trim()
      : `${destination.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;

    // Try to login if they already exist
    let authRes = await supabase.auth.signInWithPassword({
      email: emailToCheck,
      password: password,
    });

    // If login fails (because user doesn't exist), sign them up
    if (authRes.error && isCreateAccount) {
      authRes = await supabase.auth.signUp({
        email: emailToCheck,
        password: password,
        options: {
          data: { username: username || "explorer", real_name: realName },
        },
      });
    } else if (authRes.error && !isCreateAccount) {
        return { error: `Could not sync session with database: ${authRes.error.message}` };
    }

    if (authRes.error) {
      return { error: `Descope verified, but Supabase sync failed: ${authRes.error.message}` };
    }

    userId = authRes.data?.user?.id || null;
  }

  // User profile & gamification records are now perfectly handled automatically 
  // by the Postgres trigger `handle_new_user` directly on the database side!
  if (userId) {
    if (isCreateAccount && password && !descopeProjectId) {
      const { error: pwdError } = await supabase.auth.updateUser({ password });
      if (pwdError) {
        console.error("Failed to save password during OTP signup:", pwdError);
      }
    }
  }

  return { success: true };
}