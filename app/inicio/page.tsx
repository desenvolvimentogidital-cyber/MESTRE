"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AppFrame,FeaturePhoto,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Category={id:string;name:string;slug:string};
type Provider={user_id:string;display_name:string;city:string|null;state:string|null;years_experience:number|null;is_verified:boolean;average_rating:number;review_count:number};
type Role="client"|"provider"|"guest";
type CategoryIcon="wind"|"scissors"|"bolt"|"drop"|"truck"|"leaf"|"sparkle"|"wrench"|"hammer"|"camera";

function iconFor(label:string):CategoryIcon{
  const s=label.toLocaleLowerCase("pt-BR");
  if(s.includes("ar-cond")||s.includes("climat"))return "wind";
  if(s.includes("beleza")||s.includes("estética"))return "scissors";
  if(s.includes("elétr")||s.includes("eletric"))return "bolt";
  if(s.includes("hidr")||s.includes("encan"))return "drop";
  if(s.includes("frete")||s.includes("mudança"))return "truck";
  if(s.includes("jardin"))return "leaf";
  if(s.includes("limp"))return "sparkle";
  if(s.includes("móve")||s.includes("montage"))return "wrench";
  if(s.includes("câmer")||s.includes("tecnol")||s.includes("seguran"))return "camera";
  return "hammer";
}

