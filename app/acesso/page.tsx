"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function AccessForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialType = params.get("tipo") === "prestador" ? "provider" : "client";
  const configError = params.get("erro") === "configuracao";
  const [type, setType] = useState<"client" | "provider">(initialType);
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const requestedPath = params.get("redirectTo");
      const nextPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/painel";
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim(), account_type: type } },
        });
        if (error) throw error;
        if (data.session) {
          router.replace(nextPath);
          router.refresh();
        } else {
          setMessage("Cadastro iniciado! Enviamos um link de confirmação para seu e-mail. Confirme para acessar sua conta.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.replace("/painel");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="access-page">
      <div className="access-top">
        <Link className="brand" href="/"><span className="brand-mark">M</span>Mestre</Link>
        <Link href="/" className="back-link">← Voltar ao início</Link>
      </div>
      <section className="access-card">
        <div className="access-kicker">BEM-VINDO AO MESTRE</div>
        <h1>{mode === "signup" ? "Crie sua conta" : "Que bom ter você de volta"}</h1>
        <p className="access-sub">{mode === "signup" ? "Comece gratuitamente. Escolha como quer participar." : "Entre para continuar usando a plataforma."}</p>
        {configError && <p className="access-message" role="alert">O Mestre está temporariamente sem conexão com o banco de dados. A equipe precisa configurar as variáveis do Supabase na hospedagem. Seus dados não foram apagados; tente novamente mais tarde.</p>}
        {mode === "signup" && (
          <div className="type-switch">
            <button type="button" className={type === "client" ? "type-active" : ""} onClick={() => setType("client")}>🏡 Sou cliente</button>
            <button type="button" className={type === "provider" ? "type-active" : ""} onClick={() => setType("provider")}>🧰 Sou prestador</button>
          </div>
        )}
        <form onSubmit={submit} className="access-form">
          {mode === "signup" && <label>Seu nome<input required value={name} onChange={e => setName(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" /></label>}
          <label>E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" /></label>
          <label>Senha<input required minLength={6} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>
          <button className="access-submit" disabled={busy}>{busy ? "Aguarde..." : mode === "signup" ? "Criar conta grátis →" : "Entrar →"}</button>
        </form>
        {message && <p className="access-message" role="status">{message}</p>}
        <p className="mode-change">
          {mode === "signup" ? "Já tem uma conta?" : "Ainda não tem conta?"}{" "}
          <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}>
            {mode === "signup" ? "Entrar" : "Cadastre-se"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default function AccessPage() {
  return <Suspense fallback={<div className="loading">Carregando...</div>}><AccessForm /></Suspense>;
}
