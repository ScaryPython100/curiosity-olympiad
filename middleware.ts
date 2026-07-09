import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Safely initialize the client using your .env.local variables
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(({ name, value }) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedRoutes = ['/dashboard', '/profile', '/tournaments', '/leaderboard']
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Send unauthenticated users back to login page
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/tournaments/:path*', '/leaderboard/:path*'],
}