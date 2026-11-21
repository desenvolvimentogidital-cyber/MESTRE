import { supabaseUrl, supabasePublishableKey } from "@/lib/supabase/config";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = supabaseUrl;
  const key = supabasePublishableKey;
  if (!url || !key) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) nas variáveis de ambiente.");
  return createBrowserClient(url, key);
}
