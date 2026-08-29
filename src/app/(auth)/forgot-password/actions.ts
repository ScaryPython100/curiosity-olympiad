"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {}
        },
      },
    }
  );
}

async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}

export async function sendRecoveryOtpAction(formData: FormData) {
  const identifier = formData.get("identifier") as string;
  const isEmail = identifier.includes("@");
  let loginId = identifier.trim();

  if (!isEmail) {
    loginId = loginId.replace(/[^0-9+]/g, "");
    if (!loginId.startsWith("+")) {
      loginId = loginId.length === 10 ? `+91${loginId}` : `+${loginId}`;
    }
  }

  // Use Descope Management or standard OTP to send code
  const descopeProjectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID?.replace(/^["']|["']$/g, "");
  if (!descopeProjectId) return { error: "Descope Project ID missing" };

  const endpoint = isEmail ? "signup-in/email" : "signup-in/sms";
  try {
    const res = await fetch(`https://api.descope.com/v1/auth/otp/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${descopeProjectId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loginId }),
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errMsg = data?.errorDescription || data?.message || "Failed to send OTP via Descope.";
      return { error: errMsg };
    }
    return { success: true, message: `OTP sent to ${loginId}` };
  } catch (err: any) {
    return { error: `Network error: ${err.message}` };
  }
}

export async function verifyRecoveryOtpAction(formData: FormData) {
  const identifier = formData.get("identifier") as string;
  const code = formData.get("code") as string;
  const isEmail = identifier.includes("@");
  
  let loginId = identifier.trim();
  if (!isEmail) {
    loginId = loginId.replace(/[^0-9+]/g, "");
    if (!loginId.startsWith("+")) {
      loginId = loginId.length === 10 ? `+91${loginId}` : `+${loginId}`;
    }
  }

  const descopeProjectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID?.replace(/^["']|["']$/g, "");
  if (!descopeProjectId) return { error: "Descope missing" };

  const endpoint = isEmail ? "verify/email" : "verify/sms";
  try {
    const res = await fetch(`https://api.descope.com/v1/auth/otp/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${descopeProjectId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ loginId, code }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data?.errorDescription || "Invalid OTP" };
    }

    // Since we can't maintain a verified state securely without a session,
    // we set a temporary secure HttpOnly cookie proving verification.
    const cookieStore = await cookies();
    cookieStore.set("recovery_verified_id", loginId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300, // 5 mins expiry
      path: "/",
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const newPassword = formData.get("newPassword") as string;
  
  const cookieStore = await cookies();
  const loginId = cookieStore.get("recovery_verified_id")?.value;

  if (!loginId) {
    return { error: "Verification expired or invalid. Please request a new OTP." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Server Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing." };
  }

  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  const isEmail = loginId.includes("@");
  let emailToCheck = isEmail ? loginId : `${loginId.replace(/[^0-9]/g, "")}@phone.curiosityolympiad.org`;

  // 1. Check if the new password is the same as the old one
  const { error: testLoginError } = await supabase.auth.signInWithPassword({
    email: emailToCheck,
    password: newPassword,
  });

  if (!testLoginError) {
    // Login succeeded, meaning the new password matches the current one!
    // We should immediately log them out to clear the accidental session
    await supabase.auth.signOut();
    return { error: "Your new password CANNOT be the same as your old password." };
  }

  // 2. Fetch the user's UUID using the RPC
  let userId: string | null = null;
  if (isEmail) {
    const { data } = await supabaseAdmin.rpc("get_user_id_by_email", { user_email: emailToCheck });
    userId = data;
  } else {
    // We generated the email format above, let's use the email RPC as well since they were created with it
    const { data } = await supabaseAdmin.rpc("get_user_id_by_email", { user_email: emailToCheck });
    userId = data;
  }

  if (!userId) {
    return { error: "User account not found in database." };
  }

  // 3. Update the user's password using the Admin API
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (updateError) {
    return { error: `Failed to update password: ${updateError.message}` };
  }

  // Clear the recovery token
  cookieStore.delete("recovery_verified_id");

  return { success: true, message: "Password updated successfully!" };
}
