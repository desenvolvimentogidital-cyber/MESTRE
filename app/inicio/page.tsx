"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppFrame, FeaturePhoto, Icon } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; slug: string };
type Provider = { user_id: string; display_name: string; city: string | null; state: string | null; years_experience: number | null; is_verified:boolean;average_rating:number;review_count:number };

function iconFor(label: string): "hammer" | "bolt" | "drop" | "sparkle" | "camera" {
  const s = label.toLocaleLowerCase("pt-BR");
  if (s.includes("elétr") || s.includes("eletr")) return "bolt";
  if (s.includes("hidr") || s.includes("encan")) return "drop";
  if (s.includes("limp")) return "sparkle";
  if (s.includes("segur") || s.includes("câmer")) return "camera";
  return "hammer";
}

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const db = createClient();
        const [c, p] = await Promise.all([
          db.from("service_categories").select("id,name,slug").eq("is_active", true).order("name"),
          db.from("provider_profiles").select("user_id,display_name,city,state,years_experience,is_verified,average_rating,review_count").eq("is_active", true).limit(5),
        ]);
        if (!mounted) return;
        if (c.error) throw c.error;
        setCategories((c.data ?? []) as Category[]);
        if (!p.error) setProviders((p.data ?? []) as Provider[]);
      } catch {
        if (mounted) setMessage("As categorias estão temporariamente indisponíveis. Você ainda pode criar um pedido.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const visibleCategories = useMemo(() => categories.filter(c => c.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))), [categories, search]);
  const visibleProviders = useMemo(() => providers.filter(p => p.display_name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))), [providers, search]);

  return <AppFrame active="inicio">
    <div className="cs-home-hello">
      <div><h1 className="cs-top-title">Olá, seja bem-vindo! 👋</h1><p>O que você precisa hoje?</p></div>
      <span className="cs-user-avatar" aria-hidden="true">👷</span>
    </div>
    <label className="cs-search">
      <Icon name="search"/>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar serviços ou profissionais..." aria-label="Buscar serviços ou profissionais"/>
    </label>
    <div className="cs-banner">
      <div className="cs-banner-copy">
        <h2>Serviços de qualidade, perto de você!</h2>
        <Link href="/cliente/novo" className="cs-button cs-button-orange">Encontrar agora <Icon name="arrow" size={16}/></Link>
      </div>
      <FeaturePhoto kind="builder"/>
    </div>
    <div className="cs-section-head"><h2 className="cs-section-title">Categorias</h2><Link className="cs-small-link" href="/cliente/novo">Publicar pedido <Icon name="arrow" size={14}/></Link></div>
    {loading && <p className="cs-hint">Carregando categorias...</p>}
    {message && <div role="status" className="cs-error">{message}</div>}
    {!loading && !message && visibleCategories.length === 0 && <p className="cs-hint">{search ? "Nenhuma categoria com esse nome." : "Nenhuma categoria disponível."}</p>}
    <div className="cs-categories">
      {visibleCategories.map(category => <Link className="cs-category" key={category.id} href="/cliente/novo" title={"Publicar pedido: " + category.name}>
        <span className="cs-category-icon"><Icon name={iconFor(category.name)} size={26}/></span>
        <span>{category.name}</span>
      </Link>)}
    </div>
    <div className="cs-section-head"><h2 className="cs-section-title">Profissionais em destaque</h2><Link className="cs-small-link" href="/cliente/novo">Pedir orçamento <Icon name="arrow" size={14}/></Link></div>
    {visibleProviders.length > 0 ? <div className="cs-info-list">{visibleProviders.map(pro => <div className="cs-provider-card cs-card" key={pro.user_id}>
      <div className="cs-provider-face" aria-hidden="true">👷</div>
      <div><strong>{pro.display_name} {pro.is_verified&&<span title="Perfil conferido pela equipe" className="cs-verified-mini"><Icon name="shield" size={14}/></span>}</strong><small>{[pro.city,pro.state].filter(Boolean).join(", ") || "Profissional cadastrado"}{pro.years_experience ? " · " + pro.years_experience + " anos de experiência" : ""}</small>{pro.review_count>0&&<small className="cs-rating-display"><Icon name="star" size={12}/> {Number(pro.average_rating).toFixed(1)} · {pro.review_count} avaliações</small>}</div>
      <Link href={"/profissional/"+encodeURIComponent(pro.user_id)} aria-label={"Ver perfil: " + pro.display_name}><Icon name="chevron"/></Link>
    </div>)}</div> :
      !loading && <div className="cs-empty"><Icon name="user" size={25}/><h2>Profissionais chegando</h2><p>Ainda não há perfis disponíveis para exibir. Publique seu pedido e acompanhe as novidades.</p><Link className="cs-button cs-button-outline" href="/cliente/novo">Publicar pedido</Link></div>
    }
    <div className="cs-section-head"><h2 className="cs-section-title">Serviço em destaque</h2></div>
    <Link className="cs-list-card cs-card" href="/servicos/cameras" style={{ display: "flex" }}><span className="cs-list-icon"><Icon name="camera"/></span><span><h3>Instalação de câmeras</h3><p>Conheça o serviço e solicite um orçamento</p></span><Icon name="chevron"/></Link>
    <div className="cs-section-head"><h2 className="cs-section-title">Sou profissional</h2></div>
    <Link className="cs-list-card cs-card" href="/prestador" style={{ display: "flex" }}><span className="cs-list-icon"><Icon name="hammer"/></span><span><h3>Encontrar oportunidades</h3><p>Acesse pedidos de clientes e envie propostas</p></span><Icon name="chevron"/></Link>
    <div className="cs-section-head"><h2 className="cs-section-title">Seus serviços</h2></div>
    <Link className="cs-list-card cs-card" href="/cliente" style={{ display: "flex" }}><span className="cs-list-icon"><Icon name="briefcase"/></span><span><h3>Meus pedidos</h3><p>Acompanhe seus serviços e propostas</p></span><Icon name="chevron"/></Link>
  </AppFrame>;
}
