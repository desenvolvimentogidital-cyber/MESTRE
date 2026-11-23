import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/acesso?redirectTo=/painel");
  const { data: profile } = await db.from("profiles")
    .select("account_type").eq("id",user.id).maybeSingle();
  if (profile?.account_type === "admin") redirect("/admin");
  if (profile?.account_type === "provider") {
    const {data:areas}=await db.from("provider_categories").select("category_id").eq("provider_id",user.id).limit(1);
    redirect(areas?.length?"/prestador":"/prestador/perfil");
  }
  if (profile?.account_type === "client") redirect("/cliente");
  redirect("/inicio");
}
