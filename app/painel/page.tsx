import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/acesso?redirectTo=/painel");
  const { data: profile } = await db.from("profiles")
    .select("account_type").eq("id",user.id).maybeSingle();
  if (profile?.account_type === "provider") redirect("/prestador");
  redirect("/cliente");
}
