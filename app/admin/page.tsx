import {AdminAccess} from "./admin-access";
import {AdminWorkspace} from "@/components/admin-workspace";
import {Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const revalidate=0;

/** Separate visual portal. Access controlled by admin_members in Supabase. */
export default async function PrivateAdminPage(){
  const db=await createClient();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(!user||authError)return <AdminAccess state="signin"/>;
  const {data:member,error:membershipError}=await db.from("admin_members")
    .select("user_id").eq("user_id",user.id).maybeSingle();
  // Fail closed: a missing row or database error never reveals administrative data.
  if(!member||membershipError)return <AdminAccess state="denied"/>;

  return <main className="mf-admin-console">
    <header className="mf-admin-topbar">
      <div className="mf-admin-ident">
        <span className="mf-admin-ident-symbol" aria-hidden="true"><Icon name="shield" size={24}/></span>
        <div><span className="mf-admin-wordmark">MandaFazer</span><small>ADMINISTRAÇÃO PRIVADA</small></div>
      </div>
      <div className="mf-admin-topbar-actions">
        <span className="mf-admin-restricted"><Icon name="lock" size={15}/> Acesso autorizado</span>
        <form action="/auth/signout" method="post">
          <button type="submit" className="mf-admin-signout"><Icon name="logout" size={16}/> Sair</button>
        </form>
      </div>
    </header>

    <div className="mf-admin-content">
      <div className="mf-admin-breadcrumb"><Icon name="shield" size={14}/> Central privada <span>/</span> Moderação</div>
      <section className="mf-admin-intro">
        <div>
          <span className="mf-admin-label"><Icon name="shield" size={15}/> Área exclusiva do responsável</span>
          <h1>Gestão e segurança</h1>
          <p>Analise solicitações de verificação de profissionais, denúncias e medidas de moderação sem acessar os painéis de clientes ou prestadores.</p>
        </div>
        <span className="mf-admin-intro-icon" aria-hidden="true"><Icon name="shield" size={43}/></span>
      </section>
      <div className="mf-admin-section-title">
        <span>Fila de análise</span>
        <small>Dados acessíveis somente a contas autorizadas</small>
      </div>
      <AdminWorkspace/>
    </div>
    <footer className="mf-admin-footer">MandaFazer · Central administrativa reservada</footer>
  </main>;
}
