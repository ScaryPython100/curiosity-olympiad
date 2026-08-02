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
  const adminUsername = req.nextUrl.searchParams.get("keep") || "ScaryPython692";
  const logs: string[] = [];
  const descopeProjectId = process.env.NEXT_PUBLIC_DESCOPE_PROJECT_ID;
  const descopeMgmtKey = process.env.DESCOPE_MANAGEMENT_KEY;

  // 1. Supabase Deletion via RPC or Service Client
  const supabase = await createClient();

  // Attempt RPC function first (if installed by user with SECURITY DEFINER)
  const { data: rpcData, error: rpcError } = await supabase.rpc("wipe_test_accounts", {
    admin_username: adminUsername,
  });

  if (!rpcError && rpcData) {
    logs.push(`Supabase RPC success: ${JSON.stringify(rpcData)}`);
  } else {
    if (rpcError) {
      logs.push(`Supabase RPC note (${rpcError.message}), falling back to direct delete...`);
    }
    // Fallback: direct table deletions
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
        for (const p of toDelete) {
          await supabase.from("exam_submissions").delete().eq("user_id", p.id);
          await supabase.from("user_gamification").delete().eq("user_id", p.id);
          await supabase.from("user_gamification").delete().eq("id", p.id);
          const { error: delErr } = await supabase
            .from("student_profiles")
            .delete()
            .eq("id", p.id);
          if (delErr) {
            logs.push(`Error deleting ${p.username} (${p.id}): ${delErr.message}`);
          } else {
            logs.push(`Deleted Supabase account: ${p.username} (${p.id})`);
          }
        }
      }
    } catch (e: any) {
      logs.push(`Supabase direct deletion error: ${e.message}`);
    }
  }

  // 2. Descope Directory Cleanup via Management API
  if (descopeProjectId && descopeMgmtKey) {
    try {
      // Step 2a: Search for all users in Descope
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
        let descopeDeleted = 0;
        for (const u of users) {
          const loginIds: string[] = u.loginIds || [];
          const isAdmin = loginIds.some(
            (id) =>
              id.toLowerCase().includes(adminUsername.toLowerCase()) ||
              (u.name && u.name.toLowerCase().includes(adminUsername.toLowerCase()))
          );

          if (!isAdmin) {
            const deleteRes = await fetch("https://api.descope.com/v1/mgmt/user/delete", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${descopeProjectId}:${descopeMgmtKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ loginId: loginIds[0] || u.userId }),
            });
            if (deleteRes.ok) {
              descopeDeleted++;
              logs.push(`Deleted Descope user: ${loginIds.join(", ")} (${u.userId})`);
            } else {
              const errText = await deleteRes.text();
              logs.push(`Descope delete failed for ${loginIds[0]}: ${errText}`);
            }
          } else {
            logs.push(`Kept Descope admin user: ${loginIds.join(", ")}`);
          }
        }
        logs.push(`Descope cleanup complete. Deleted ${descopeDeleted} test user(s).`);
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
