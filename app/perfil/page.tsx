import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame, Icon } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/server";

const labels: Record<string,string> = { client:"Cliente",provider:"Profissional",both:"Cliente e profissional" };
export default async function ProfilePage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/acesso?redirectTo=/perfil");
  const { data: profile } = await db.from("profiles").select("full_name,account_type,phone").eq("id",user.id).maybeSingle();
  return <AppFrame active="perfil" title="Meu Perfil">
    <div className="cs-card cs-profile-card">
      <div className="cs-user-avatar" aria-hidden="true">👤</div>
      <h1>{profile?.full_name || "Minha conta"}</h1>
      <p>{labels[profile?.account_type || ""] || "Conta ConectaServ"}</p>
      <p style={{marginTop:6}}>{user.email}</p>
    </div>
    <div className="cs-section-head"><h2 className="cs-section-title">Minha conta</h2></div>
    <div className="cs-card">
      <div className="cs-menu-link"><Icon name="user"/> <span>Meus dados</span> <span className="cs-hint" style={{marginLeft:"auto"}}>{profile?.phone || "Cadastro"}</span></div>
      {profile?.account_type !== "provider" && <Link className="cs-menu-link" href="/cliente"><Icon name="briefcase"/><span>Meus pedidos</span><Icon name="chevron"/></Link>}
      {(profile?.account_type === "provider" || profile?.account_type === "both") && <><Link className="cs-menu-link" href="/prestador"><Icon name="search"/><span>Pedidos para atender</span><Icon name="chevron"/></Link><Link className="cs-menu-link" href="/prestador/perfil"><Icon name="user"/><span>Meu perfil profissional</span><Icon name="chevron"/></Link></>}
      <Link className="cs-menu-link" href="/propostas"><Icon name="mail"/><span>Minhas propostas</span><Icon name="chevron"/></Link>
      <Link className="cs-menu-link" href="/notificacoes"><Icon name="bell"/><span>Notificações</span><Icon name="chevron"/></Link>
      <div className="cs-menu-link"><Icon name="shield"/><span>Segurança da conta</span><span className="cs-hint" style={{marginLeft:"auto"}}>Conexão protegida</span></div>
      <div className="cs-menu-link">
        <form action="/auth/signout" method="post"><button type="submit"><Icon name="logout"/><span>Sair da conta</span></button></form>
      </div>
    </div>
    <p className="cs-hint" style={{textAlign:"center",marginTop:18}}>Para mudar a aparência do aplicativo, toque no ícone de lua ou sol no topo.</p>
  </AppFrame>;
}
