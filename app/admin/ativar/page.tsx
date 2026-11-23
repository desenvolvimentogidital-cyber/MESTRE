"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Access="loading"|"guest"|"signedin"|"completed";

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
  const [signupMode,setSignupMode]=useState<"signup"|"signin">("signup");
  const [fullName,setFullName]=useState("");
  const [loginEmail,setLoginEmail]=useState("");
  const [loginPassword,setLoginPassword]=useState("");
  const [termsAccepted,setTermsAccepted]=useState(false);

  useEffect(()=>{
    try{
      const fromFragment=window.location.hash.slice(1);
      if(/^[0-9a-f]{64}$/.test(fromFragment)){
        setInvite(fromFragment);
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
      void db.auth.getUser().then(async({data,error})=>{
        if(error||!data.user){setAccess("guest");return;}
        setEmail(data.user.email||"");
        const {data:member}=await db.from("admin_members").select("user_id").eq("user_id",data.user.id).maybeSingle();
        if(member){window.location.replace("/admin");return;}
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

  async function registerOrLogin(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(busy)return;
    if(!invite.trim()){
      setMessage("Abra o convite exclusivo de ativação para continuar. O código não pode ficar vazio.");
      return;
    }
    setBusy(true);setMessage("");
    try{
      if(signupMode==="signup"){
        if(!termsAccepted)throw new Error("Aceite os Termos de Uso para criar a conta.");
        if(loginPassword.length<10||!/[a-zA-ZÀ-ÿ]/.test(loginPassword)||!/[0-9]/.test(loginPassword)){
          throw new Error("A senha precisa de pelo menos 10 caracteres, incluindo letras e números.");
        }
        const response=await fetch("/api/auth/registrar",{
          method:"POST",headers:{"Content-Type":"application/json"},
          credentials:"same-origin",cache:"no-store",
          body:JSON.stringify({
            name:fullName.trim(),email:loginEmail.trim(),password:loginPassword,
            type:"client",acceptedTerms:true,
          }),
        });
        const result=await response.json() as {ok?:boolean;sessionReady?:boolean;error?:string;message?:string};
        if(!response.ok||!result.ok)throw new Error(result.error||"Não foi possível criar a conta.");
        setLoginPassword("");
        if(!result.sessionReady){
          setSignupMode("signin");
          throw new Error("O cadastro foi criado, mas a confirmação de e-mail está ativa no Supabase. Confirme o endereço antes de entrar e concluir a ativação.");
        }
      }else{
        const db=createClient();
        const {error}=await db.auth.signInWithPassword({email:loginEmail.trim(),password:loginPassword});
        if(error)throw new Error("Não foi possível entrar. Confira o e-mail e a senha desta conta exclusiva.");
        setLoginPassword("");
      }
      window.location.replace("/admin/ativar");
    }catch(err){
      setMessage(err instanceof Error?err.message:"Não foi possível continuar. Confira seus dados.");
      setBusy(false);
    }
  }

  async function switchAccount(){
    setBusy(true);setMessage("");
    try{
      const db=createClient();
      await db.auth.signOut();
      window.location.replace("/admin/ativar");
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
        <p>Conclua a ativação diretamente nesta página. <strong>Não use a conta de cliente nem a de profissional dos testes.</strong> A administração deve ter login próprio.</p>
        <div className="mf-admin-onboarding-tabs" role="group" aria-label="Cadastro de administrador">
          <button type="button" className={signupMode==="signup"?"active":""} onClick={()=>{setSignupMode("signup");setMessage("");}}>Criar conta exclusiva</button>
          <button type="button" className={signupMode==="signin"?"active":""} onClick={()=>{setSignupMode("signin");setMessage("");}}>Já criei a conta</button>
        </div>
        <form className="mf-admin-login-form" onSubmit={e=>void registerOrLogin(e)}>
          {signupMode==="signup"&&<label>Nome do responsável
            <input required minLength={2} maxLength={100} autoComplete="name"
              value={fullName} onChange={e=>setFullName(e.target.value)}
              placeholder="Seu nome completo"/>
          </label>}
          <label>E-mail {signupMode==="signup"?"exclusivo para administração":"da conta administrativa"}
            <input type="email" required maxLength={254} autoComplete="username"
              value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}
              placeholder="E-mail que você controla"/>
          </label>
          <label>Senha
            <input type="password" required minLength={signupMode==="signup"?10:6}
              autoComplete={signupMode==="signup"?"new-password":"current-password"}
              value={loginPassword} onChange={e=>setLoginPassword(e.target.value)}
              placeholder={signupMode==="signup"?"Pelo menos 10 caracteres, letras e números":"Sua senha"}/>
          </label>
          {signupMode==="signup"&&<label className="mf-admin-legal-check">
            <input type="checkbox" required checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)}/>
            <span>Aceito os <Link href="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</Link> e li a <Link href="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>.</span>
          </label>}
          <button className="mf-admin-primary" type="submit" disabled={busy}>
            {busy?"Conectando...":signupMode==="signup"?"Criar conta e continuar":"Entrar e continuar"}
          </button>
        </form>
        <p className="mf-admin-gate-footnote">Depois do login você confirma o código do convite na mesma página. Sua senha nunca é enviada para a administração do ChatGPT.</p>
      </div>}
      {access==="signedin"&&<form className="mf-admin-login-form" onSubmit={activate}>
        <p className="mf-admin-onboarding-email">Conta conectada: <strong>{email}</strong></p>
        <p className="mf-admin-onboarding-help">Se este e-mail é de uma conta de cliente ou profissional usada nos testes, toque em <strong>Trocar para uma conta nova</strong>. Contas com pedidos, propostas ou conversas não podem ser promovidas a administrador.</p>
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
