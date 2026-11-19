"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/acesso";
      else setEmail(data.user.email ?? "");
      setLoading(false);
    }).catch(() => { window.location.href = "/acesso"; });
  }, []);
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }
  if (loading) return <div className="loading">Carregando seu painel...</div>;
  return <main className="dashboard">
    <header className="dash-header"><Link className="brand" href="/"><span className="brand-mark">M</span>Mestre</Link><button className="logout" onClick={logout}>Sair</button></header>
    <section className="dash-content"><div className="eyebrow"><span className="eyebrow-dot"/> CONTA CONECTADA</div><h1>Bem-vindo ao Mestre!</h1><p>Sua conta está autenticada como <strong>{email}</strong>.</p><div className="dash-notice"><strong>Estamos preparando seu espaço.</strong><br/>Em breve você poderá completar seu perfil, publicar pedidos, receber propostas e conversar com profissionais por aqui.</div><Link className="btn btn-primary" href="/">Voltar ao início</Link></section>
  </main>;
}
