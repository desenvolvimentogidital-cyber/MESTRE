"use client";

import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AppFrame,FeaturePhoto,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Category={id:string;name:string;slug:string};
type Professional={
  user_id:string;display_name:string;bio:string|null;city:string|null;state:string|null;
  is_verified:boolean;average_rating:number|null;review_count:number|null;
  years_experience:number|null;specialties:string[]|null;
};
type AccountType="guest"|"client"|"provider";
type CategoryIcon="home"|"hammer"|"bolt"|"drop"|"wind"|"wrench"|"scissors"|"truck"|"leaf"|"sparkle"|"camera"|"layers";

function categoryIcon(category:Category):CategoryIcon{
  const text=(category.name+" "+category.slug).toLocaleLowerCase("pt-BR");
  if(text.includes("constru")||text.includes("reforma"))return "home";
  if(text.includes("elétr")||text.includes("eletric"))return "bolt";
  if(text.includes("hidr")||text.includes("encan"))return "drop";
  if(text.includes("ar-cond")||text.includes("climat"))return "wind";
  if(text.includes("móve")||text.includes("montage"))return "wrench";
  if(text.includes("beleza")||text.includes("estética"))return "scissors";
  if(text.includes("frete")||text.includes("mudança"))return "truck";
  if(text.includes("jardin"))return "leaf";
  if(text.includes("limp"))return "sparkle";
  if(text.includes("câmer")||text.includes("tecnol")||text.includes("seguran"))return "camera";
  return "hammer";
}
function firstName(value:string){return value.trim().split(/\s+/)[0]||"Profissional";}

