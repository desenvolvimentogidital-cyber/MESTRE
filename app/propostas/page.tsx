"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFrame, Icon } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/client";

type Proposal = { id: string; request_id: string; provider_id: string; status: string; amount: number | null; message: string; created_at: string; estimated_days: number | null; title?: string };
type Tab = "all" | "sent" | "accepted";

const statusName: Record<string,string> = {
  sent: "Pendente", accepted: "Contratada", rejected: "Recusada", withdrawn: "Retirada",
};
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default function ProposalsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [data, setData] = useState<Proposal[]>([]);
  const [role, setRole] = useState<"client" | "provider">("client");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const db = createClient();
        const { data: auth, error: authError } = await db.auth.getUser();
        if (authError || !auth.user) { router.replace("/acesso?redirectTo=/propostas"); return; }
        const { data: profile } = await db.from("profiles").select("account_type").eq("id", auth.user.id).maybeSingle();
        const isProvider = profile?.account_type === "provider";
        if (!mounted) return;
        setRole(isProvider ? "provider" : "client");
        let raw: Proposal[] = [];
        if (isProvider) {
          const { data: proposals, error: pError } = await db.from("proposals").select("id,request_id,provider_id,status,amount,message,created_at,estimated_days").eq("provider_id", auth.user.id).order("created_at", { ascending: false });
          if (pError) throw pError;
          raw = (proposals || []) as Proposal[];
        } else {
          const { data: requests, error: rError } = await db.from("service_requests").select("id,title").eq("client_id", auth.user.id);
          if (rError) throw rError;
          const ids = (requests || []).map(r => r.id);
          if (ids.length) {
            const { data: proposals, error: pError } = await db.from("proposals").select("id,request_id,provider_id,status,amount,message,created_at,estimated_days").in("request_id", ids).order("created_at", { ascending: false });
            if (pError) throw pError;
            raw = (proposals || []) as Proposal[];
            const names = Object.fromEntries((requests || []).map(r => [r.id, r.title]));
            raw = raw.map(p => ({ ...p, title: names[p.request_id] }));
          }
        }
        if (isProvider && raw.length) {
          const ids = [...new Set(raw.map(p => p.request_id))];
          const { data: requests } = await db.from("service_requests").select("id,title").in("id", ids);
          const names = Object.fromEntries((requests || []).map(r => [r.id, r.title]));
          raw = raw.map(p => ({ ...p, title: names[p.request_id] }));
        }
        if (mounted) setData(raw);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Não foi possível carregar as propostas.");
      } finally { if (mounted) setBusy(false); }
    }
    load();
    return () => { mounted = false; };
  }, [router]);

  const filtered = useMemo(() => data.filter(p => tab === "all" || (tab === "accepted" ? p.status === "accepted" : p.status === "sent")), [data,tab]);

  return <AppFrame title="Minhas Propostas" active="propostas">
    <h1 className="cs-top-title">Minhas Propostas</h1>
    <p className="cs-hint">{role === "client" ? "Confira os orçamentos enviados para seus pedidos." : "Acompanhe suas propostas enviadas aos clientes."}</p>
    <div className="cs-filter-tabs" role="group" aria-label="Filtrar propostas">
      <button type="button" className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>Todas ({data.length})</button>
      <button type="button" className={tab === "sent" ? "active" : ""} onClick={() => setTab("sent")}>{role === "client" ? "Recebidas" : "Enviadas"}</button>
      <button type="button" className={tab === "accepted" ? "active" : ""} onClick={() => setTab("accepted")}>Contratadas</button>
    </div>
    {busy && <p className="cs-hint">Carregando propostas...</p>}
    {error && <p role="alert" className="cs-error">{error}</p>}
    {!busy && !error && filtered.length === 0 && <div className="cs-empty">
      <Icon name="briefcase" size={29}/>
      <h2>{tab === "all" ? "Ainda não há propostas" : "Nenhuma proposta nesta categoria"}</h2>
      <p>{role === "client" ? "Quando profissionais responderem aos seus pedidos, os orçamentos aparecerão aqui." : "Suas propostas enviadas aos clientes aparecerão aqui."}</p>
      {role === "client" && <Link className="cs-button cs-button-primary" href="/cliente/novo">Publicar pedido</Link>}
    </div>}
    {!busy && !error && filtered.map(proposal => <article className="cs-card cs-proposal-card" key={proposal.id}>
      <div className="cs-proposal-top">
        <div><h3>{proposal.title || "Pedido de serviço"}</h3><span className="cs-proposal-date">{new Intl.DateTimeFormat("pt-BR",{ dateStyle:"short" }).format(new Date(proposal.created_at))}</span></div>
        <span className={"cs-status " + proposal.status}>{statusName[proposal.status] || proposal.status}</span>
      </div>
      <strong className="cs-price">{proposal.amount === null ? "Sob consulta" : money(proposal.amount)}</strong>
      <p className="cs-proposal-body">{proposal.message}</p>
      <div className="cs-proposal-bottom">
        <span className="cs-hint">{proposal.estimated_days !== null ? "Prazo: " + proposal.estimated_days + " dia(s)" : "Prazo a combinar"}</span>
        <Link href="/cliente" className="cs-small-link">Ver pedido <Icon name="chevron" size={15}/></Link>
      </div>
    </article>)}
  </AppFrame>;
}
