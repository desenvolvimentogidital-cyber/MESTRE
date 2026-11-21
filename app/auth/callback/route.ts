import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const candidate = url.searchParams.get("next") || "/painel";
  const next = candidate.startsWith("/") && !candidate.startsWith("//") && !candidate.startsWith("/\\") ? candidate : "/painel";
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    } catch { /* Missing or invalid session configuration */ }
  }
  return NextResponse.redirect(new URL("/acesso?erro=callback", url.origin));
}
