import { createBrowserClient } from "@supabase/ssr"; console.log("DEBUG SUPABASE SSR:", { typeCreateBrowserClient: typeof createBrowserClient });

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Auth will not work correctly.')
    // Return a dummy client or handle as needed to avoid crashes
  }

  return createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}
