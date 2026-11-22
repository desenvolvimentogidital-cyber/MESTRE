import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

/** All /prestador routes belong exclusively to professional accounts. */
export default async function ProviderOnlyLayout({children}:{children:ReactNode}){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/prestador");
  const {data:profile}=await db.from("profiles").select("account_type").eq("id",user.id).maybeSingle();
  if(profile?.account_type!=="provider"){
    redirect(profile?.account_type==="client"?"/cliente":"/inicio");
  }
  return <>{children}</>;
}
