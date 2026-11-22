"use client";
import {useState} from "react";
import {Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Gate="signin"|"denied";

export function AdminAccess({state}:{state:Gate}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [showPassword,setShowPassword]=useState(false);

  async function login(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    setBusy(true);setMessage("");
    try{
      const db=createClient();
      const {error}=await db.auth.signInWithPassword({email:email.trim(),password});
      if(error)throw new Error("Não foi possível entrar. Confira o e-mail e a senha.");
      // Authenticated membership is checked on the server, never here.
      window.location.assign("/admin");
    }catch(error){
      setMessage(error instanceof Error?error.message:"Falha ao conectar. Tente novamente.");
      setBusy(false);
    }
  }
  async function switchAccount(){
    if(busy)return;
    setBusy(true);setMessage("");
    try{
      const db=createClient();
      const {error}=await db.auth.signOut();
      if(error)throw error;
      window.location.assign("/admin");
    }catch{
      setMessage("Não foi possível trocar de conta. Tente novamente.");
      setBusy(false);
    }
  }

  return <main className="mf-admin-gate">
    <div className="mf-admin-gate-top" aria-hidden="true">
      <span className="mf-admin-gate-icon"><Icon name="shield" size={29}/></span>
      <span>MANDAFAZER <strong>ADMIN</strong></span>
    </div>
    <section className="mf-admin-login-card">
      <span className="mf-admin-label"><Icon name="lock" size={15}/> Ambiente de acesso restrito</span>
      {state==="denied"?<>
        <div className="mf-admin-login-symbol warning"><Icon name="shield" size={31}/></div>
        <h1>Conta não autorizada</h1>
        <p>Esta conta não possui permissão para acessar a administração. Apenas o responsável autorizado pode analisar profissionais e denúncias.</p>
        <button type="button" className="mf-admin-primary" onClick={()=>void switchAccount()} disabled={busy}>
          <Icon name="user" size={18}/> {busy?"Trocando...":"Entrar com outra conta"}
        </button>
      </>:<>
        <div className="mf-admin-login-symbol"><Icon name="lock" size={29}/></div>
        <h1>Central administrativa</h1>
        <p>Faça login com a conta autorizada para gerenciar verificações de profissionais e moderação da plataforma.</p>
        <form onSubmit={e=>void login(e)} className="mf-admin-login-form">
          <label>E-mail da administração
            <input type="email" autoComplete="username" inputMode="email" required
              maxLength={254} placeholder="Seu e-mail de acesso"
              value={email} onChange={e=>setEmail(e.target.value)}/>
          </label>
          <label>Senha
            <span className="mf-admin-password">
              <input type={showPassword?"text":"password"} autoComplete="current-password" required
                minLength={6} placeholder="Informe sua senha"
                value={password} onChange={e=>setPassword(e.target.value)}/>
              <button type="button" onClick={()=>setShowPassword(x=>!x)}
                aria-label={showPassword?"Ocultar senha":"Mostrar senha"}>{showPassword?"Ocultar":"Mostrar"}</button>
            </span>
          </label>
          <button className="mf-admin-primary" type="submit" disabled={busy}>
            <Icon name="lock" size={17}/>{busy?"Verificando acesso...":"Acessar administração"}
          </button>
        </form>
      </>}
      {message&&<p className="mf-admin-error" role="alert">{message}</p>}
      <p className="mf-admin-gate-footnote">O endereço não concede privilégios. O acesso depende de autenticação e autorização individual no servidor.</p>
    </section>
    <p className="mf-admin-copyright">Área reservada · MandaFazer</p>
  </main>;
}
