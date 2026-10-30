import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Enforce Strict Security & 20 min inactivity timeout
            const secureOptions = {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax', // Lax is required for OAuth redirects, but better than default
              maxAge: 20 * 60 // 20 minutes in seconds
            };
            request.cookies.set(name, value, secureOptions);
          });
          
          supabaseResponse = NextResponse.next({ request });
          
          // Apply enterprise security headers
          supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
          supabaseResponse.headers.set('X-Frame-Options', 'DENY');
          supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
          supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
          supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
          // Note: Strict CSP omitted to prevent breaking inline styles/scripts in Next.js dev mode, 
          // but base headers provide significant protection.

          cookiesToSet.forEach(({ name, value, options }) => {
            const secureOptions = {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              sameSite: 'lax',
              maxAge: 20 * 60 // 20 minutes in seconds
            };
            supabaseResponse.cookies.set(name, value, secureOptions);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. API Route Protection (Never redirect API requests to an HTML login page to avoid 405 Method Not Allowed)
  if (pathname.startsWith('/api/')) {
    // Public & Hybrid APIs: Sara Copilot (supports guest preview), Auth callbacks, Spotify
    const isPublicApi = 
      pathname.startsWith('/api/sara') ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/spotify');

    // Return JSON 401 for strictly authenticated APIs instead of redirecting
    if (!user && !isPublicApi && (pathname.startsWith('/api/admin') || pathname.startsWith('/api/workspaces'))) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    return supabaseResponse;
  }

  // 2. Protected Page Routes - redirect unauthenticated users to login
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 3. Redirect logged-in users away from auth pages
  if (
    user &&
    (pathname.startsWith('/login') || pathname.startsWith('/signup'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Unconditionally attach enterprise security headers to every response
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block');
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return supabaseResponse;
}
