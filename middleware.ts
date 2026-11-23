import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Cadastro e login nunca devem aguardar uma sessão existente para abrir.
  if(request.nextUrl.pathname==="/api/auth/registrar" || request.nextUrl.pathname==="/acesso")return response;
  // /admin is deliberately public only for its *login gate*. The server page
  // verifies a real Supabase user AND an admin_members row before data is fetched.
  // Never redirect this private login to the marketplace's /acesso page.
  // Only the isolated, mock-only admin demo is publicly reachable.
  // It does not query Supabase or grant admin membership.
  // Owner activation is publicly reachable, but only the signed-in,
  // one-time invite RPC can grant the first real admin membership.
  if(request.nextUrl.pathname==="/admin/ativar" || request.nextUrl.pathname==="/admin/ativar/"){
    response.headers.set("Cache-Control","private, no-store");
    response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
    return response;
  }
  if(request.nextUrl.pathname==="/admin/teste" || request.nextUrl.pathname==="/admin/teste/"){
    response.headers.set("Cache-Control","private, no-store");
    response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
    return response;
  }
  if(request.nextUrl.pathname==="/admin" || request.nextUrl.pathname==="/admin/"){
    response.headers.set("Cache-Control","private, no-store");
    response.headers.set("X-Robots-Tag","noindex, nofollow, noarchive");
    return response;
  }

  const protectedPath = /^\/(painel|cliente|prestador|admin|conversas|propostas|perfil|notificacoes|avaliar|denuncias)(\/|$)/.test(request.nextUrl.pathname);
  const url = supabaseUrl;
  const key = supabasePublishableKey;

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

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    user = data.user;
  } catch {
    if (protectedPath) {
      return NextResponse.redirect(new URL("/acesso?erro=configuracao", request.url));
    }
    return response;
  }

  if (protectedPath && !user) {
    const destination = new URL("/acesso", request.url);
    destination.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(destination);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
