"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Brand, FeaturePhoto, Icon, ThemeSwitch } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/client";

function AccessForm() {
  const router = useRouter();
  const params = useSearchParams();
  const suggestedType = params.get("tipo") === "prestador" ? "provider" : "client";
  const [type, setType] = useState<"client" | "provider">(suggestedType);
  const [mode, setMode] = useState<"login" | "signup">(params.has("tipo") ? "signup" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const requestedPath = params.get("redirectTo");
  const nextPath = requestedPath && requestedPath.startsWith("/") && !requestedPath.startsWith("//") && !requestedPath.startsWith("/\\")
    ? requestedPath : "/painel";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const db = createClient();
      if (mode === "signup") {
        const { data, error } = await db.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), account_type: type }, emailRedirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(nextPath) },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(nextPath); router.refresh();
        } else {
          setMessage("Cadastro recebido. Confira seu e-mail para confirmar a conta antes de entrar.");
        }
      } else {
        const { error } = await db.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace(nextPath);
        router.refresh();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível acessar sua conta.");
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

  async function social(provider: "google" | "facebook") {
    setBusy(true); setMessage("");
    try {
      const db = createClient();
      const { error } = await db.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(nextPath) },
      });
      if (error) throw error;
    } catch {
      setMessage("Este método de acesso precisa estar habilitado na autenticação do ConectaServ.");
      setBusy(false);
    }
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
        <p className="cs-auth-sub">{mode === "login" ? "Acesse sua conta para continuar" : "Escolha como deseja participar do ConectaServ"}</p>
        {mode === "signup" && <div className="cs-role-switch">
          <button type="button" className={type === "client" ? "active" : ""} onClick={() => setType("client")}>Sou cliente</button>
          <button type="button" className={type === "provider" ? "active" : ""} onClick={() => setType("provider")}>Sou profissional</button>
        </div>}
        <form onSubmit={submit} className="cs-auth-form">
          {mode === "signup" && <label>Nome completo<input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Como podemos chamar você?"/></label>}
          <label className="cs-label" htmlFor="cs-email">E-mail</label>
          <div className="cs-auth-field"><Icon name="mail" size={18}/><input id="cs-email" type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)}/></div>
          <label className="cs-label" htmlFor="cs-pass">Senha</label>
          <div className="cs-auth-field"><Icon name="lock" size={18}/><input id="cs-pass" type={showPassword ? "text" : "password"} minLength={6} required autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha"/><button className="cs-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button></div>
          {mode === "login" && <div className="cs-auth-meta">
            <span className="cs-hint">Acesso seguro</span>
            <button type="button" disabled={busy} className="cs-small-link" style={{background:"none",border:0}} onClick={resetPassword}>Esqueceu a senha?</button>
          </div>}
          <button type="submit" disabled={busy} className="cs-button cs-button-primary">{busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}</button>
        </form>
        {(params.get("erro") === "configuracao" || params.get("erro") === "callback") && <p role="alert" className="cs-error">Não foi possível conectar à autenticação. A hospedagem precisa das variáveis públicas do Supabase.</p>}
        {message && <p role="status" className="cs-error" style={{marginTop:12}}>{message}</p>}
        <div className="cs-auth-divider">ou entre com</div>
        <div className="cs-social-row">
          <button disabled={busy} type="button" onClick={() => social("google")} className="cs-social"><strong>G</strong> Google</button>
          <button disabled={busy} type="button" onClick={() => social("facebook")} className="cs-social"><strong>f</strong> Facebook</button>
        </div>
        <p className="cs-auth-note">{mode === "login" ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>{mode === "login" ? "Cadastre-se" : "Entrar"}</button>
        </p>
      </div>
    </section>
  </main>;
}

export default function AccessPage() {
  return <Suspense fallback={<div className="loading">Carregando...</div>}><AccessForm/></Suspense>;
}
