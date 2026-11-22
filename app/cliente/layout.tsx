import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

/** All /cliente routes belong exclusively to client accounts. */
export default async function ClientOnlyLayout({children}:{children:ReactNode}){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/cliente");
  const {data:profile}=await db.from("profiles").select("account_type").eq("id",user.id).maybeSingle();
  if(profile?.account_type!=="client"){
    redirect(profile?.account_type==="provider"?"/prestador":"/inicio");
  }
  return <>{children}</>;
}
