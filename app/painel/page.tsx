import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const accountLabels: Record<string, string> = {
  client: "Cliente",
  provider: "Prestador de serviços",
  both: "Cliente e prestador",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/acesso");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, account_type")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="dashboard">
      <header className="dash-header">
        <Link className="brand" href="/"><span className="brand-mark">M</span>Mestre</Link>
        <form action="/auth/signout" method="post"><button className="logout" type="submit">Sair</button></form>
      </header>
      <section className="dash-content">
        <div className="eyebrow"><span className="eyebrow-dot" /> CONTA CONECTADA</div>
        <h1>Bem-vindo{profile?.full_name ? `, ${profile.full_name}` : ""}!</h1>
        <p>Sua conta está autenticada como <strong>{user.email}</strong>.</p>
        <div className="dash-notice">
          <strong>Perfil: {accountLabels[profile?.account_type ?? ""] ?? "Conta Mestre"}</strong>
          <br />
          Sua conta está protegida e pronta para completar o cadastro. Estamos construindo as áreas de pedidos, propostas e conversas.
        </div>
        <Link className="btn btn-primary" href="/">Voltar ao início</Link>
      </section>
    </main>
  );
}
