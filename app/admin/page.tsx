import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {AdminWorkspace} from "@/components/admin-workspace";
import {createClient} from "@/lib/supabase/server";

export default async function AdminPage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/admin");
  const {data:admin}=await db.from("admin_members").select("user_id").eq("user_id",user.id).maybeSingle();
  if(!admin)return <AppFrame active="perfil" title="Administração">
    <div className="cs-empty"><Icon name="shield" size={32}/>
      <h2>Acesso administrativo restrito</h2>
      <p>Esta área está disponível apenas para contas que receberam autorização de administrador pelo responsável do ConectaServ.</p>
      <Link href="/perfil" className="cs-button cs-button-outline">Voltar ao perfil</Link>
    </div></AppFrame>;
  return <AppFrame active="perfil" title="Administração">
    <span className="cs-eyebrow">ConectaServ</span>
    <h1 className="cs-top-title" style={{marginTop:7}}>Painel de moderação</h1>
    <p className="cs-hint">Analise denúncias, modere serviços e confira informações profissionais com responsabilidade.</p>
    <AdminWorkspace/>
  </AppFrame>;
}
