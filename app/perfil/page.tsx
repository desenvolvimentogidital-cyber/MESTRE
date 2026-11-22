import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/server";

export default async function ProfilePage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/perfil");
  const {data:profile}=await db.from("profiles")
    .select("full_name,account_type,phone").eq("id",user.id).maybeSingle();
  if(profile?.account_type!=="client"&&profile?.account_type!=="provider")redirect("/inicio");
  const client=profile.account_type==="client";
  return <AppFrame active="perfil" title="Minha conta">
    <section className="mf-profile-intro">
      <span className="mf-profile-avatar" aria-hidden="true"><Icon name="user" size={34}/></span>
      <div>
        <h1>{profile.full_name||"Minha conta"}</h1>
        <p>{user.email}</p>
        <span className="mf-profile-tag"><Icon name="shield" size={12}/> Conta de {client?"cliente":"profissional"}</span>
      </div>
    </section>

    <section className="mf-profile-group" aria-labelledby="mf-profile-activity">
      <h2 id="mf-profile-activity" className="mf-profile-group-title">Minha atividade</h2>
      <div className="mf-profile-links">
        {client?
          <Link className="cs-menu-link" href="/cliente">
            <Icon name="home"/><span>Meus pedidos</span><Icon name="chevron"/>
          </Link>:
          <><Link className="cs-menu-link" href="/prestador">
            <Icon name="briefcase"/><span>Pedidos para atender</span><Icon name="chevron"/>
          </Link>
          <Link className="cs-menu-link" href="/prestador/perfil">
            <Icon name="user"/><span>Meu perfil profissional</span><Icon name="chevron"/>
          </Link></>}
        <Link className="cs-menu-link" href="/propostas">
          <Icon name="layers"/><span>{client?"Propostas recebidas":"Orçamentos enviados"}</span><Icon name="chevron"/>
        </Link>
        <Link className="cs-menu-link" href="/conversas">
          <Icon name="mail"/><span>Minhas mensagens</span><Icon name="chevron"/>
        </Link>
      </div>
    </section>

    <section className="mf-profile-group" aria-labelledby="mf-profile-settings">
      <h2 id="mf-profile-settings" className="mf-profile-group-title">Conta e preferências</h2>
      <div className="mf-profile-links">
        <div className="cs-menu-link" role="group" aria-label="Dados do cadastro">
          <Icon name="user"/><span>Dados do cadastro</span>
          <span className="cs-hint" style={{marginLeft:"auto"}}>{profile.phone||"Conta ativa"}</span>
        </div>
        <Link className="cs-menu-link" href="/notificacoes">
          <Icon name="bell"/><span>Avisos do sistema</span><Icon name="chevron"/>
        </Link>
        <Link className="cs-menu-link" href="/instalar">
          <Icon name="download"/><span>Instalar MandaFazer</span><Icon name="chevron"/>
        </Link>
        <div className="cs-menu-link" role="group" aria-label="Conexão protegida">
          <Icon name="shield"/><span>Segurança da conta</span>
          <span className="cs-hint" style={{marginLeft:"auto"}}>Protegida</span>
        </div>
      </div>
    </section>

    <section className="mf-profile-group" aria-labelledby="mf-profile-help">
      <h2 id="mf-profile-help" className="mf-profile-group-title">Ajuda e suporte</h2>
      <div className="mf-profile-links">
        <Link className="cs-menu-link" href="/denuncias">
          <Icon name="shield"/><span>Minhas denúncias</span><Icon name="chevron"/>
        </Link>
        <div className="cs-menu-link">
          <form action="/auth/signout" method="post">
            <button type="submit"><Icon name="logout"/><span>Sair da conta</span></button>
          </form>
        </div>
      </div>
    </section>
    <p className="mf-profile-tip">Para alterar a aparência, use o ícone de sol ou lua no cabeçalho.</p>
  </AppFrame>;
}
