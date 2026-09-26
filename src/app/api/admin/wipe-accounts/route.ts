import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const createClient = async () => {
  const cookieStore = await cookies();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
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
  // 0. Strict Authorization Guard
  const authHeader = req.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const providedKey = req.nextUrl.searchParams.get("key") || authHeader?.replace(/^Bearer\s+/i, "");

  if (!adminSecret || providedKey !== adminSecret) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid administrator authorization key." },
      { status: 401 }
    );
  }

  const adminUsername = req.nextUrl.searchParams.get("keep") || "ScaryPython692";
  const logs: string[] = [];
  const descopeProjectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID;
  const descopeMgmtKey = process.env.DESCOPE_MANAGEMENT_KEY;

  // 1. Supabase Deletion via RPC or Batched Deletes
  const supabase = await createClient();

  // Attempt RPC function first (if installed with SECURITY DEFINER)
  const { data: rpcData, error: rpcError } = await supabase.rpc("wipe_test_accounts", {
    admin_username: adminUsername,
  });

  if (!rpcError && rpcData) {
    logs.push(`Supabase RPC success: ${JSON.stringify(rpcData)}`);
  } else {
    if (rpcError) {
      logs.push(`Supabase RPC note (${rpcError.message}), falling back to direct batch delete...`);
    }
    // Fallback: Batched deletes to eliminate N+1 queries and synchronous loops
    try {
      const { data: profiles, error: selectError } = await supabase
        .from("student_profiles")
        .select("id, username");

      if (selectError) {
        logs.push(`Supabase select error: ${selectError.message}`);
      } else if (profiles) {
        const toDelete = profiles.filter(
          (p) => p.username?.toLowerCase() !== adminUsername.toLowerCase()
        );
        const toDeleteIds = toDelete.map((p) => p.id);

        if (toDeleteIds.length > 0) {
          // Batch deletes using .in() to avoid N+1 queries
          await Promise.all([
            supabase.from("exam_submissions").delete().in("user_id", toDeleteIds),
            supabase.from("user_gamification").delete().in("user_id", toDeleteIds),
          ]);

          const { error: delErr } = await supabase
            .from("student_profiles")
            .delete()
            .in("id", toDeleteIds);

          if (delErr) {
            logs.push(`Error batch-deleting profiles: ${delErr.message}`);
          } else {
            logs.push(`Batch deleted ${toDeleteIds.length} Supabase test account(s).`);
          }
        } else {
          logs.push("No test accounts found to delete in Supabase.");
        }
      }
    } catch (e: any) {
      logs.push(`Supabase direct deletion error: ${e.message}`);
    }
  }

  // 2. Descope Directory Cleanup via Management API (Batched with Promise.allSettled)
  if (descopeProjectId && descopeMgmtKey) {
    try {
      const searchRes = await fetch("https://api.descope.com/v1/mgmt/user/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${descopeProjectId}:${descopeMgmtKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit: 100 }),
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const users = searchData.users || [];

        const targets = users.filter((u: any) => {
          const loginIds: string[] = u.loginIds || [];
          return !loginIds.some(
            (id) =>
              id.toLowerCase().includes(adminUsername.toLowerCase()) ||
              (u.name && u.name.toLowerCase().includes(adminUsername.toLowerCase()))
          );
        });

        // Parallel batch deletion to eliminate synchronous I/O loop
        const deleteResults = await Promise.allSettled(
          targets.map(async (u: any) => {
            const loginIds: string[] = u.loginIds || [];
            const target = loginIds[0] || u.userId;
            const deleteRes = await fetch("https://api.descope.com/v1/mgmt/user/delete", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${descopeProjectId}:${descopeMgmtKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ loginId: target }),
            });
            return { target, ok: deleteRes.ok };
          })
        );

        const succeeded = deleteResults.filter(
          (r) => r.status === "fulfilled" && r.value.ok
        ).length;
        logs.push(`Descope cleanup complete. Batch deleted ${succeeded} test user(s).`);
      } else {
        const errText = await searchRes.text();
        logs.push(`Descope search returned (${searchRes.status}): ${errText}`);
      }
    } catch (e: any) {
      logs.push(`Descope API exception: ${e.message}`);
    }
  } else {
    logs.push("Descope credentials not found in environment variables.");
  }

  return NextResponse.json({
    success: true,
    keep_user: adminUsername,
    logs,
  });
}
