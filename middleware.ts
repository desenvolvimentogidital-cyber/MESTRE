import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const protectedPath = /^\/(painel|cliente|prestador|admin|conversas)(\/|$)/.test(request.nextUrl.pathname);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return protectedPath
      ? NextResponse.redirect(new URL("/acesso?erro=configuracao", request.url))
      : response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        response.headers.set("Cache-Control", "private, no-store");
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (protectedPath && !user) {
    const destination = new URL("/acesso", request.url);
    destination.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(destination);
  }
  if (request.nextUrl.pathname === "/acesso" && user) {
    return NextResponse.redirect(new URL("/painel", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
