"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Access="loading"|"guest"|"signedin"|"completed";
const signupPath="/acesso?cadastro=1&redirectTo=%2Fadmin%2Fativar";
const signinPath="/acesso?acessar=1&redirectTo=%2Fadmin%2Fativar";

/**
 * A private one-time invite authorizes the first real owner account.
 * No SMTP confirmation is needed when Confirm email is OFF in Supabase Auth.
 * Never confuse this flow with the mock demonstration at /admin/teste.
 */
export default function ActivateOwnerAdmin(){
  const [access,setAccess]=useState<Access>("loading");
  const [invite,setInvite]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [email,setEmail]=useState("");

  useEffect(()=>{
    try{
      const fromFragment=window.location.hash.slice(1);
      if(/^[0-9a-f]{64}$/.test(fromFragment)){
        window.sessionStorage.setItem("mf-owner-invite",fromFragment);
        window.history.replaceState(null,"",window.location.pathname);
      }
      const saved=window.sessionStorage.getItem("mf-owner-invite");
      if(saved&&/^[0-9a-f]{64}$/.test(saved))setInvite(saved);
    }catch{
      // Manual code entry remains available if sessionStorage is blocked.
    }
    try{
      const db=createClient();
      void db.auth.getUser().then(({data,error})=>{
        if(error||!data.user){setAccess("guest");return;}
        setEmail(data.user.email||"");
        setAccess("signedin");
      }).catch(()=>setAccess("guest"));
    }catch{setMessage("A autenticação não está configurada nesta implantação.");setAccess("guest");}
  },[]);

  async function activate(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(busy)return;
    const code=invite.trim().toLowerCase();
    if(!/^[0-9a-f]{64}$/.test(code)){
      setMessage("Código de convite inválido. Use o convite completo enviado pelo responsável.");
      return;
    }
    setBusy(true);setMessage("");
    try{
      const db=createClient();
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user)throw new Error("Faça login antes de ativar.");
      const {data,error}=await db.rpc("activate_admin_with_invite",{p_invite_code:code});
      if(error)throw new Error(error.message);
      if(data!==true)throw new Error("A ativação não foi concluída.");
      try{window.sessionStorage.removeItem("mf-owner-invite");}catch{}
      setAccess("completed");
      window.location.replace("/admin");
    }catch(err){
      setMessage(err instanceof Error?err.message:"Não foi possível ativar. Verifique a conta e o convite.");
    }finally{setBusy(false);}
  }

  async function switchAccount(){
    setBusy(true);setMessage("");
    try{
      const db=createClient();
      await db.auth.signOut();
      window.location.replace(signupPath);
    }catch{setBusy(false);setMessage("Não foi possível sair da conta atual.");}
  }

  return <main className="mf-admin-gate">
    <div className="mf-admin-gate-top"><span className="mf-admin-gate-icon"><Icon name="shield" size={28}/></span><span>MANDAFAZER <strong>ADMIN</strong></span></div>
    <section className="mf-admin-login-card">
      <span className="mf-admin-label">Ativação reservada · Convite único</span>
      <div className="mf-admin-login-symbol"><Icon name="lock" size={29}/></div>
      <h1>Ativar o administrador real</h1>
      <p>Esta ativação é diferente da demonstração. Depois de ativada, sua conta poderá analisar denúncias e verificações reais. O convite só funciona uma vez.</p>
      {access==="loading"&&<p>Verificando sua sessão...</p>}
      {access==="guest"&&<div className="mf-admin-onboarding-actions">
        <p>Primeiro, crie uma <strong>conta nova e exclusiva</strong> para a administração. Use um e-mail que você controla e uma senha forte. Durante os testes, o cadastro pode ser imediato, sem confirmação por e-mail.</p>
        <Link className="mf-admin-primary" href={signupPath}>Criar minha conta administrativa</Link>
        <Link className="mf-admin-demo-secondary" href={signinPath}>Já tenho uma conta nova: entrar</Link>
      </div>}
      {access==="signedin"&&<form className="mf-admin-login-form" onSubmit={activate}>
        <p className="mf-admin-onboarding-email">Conta conectada: <strong>{email}</strong></p>
        <p className="mf-admin-onboarding-help">Para manter as contas separadas, esta conta não pode ter pedidos, propostas, conversas ou avaliações anteriores.</p>
        <label>Código privado de ativação
          <input type="password" autoComplete="off" required minLength={64} maxLength={64}
            spellCheck={false} autoCapitalize="none" value={invite}
            onChange={e=>setInvite(e.target.value.trim().toLowerCase())}
            placeholder="Cole o código do convite"/>
        </label>
        <button className="mf-admin-primary" type="submit" disabled={busy}>{busy?"Ativando...":"Ativar acesso administrativo real"}</button>
        <button type="button" className="mf-admin-demo-secondary" disabled={busy} onClick={()=>void switchAccount()}>Trocar para uma conta nova</button>
      </form>}
      {access==="completed"&&<p role="status">Conta administrativa ativada. Abrindo o painel real...</p>}
      {message&&<p className="mf-admin-error" role="alert">{message}</p>}
      <p className="mf-admin-gate-footnote">Esta página não dá acesso por si só. A autorização é feita pelo servidor e o convite expira após o prazo configurado.</p>
    </section>
    <p className="mf-admin-copyright">MandaFazer · Administração privada</p>
  </main>;
}
