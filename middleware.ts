import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Cadastro e login nunca devem aguardar uma sessão existente para abrir.
  if(request.nextUrl.pathname==="/api/auth/registrar" || request.nextUrl.pathname==="/acesso")return response;
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
    destination.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(destination);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