export default function ExplorePage(){
  const router=useRouter();
  const [categories,setCategories]=useState<Category[]>([]);
  const [providers,setProviders]=useState<Provider[]>([]);
  const [role,setRole]=useState<Role>("guest");
  const [search,setSearch]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let mounted=true;
    async function load(){
      try{
        const db=createClient();
        const [c,p,a]=await Promise.all([
          db.from("service_categories").select("id,name,slug").eq("is_active",true).order("name"),
          db.from("provider_profiles").select("user_id,display_name,city,state,years_experience,is_verified,average_rating,review_count")
            .eq("is_active",true).eq("is_suspended",false).limit(5),
          db.auth.getUser(),
        ]);
        if(!mounted)return;
        if(c.error)throw c.error;
        setCategories((c.data||[]) as Category[]);
        if(!p.error)setProviders((p.data||[]) as Provider[]);
        if(a.data.user){
          const {data:profile}=await db.from("profiles").select("account_type").eq("id",a.data.user.id).maybeSingle();
          if(mounted)setRole(profile?.account_type==="client"?"client":profile?.account_type==="provider"?"provider":"guest");
        }
      }catch{
        if(mounted)setMessage("Não foi possível atualizar as categorias. Confira sua conexão e tente novamente.");
      }finally{if(mounted)setLoading(false);}
    }
    void load();
    return()=>{mounted=false;};
  },[]);

  const visibleCategories=useMemo(()=>categories.filter(c=>
    c.name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))||
    (search.toLocaleLowerCase("pt-BR").startsWith("pedreir")&&c.slug==="reformas-construcao")
  ),[categories,search]);
  const visibleProviders=useMemo(()=>providers.filter(p=>
    p.display_name.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))
  ),[providers,search]);

  return <AppFrame active="inicio" title="Explorar serviços">
    <section className="mf-explore-intro">
      <div>
        <span className="cs-eyebrow">Bem-vindo ao MandaFazer</span>
        <h1 className="cs-top-title" style={{marginTop:7}}>Seu próximo serviço começa aqui.</h1>
        <p>O que você precisa resolver hoje?</p>
      </div>
      <span className="mf-avatar" aria-hidden="true"><Icon name="user" size={24}/></span>
    </section>

    <form className="mf-search-wrap" role="search" onSubmit={e=>{
      e.preventDefault();router.push("/profissionais?q="+encodeURIComponent(search.trim()));
    }}>
      <label className="cs-search">
        <Icon name="search" size={21}/>
        <input aria-label="Buscar profissionais e especialidades" value={search} maxLength={80}
          onChange={e=>setSearch(e.target.value)} placeholder="Pedreiro, eletricista, diarista..."/>
      </label>
      <button className="cs-button cs-button-primary" type="submit">Buscar <Icon name="arrow" size={15}/></button>
    </form>

    <nav className="mf-quick-actions" aria-label="Navegação de pesquisa">
      <Link href={"/profissionais?q="+encodeURIComponent(search.trim())}>
        <Icon name="user" size={20}/><span>Encontrar profissionais</span>
      </Link>
      <Link href={"/oportunidades?q="+encodeURIComponent(search.trim())}>
        <Icon name="briefcase" size={20}/><span>Pedidos publicados</span>
      </Link>
    </nav>

    <section className="mf-discovery-banner">
      <div>
        <h2>Seu serviço, nas mãos certas.</h2>
        <p>Compare perfis e escolha com confiança.</p>
        <Link href="/profissionais" className="cs-button cs-button-orange">Explorar serviços <Icon name="arrow" size={16}/></Link>
      </div>
      <FeaturePhoto kind="builder"/>
    </section>

    <section>
      <div className="mf-heading-row">
        <h2>Explore por categoria</h2>
        <small>Deslize para ver mais <Icon name="arrow" size={12}/></small>
      </div>
      {loading&&<p className="cs-hint" role="status">Carregando categorias...</p>}
      {message&&<div role="alert" className="cs-error">{message}</div>}
      {!loading&&!message&&visibleCategories.length===0&&<div className="cs-empty">
        <Icon name="search" size={24}/>
        <h2>Nenhuma categoria encontrada</h2>
        <p>Experimente outra busca para encontrar o serviço certo.</p>
      </div>}
      <div className="mf-categories" aria-label="Categorias de serviços">
        {visibleCategories.map(c=><Link key={c.id} className="mf-category"
          href={"/profissionais?categoria="+encodeURIComponent(c.id)}
          title={"Buscar profissionais: "+c.name}>
          <span className="mf-category-icon"><Icon name={iconFor(c.name)} size={23}/></span>
          <span>{c.name}</span>
        </Link>)}
      </div>
    </section>

    <section>
      <div className="mf-heading-row">
        <h2>Profissionais em destaque</h2>
        <Link className="cs-small-link" href="/profissionais">Ver todos <Icon name="arrow" size={15}/></Link>
      </div>
      {visibleProviders.length>0?<div className="mf-home-list">
        {visibleProviders.map(p=><Link key={p.user_id} className="mf-highlight-professional cs-card"
          href={"/profissional/"+encodeURIComponent(p.user_id)}>
          <span className="cs-provider-face" aria-hidden="true"><Icon name="user" size={25}/></span>
          <span><strong>{p.display_name}</strong>
            <small>{[p.city,p.state].filter(Boolean).join(", ")||"Profissional cadastrado"}
              {p.is_verified?" · Perfil verificado":""}
              {p.review_count>0?" · ★ "+Number(p.average_rating).toFixed(1):""}</small>
          </span>
          <Icon name="chevron" size={19}/>
        </Link>)}
      </div>:!loading&&<div className="cs-empty">
        <Icon name="user" size={26}/>
        <h2>Em breve, novos profissionais</h2>
        <p>Enquanto isso, você pode procurar por especialidade ou publicar um pedido.</p>
        <Link className="cs-button cs-button-outline" href="/profissionais">Explorar profissionais</Link>
      </div>}
    </section>

    <section>
      <div className="mf-heading-row"><h2>Descubra mais</h2></div>
      <div className="mf-home-list">
        <Link className="cs-list-card cs-card" href="/servicos/cameras">
          <span className="cs-list-icon"><Icon name="camera" size={22}/></span>
          <span><h3>Instalação de câmeras</h3><p>Segurança residencial e comercial</p></span>
          <Icon name="chevron" size={18}/>
        </Link>
        {role==="client"&&<Link className="cs-list-card cs-card" href="/cliente">
          <span className="cs-list-icon"><Icon name="home" size={21}/></span>
          <span><h3>Minha área de cliente</h3><p>Meus pedidos, propostas e contratações</p></span>
          <Icon name="chevron" size={18}/>
        </Link>}
        {role==="provider"&&<Link className="cs-list-card cs-card" href="/prestador">
          <span className="cs-list-icon"><Icon name="briefcase" size={21}/></span>
          <span><h3>Minha área profissional</h3><p>Oportunidades e orçamentos enviados</p></span>
          <Icon name="chevron" size={18}/>
        </Link>}
        {role==="guest"&&<Link className="cs-list-card cs-card" href="/acesso">
          <span className="cs-list-icon"><Icon name="shield" size={21}/></span>
          <span><h3>Crie sua conta</h3><p>Publique pedidos ou ofereça seus serviços</p></span>
          <Icon name="chevron" size={18}/>
        </Link>}
      </div>
    </section>
  </AppFrame>;
}
