"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Brand, FeaturePhoto, Icon, ThemeSwitch } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/client";

async function limitWait<T>(promise:Promise<T>,seconds=18):Promise<T>{
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
    return await Promise.race([
      promise,
      new Promise<never>((_,reject)=>{
        timer=setTimeout(()=>reject(new Error("A conexão demorou demais. Confira sua internet e tente novamente.")),seconds*1000);
      }),
    ]);
  }finally{if(timer)clearTimeout(timer);}
}

function AccessForm() {
  const router = useRouter();
  const params = useSearchParams();
  const suggestedType = params.get("tipo") === "prestador" ? "provider" : "client";
  const [type, setType] = useState<"client" | "provider">(suggestedType);
  const [mode, setMode] = useState<"login" | "signup">(params.get("cadastro")==="1" || (params.has("tipo") && params.get("acessar")!=="1") ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted,setTermsAccepted]=useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSuccess,setMessageSuccess]=useState(false);

  const requestedPath = params.get("redirectTo");
  const nextPath = requestedPath && requestedPath.startsWith("/") && !requestedPath.startsWith("//") && !requestedPath.startsWith("/\\")
    ? requestedPath : "/painel";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy)return;
    setBusy(true);
    setMessage("");
    setMessageSuccess(false);
    try {
      if(mode==="signup"){
        if(!termsAccepted)throw new Error("Leia e aceite os Termos de Uso antes de criar a conta.");
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),18000);
        try{
          const response=await fetch("/api/auth/registrar",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({name:name.trim(),email:email.trim(),password,type,next:nextPath,acceptedTerms:termsAccepted}),
            cache:"no-store",
            signal:controller.signal,
          });
          const result=await response.json() as {ok?:boolean;sessionReady?:boolean;message?:string;error?:string};
          if(!response.ok||!result.ok)throw new Error(result.error||"Não foi possível concluir seu cadastro.");
          if(result.sessionReady){
            router.replace(nextPath);router.refresh();
          }else{
            setMessageSuccess(true);
            setMessage(result.message||"Para entrar sem confirmação, desative Confirm email no Supabase.");
            setMode("login");
            setPassword("");
          }
        }finally{clearTimeout(timeout);}
      }else{
        const db=createClient();
        const {error}=await limitWait(db.auth.signInWithPassword({email:email.trim(),password}));
        if(error){
          if(error.code==="invalid_credentials")throw new Error("E-mail ou senha não conferem. Se ainda não tem conta, toque em Cadastre-se.");
          if(error.code==="email_not_confirmed")throw new Error("O Supabase ainda está exigindo confirmação de e-mail. Desative Confirm email no painel do Supabase para liberar o acesso imediato.");
          throw error;
        }
        router.replace(nextPath);router.refresh();
      }
    } catch (err) {
      const text=err instanceof Error?err.message:"Não foi possível acessar sua conta.";
      setMessage(err instanceof Error&&err.name==="AbortError"?"O cadastro está demorando mais que o normal. Confira sua internet antes de tentar novamente.":text);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!email.trim()) { setMessage("Digite seu e-mail para receber o link de recuperação de senha."); return; }
    setBusy(true); setMessage("");
    try {
      const db = createClient();
      const { error } = await db.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/auth/callback?next=%2Fredefinir-senha" });
      if (error) throw error;
      setMessage("Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível enviar o e-mail.");
    } finally { setBusy(false); }
  }

  return <main className="cs-auth-shell">
    <aside className="cs-auth-aside">
      <Brand />
      <div><h2>Encontre. Contrate. Realize.</h2><p>A plataforma que conecta você a profissionais de confiança, com praticidade e segurança.</p></div>
      <FeaturePhoto kind="builder"/>
    </aside>
    <section className="cs-auth-main">
      <div className="cs-auth-top-actions"><Link className="cs-small-link" href="/">← Voltar</Link><ThemeSwitch/></div>
      <div className="cs-auth-card">
        <Brand centered/>
        <h1>{mode === "login" ? "Entrar na sua conta" : "Crie sua conta"}</h1>
        <p className="cs-auth-sub">{mode === "login" ? "Entre com seu e-mail e senha. Se for sua primeira vez, escolha Cadastre-se abaixo." : "Escolha cliente ou profissional. O acesso será imediato quando a confirmação de e-mail estiver desativada no Supabase."}</p>
        {mode === "signup" && <div className="cs-role-switch">
          <button type="button" className={type === "client" ? "active" : ""} onClick={() => setType("client")}>Sou cliente</button>
          <button type="button" className={type === "provider" ? "active" : ""} onClick={() => setType("provider")}>Sou profissional</button>
        </div>}
        <form onSubmit={submit} className="cs-auth-form">
          {mode === "signup" && <label>Nome completo<input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Como podemos chamar você?"/></label>}
          <label className="cs-label" htmlFor="cs-email">E-mail</label>
          <div className="cs-auth-field"><Icon name="mail" size={18}/><input id="cs-email" type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}/></div>
          <label className="cs-label" htmlFor="cs-pass">Senha</label>
          <div className="cs-auth-field"><Icon name="lock" size={18}/><input id="cs-pass" type={showPassword ? "text" : "password"} minLength={mode==="signup"?10:6} required autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha"/><button className="cs-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button></div>
          {mode === "login" && <div className="cs-auth-meta">
            <span className="cs-hint">Acesso seguro</span>
            <button type="button" disabled={busy} className="cs-small-link" style={{background:"none",border:0}} onClick={resetPassword}>Esqueceu a senha?</button>
          </div>}
          {mode==="signup"&&<>
            <p className="cs-hint">Crie uma senha de pelo menos 10 caracteres, incluindo letras e números.</p>
            <label className="mf-legal-check"><input type="checkbox" required checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)}/>
              <span>Li e aceito os <Link href="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</Link> e tomei conhecimento da <Link href="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>.</span>
            </label>
          </>}
          <button type="submit" disabled={busy} className="cs-button cs-button-primary">{busy ? (mode==="signup"?"Enviando cadastro...":"Verificando acesso...") : mode === "login" ? "Entrar" : "Criar minha conta"}</button>
        </form>
        {(params.get("erro") === "configuracao" || params.get("erro") === "callback") && <p role="alert" className="cs-error">Não foi possível conectar à autenticação. A hospedagem precisa das variáveis públicas do Supabase.</p>}
        {message && <p role={messageSuccess?"status":"alert"} aria-live="polite" className={messageSuccess?"cs-success":"cs-error"} style={{marginTop:12}}>{message}</p>}
        <p className="cs-hint" style={{textAlign:"center",marginTop:17}}>
          Por enquanto, utilize e-mail e senha. Acesso por Google e Facebook será liberado após a configuração.
        </p>
        <p className="cs-hint" style={{textAlign:"center"}}>Precisa de ajuda? <Link href="/suporte">Fale com o suporte</Link>.</p>
        <p className="cs-auth-note">{mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage("");setMessageSuccess(false); }}>{mode === "login" ? "Cadastre-se" : "Entrar"}</button>
        </p>
      </div>
    </section>
  </main>;
}

export default function AccessPage() {
  return <Suspense fallback={<div className="loading">Carregando...</div>}><AccessForm/></Suspense>;
}