export default function ExplorePage(){
  const router=useRouter();
  const [query,setQuery]=useState("");
  const [city,setCity]=useState("");
  const [chosenCity,setChosenCity]=useState("");
  const [categories,setCategories]=useState<Category[]>([]);
  const [professionals,setProfessionals]=useState<Professional[]>([]);
  const [role,setRole]=useState<AccountType>("guest");
  const [displayName,setDisplayName]=useState("");
  const [loading,setLoading]=useState(true);
  const [loadingPros,setLoadingPros]=useState(true);
  const [error,setError]=useState("");
  const [proError,setProError]=useState("");

  useEffect(()=>{
    let active=true;
    try{
      const saved=window.localStorage.getItem("mandafazer-city")||"";
      if(saved&&active){setCity(saved.slice(0,80));setChosenCity(saved.slice(0,80));}
    }catch{}
    const db=createClient();
    async function fetchHome(){
      try{
        const [cats,userResult]=await Promise.all([
          db.from("service_categories").select("id,name,slug").eq("is_active",true).order("name"),
          db.auth.getUser(),
        ]);
        if(!active)return;
        if(cats.error)throw cats.error;
        setCategories((cats.data||[]) as Category[]);
        if(userResult.data.user){
          const {data:profile}=await db.from("profiles").select("account_type,full_name").eq("id",userResult.data.user.id).maybeSingle();
          if(!active)return;
          if(profile?.account_type==="provider"||profile?.account_type==="client"){
            setRole(profile.account_type);
            setDisplayName(typeof profile.full_name==="string"?firstName(profile.full_name):"");
          }
        }
      }catch{
        if(active)setError("Não foi possível carregar as categorias. Verifique sua conexão.");
      }finally{if(active)setLoading(false);}
    }
    void fetchHome();
    return()=>{active=false;};
  },[]);

  useEffect(()=>{
    let active=true;
    async function fetchProfessionals(){
      setLoadingPros(true);setProError("");
      try{
        const db=createClient();
        const {data,error:requestError}=await db.rpc("search_professional_profiles",{
          p_query:"",p_category_id:null,p_city:chosenCity,p_limit:12,p_offset:0,
        });
        if(requestError)throw requestError;
        if(active)setProfessionals((data||[]) as Professional[]);
      }catch{
        if(active)setProError("Não foi possível carregar os perfis no momento.");
      }finally{if(active)setLoadingPros(false);}
    }
    void fetchProfessionals();
    return()=>{active=false;};
  },[chosenCity]);

  const topCategories=useMemo(()=>{
    const priority=["reformas-construcao","eletrica","hidraulica","ar-condicionado","pintura","tecnologia-cameras"];
    return [...categories].sort((a,b)=>{
      const ai=priority.findIndex(k=>a.slug.includes(k)),bi=priority.findIndex(k=>b.slug.includes(k));
      return (ai<0?100:ai)-(bi<0?100:bi)||a.name.localeCompare(b.name,"pt-BR");
    });
  },[categories]);

  const cityFilter=chosenCity?"&cidade="+encodeURIComponent(chosenCity):"";
  const requestLink=role==="provider"?"/oportunidades":role==="client"?"/cliente/novo":"/acesso?tipo=cliente&redirectTo=%2Fcliente%2Fnovo";
  function search(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const destination="/profissionais?q="+encodeURIComponent(query.trim().slice(0,80))+
      (city.trim()?"&cidade="+encodeURIComponent(city.trim().slice(0,80)):"");
    const normalized=city.trim().slice(0,80);
    setChosenCity(normalized);
    try{window.localStorage.setItem("mandafazer-city",normalized);}catch{}
    router.push(destination);
  }
  function applyCity(){
    const normalized=city.trim().slice(0,80);
    setChosenCity(normalized);
    try{window.localStorage.setItem("mandafazer-city",normalized);}catch{}
  }

  return <AppFrame active="inicio" title="Encontre serviços no MandaFazer">
    <div className="mf-v1-home">
      <section className="mf-v1-hero" aria-labelledby="mf-v1-title">
        <div className="mf-v1-hero-photo"><FeaturePhoto kind="builder"/></div>
        <div className="mf-v1-hero-shade"/>
        <div className="mf-v1-hero-copy">
          <span className="mf-v1-kicker">Conecta · Contrata · Resolve</span>
          <h1 id="mf-v1-title">Encontre o <span>profissional ideal</span> <em>perto de você!</em></h1>
          <p>Serviços de qualidade, com praticidade e confiança para sua região.</p>
        </div>
        <span className="mf-v1-hero-ring" aria-hidden="true"/>
      </section>

      <form className="mf-v1-search-panel" role="search" onSubmit={search}>
        <div className="mf-v1-search-line">
          <Icon name="search" size={22}/>
          <input aria-label="Qual serviço você precisa?" value={query} onChange={e=>setQuery(e.target.value)}
            maxLength={80} placeholder="Qual serviço você precisa?"/>
          <button className="mf-v1-search-go" type="submit" aria-label="Buscar profissionais"><Icon name="search" size={23}/></button>
        </div>
        <div className="mf-v1-location-line">
          <Icon name="location" size={23}/>
          <label htmlFor="mf-v1-city"><small>Sua localização</small>
            <input id="mf-v1-city" aria-label="Cidade para buscar profissionais" placeholder="Digite sua cidade"
              maxLength={80} value={city} onChange={e=>setCity(e.target.value)}/>
          </label>
          <button type="button" onClick={applyCity} title="Aplicar cidade ao destaque"
            aria-label="Filtrar profissionais desta página por cidade" className="mf-v1-location-apply">
            <Icon name="arrow" size={19}/>
          </button>
        </div>
      </form>

      <section className="mf-v1-benefits" aria-label="Vantagens do MandaFazer">
        <div><Icon name="shield" size={24}/><span>Perfis com<br/>verificação</span></div>
        <div><Icon name="star" size={24}/><span>Avaliações<br/>de clientes</span></div>
        <div><Icon name="bolt" size={24}/><span>Orçamentos<br/>pelo aplicativo</span></div>
        <div><Icon name="lock" size={24}/><span>Conversas<br/>privadas</span></div>
      </section>

      <section className="mf-v1-section" aria-labelledby="mf-v1-categories">
        <div className="mf-v1-section-heading">
          <h2 id="mf-v1-categories">Categorias de Serviços</h2>
          <Link href="/profissionais" className="mf-v1-view-all">Ver todas <Icon name="arrow" size={18}/></Link>
        </div>
        {loading&&<p role="status" className="cs-hint">Carregando categorias...</p>}
        {error&&<p className="cs-error" role="alert">{error}</p>}
        <div className="mf-v1-category-scroll">
          {topCategories.map((cat,index)=><Link
            key={cat.id} className={"mf-v1-category"+(index===0?" is-featured":"")}
            href={"/profissionais?categoria="+encodeURIComponent(cat.id)+(chosenCity?"&cidade="+encodeURIComponent(chosenCity):"")}>
            <Icon name={categoryIcon(cat)} size={30}/>
            <span>{cat.name}</span>
          </Link>)}
        </div>
      </section>

      <section className="mf-v1-section" aria-labelledby="mf-v1-nearby">
        <div className="mf-v1-nearby" role="group" aria-label="Busca de profissionais por região">
          <div className="mf-v1-map-art" aria-hidden="true">
            <span className="mf-v1-map-road one"/><span className="mf-v1-map-road two"/>
            <span className="mf-v1-map-road three"/><span className="mf-v1-map-road four"/>
            <span className="mf-v1-map-pin pin-one"><Icon name="location" size={21}/></span>
            <span className="mf-v1-map-pin pin-two"><Icon name="location" size={21}/></span>
            <span className="mf-v1-map-pin pin-three"><Icon name="location" size={21}/></span>
          </div>
          <div className="mf-v1-nearby-content">
            <span className="mf-v1-location-symbol"><Icon name="location" size={21}/></span>
            <div>
              <h2 id="mf-v1-nearby">Profissionais na sua região</h2>
              <p>{chosenCity?chosenCity:"Escolha sua cidade"}</p>
              <span>{loadingPros?"Buscando...":proError?"Busca indisponível":professionals.length+" perfil(is) exibido(s)"}</span>
            </div>
          </div>
          <Link href={"/profissionais?cidade="+encodeURIComponent(chosenCity)}
            className="mf-v1-map-action">Explorar região <Icon name="arrow" size={16}/></Link>
        </div>
        <p className="mf-v1-map-caption">Mapa ilustrativo. Não mostra a localização exata dos profissionais.</p>
      </section>

      <section className="mf-v1-section" aria-labelledby="mf-v1-featured">
        <div className="mf-v1-section-heading">
          <h2 id="mf-v1-featured">Profissionais em destaque</h2>
          <Link className="mf-v1-view-all" href={"/profissionais?cidade="+encodeURIComponent(chosenCity)}>Ver todos <Icon name="arrow" size={18}/></Link>
        </div>
        {loadingPros&&<p className="cs-hint" role="status">Carregando perfis...</p>}
        {proError&&<p role="alert" className="cs-error">{proError}</p>}
        {!loadingPros&&!proError&&professionals.length===0&&<div className="cs-empty">
          <Icon name="user" size={27}/>
          <h3>Ainda não encontramos profissionais{chosenCity?" nessa cidade":""}.</h3>
          <p>Confira outras regiões ou procure por uma especialidade.</p>
          <Link href="/profissionais" className="cs-button cs-button-outline">Encontrar profissionais</Link>
        </div>}
        <div className="mf-v1-pro-grid">
          {professionals.slice(0,4).map(pro=><Link href={"/profissional/"+encodeURIComponent(pro.user_id)}
            key={pro.user_id} className="mf-v1-pro-card">
            <span className="mf-v1-pro-avatar" aria-hidden="true"><Icon name="user" size={26}/></span>
            <span className="mf-v1-pro-data">
              <strong>{pro.display_name}</strong>
              <small>{pro.specialties?.slice(0,2).join(" · ")||[pro.city,pro.state].filter(Boolean).join(", ")||"Profissional cadastrado"}</small>
              <span className="mf-v1-pro-rating">
                {Number(pro.review_count)>0?<><Icon name="star" size={14}/> {Number(pro.average_rating).toFixed(1)} ({pro.review_count} avaliações)</>:
                  "Sem avaliações ainda"}
              </span>
            </span>
            {pro.is_verified?<span className="mf-v1-verified" title="Perfil verificado" aria-label="Perfil verificado"><Icon name="check" size={17}/></span>:
              <Icon name="chevron" size={17}/>}
          </Link>)}
        </div>
      </section>

      <Link href={requestLink} className="mf-v1-primary-cta">
        <Icon name={role==="provider"?"briefcase":"layers"} size={27}/>
        {role==="provider"?"Ver Pedidos de Serviço":"Publicar Pedido de Serviço"}
        <Icon name="arrow" size={23}/>
      </Link>
      {role==="client"&&<Link className="mf-v1-secondary-cta" href="/cliente">Acompanhar meus pedidos <Icon name="arrow" size={17}/></Link>}
      {role==="provider"&&<Link className="mf-v1-secondary-cta" href="/prestador">Abrir meu painel profissional <Icon name="arrow" size={17}/></Link>}
      {role==="guest"&&<Link className="mf-v1-secondary-cta" href="/acesso">Já tenho conta — Entrar <Icon name="arrow" size={17}/></Link>}
    </div>
  </AppFrame>;
}
