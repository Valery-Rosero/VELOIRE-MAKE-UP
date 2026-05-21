import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ─── Protect /admin ───────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1)
    const role = (profileRows as Array<{ role: string }> | null)?.[0]?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ─── Protect /cuenta ──────────────────────────────────────────────────────
  if (pathname.startsWith('/cuenta')) {
    if (!user) {
      const redirectTo = encodeURIComponent(pathname + request.nextUrl.search)
      return NextResponse.redirect(new URL(`/login?redirectTo=${redirectTo}`, request.url))
    }
  }

  // ─── Redirect authenticated users away from auth pages ───────────────────
  if (user && (pathname === '/login' || pathname === '/registro')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
