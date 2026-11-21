"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Brand, ThemeSwitch } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("Validando o link de recuperação...");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const db = createClient();
      const { data: listener } = db.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setReady(true);
          setMessage("");
        }
      });
      db.auth.getSession().then(({ data }) => {
        if (data.session) { setReady(true); setMessage(""); }
        else setMessage("Abra o link enviado para seu e-mail. Se expirou, solicite um novo na tela de acesso.");
      }).catch(() => setMessage("Não foi possível verificar seu acesso."));
      return () => listener.subscription.unsubscribe();
    } catch {
      setMessage("A autenticação ainda não está configurada nesta hospedagem.");
    }
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const db = createClient();
      const { error } = await db.auth.updateUser({ password });
      if (error) throw error;
      setDone(true); setMessage("Senha alterada com sucesso. Você já pode entrar.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível alterar sua senha.");
    } finally { setBusy(false); }
  }

  return <main className="cs-auth-main" style={{minHeight:"100vh"}}>
    <div className="cs-auth-top-actions"><ThemeSwitch/></div>
    <section className="cs-auth-card"><Brand centered/>
      <h1>Redefinir minha senha</h1>
      <p className="cs-auth-sub">Crie uma nova senha segura para sua conta.</p>
      {ready && !done && <form className="cs-auth-form" onSubmit={submit}>
        <label>Nova senha<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres"/></label>
        <button type="submit" disabled={busy} className="cs-button cs-button-primary">{busy ? "Atualizando..." : "Atualizar senha"}</button>
      </form>}
      {message && <p role="status" className={done ? "cs-success" : "cs-hint"}>{message}</p>}
      <Link href="/acesso" className="cs-button cs-button-outline" style={{width:"100%",marginTop:20}}>Voltar ao acesso</Link>
    </section>
  </main>;
}
