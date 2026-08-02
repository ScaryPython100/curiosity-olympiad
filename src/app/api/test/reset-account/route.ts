import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "nebula4nuggets@gmail.com";
  const projectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID;
  const mgmtKey = process.env.DESCOPE_MANAGEMENT_KEY;

  const logs: string[] = [];

  // 1. Delete from Descope Directory via Management API
  if (projectId && mgmtKey) {
    try {
      const res = await fetch("https://api.descope.com/v1/mgmt/user/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${projectId}:${mgmtKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginId: email }),
      });

      if (res.ok) {
        logs.push(`Successfully deleted '${email}' from Descope directory.`);
      } else {
        const text = await res.text();
        logs.push(`Descope delete note: ${text} (${res.status})`);
      }
    } catch (err: any) {
      logs.push(`Descope delete error: ${err.message}`);
    }
  } else {
    logs.push("Descope credentials not found in environment.");
  }

  // 2. Delete from Supabase Database tables (student_profiles & user_gamification)
  try {
    const supabase = await createClient();
    
    // Find any matching profiles by email, or username containing nebula or nuggets
    const { data: profiles } = await supabase
      .from("student_profiles")
      .select("id, username")
      .or(`id.eq.${email},username.ilike.%nebula%,username.ilike.%nuggets%,username.ilike.${email.split("@")[0]}`);

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        await supabase.from("user_gamification").delete().eq("user_id", p.id);
        await supabase.from("user_gamification").delete().eq("id", p.id);
        await supabase.from("student_profiles").delete().eq("id", p.id);
        logs.push(`Deleted Supabase profile: UUID [${p.id}] (username: ${p.username})`);
      }
    } else {
      // Also attempt direct delete just in case
      await supabase.from("student_profiles").delete().eq("id", email);
      await supabase.from("student_profiles").delete().ilike("username", `%nebula%`);
      logs.push(`No matching profiles returned in select query; executed cleanup by pattern for '${email}'.`);
    }
  } catch (err: any) {
    logs.push(`Supabase cleanup error: ${err.message}`);
  }

  return NextResponse.json({
    success: true,
    email,
    logs,
  });
}
