"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Category={id:string;name:string};
type Filter={query:string;category:string;city:string};
type Pro={user_id:string;display_name:string;bio:string|null;city:string|null;state:string|null;years_experience:number|null;is_verified:boolean;average_rating:number;review_count:number;specialties:string[]};
type Job={id:string;category_id:string;category_name:string;title:string;summary:string;city:string;state:string;budget_max:number|null;created_at:string};
const price=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(n);

export function PublicMarketplaceSearch({mode,initialQuery="",initialCategory="",initialCity=""}:{mode:"professionals"|"jobs";initialQuery?:string;initialCategory?:string;initialCity?:string;}){
  const initial={query:initialQuery.slice(0,80),category:initialCategory,city:initialCity.slice(0,80)};
  const [draft,setDraft]=useState<Filter>(initial);
  const [filter,setFilter]=useState<Filter>(initial);
  const [showFilters,setShowFilters]=useState(Boolean(initialQuery)&&!initialCategory);
  const [categories,setCategories]=useState<Category[]>([]);
  const [pros,setPros]=useState<Pro[]>([]);
  const [jobs,setJobs]=useState<Job[]>([]);
  const [page,setPage]=useState(0);
  const [more,setMore]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const proMode=mode==="professionals";
  const category=categories.find(item=>item.id===filter.category);
  const categoryView=proMode&&Boolean(filter.category);

  useEffect(()=>{
    // Next can keep this component mounted when only URL filters change.
    const next={query:initialQuery.slice(0,80),category:initialCategory,city:initialCity.slice(0,80)};
    setDraft(next);setFilter(next);setPage(0);
    setShowFilters(Boolean(initialQuery)&&!initialCategory);
  },[initialQuery,initialCategory,initialCity]);
  useEffect(()=>{
    let active=true;
    const db=createClient();
    void db.from("service_categories").select("id,name").eq("is_active",true).order("name")
      .then(({data})=>{if(active)setCategories((data||[]) as Category[]);});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    let active=true;
    async function load(){
      setLoading(true);setError("");
      if(page===0){if(proMode)setPros([]);else setJobs([]);}
      try{
        const db=createClient();
        // Category browsing must show ALL providers in that category, not match name or previous city.
        const params={p_query:categoryView?"":filter.query,p_category_id:filter.category||null,p_city:categoryView?"":filter.city,p_limit:20,p_offset:page*20};
        if(proMode){
          const {data,error:searchError}=await db.rpc("search_professional_profiles",params);
          if(searchError)throw searchError;
          if(!active)return;
          const rows=(data||[]) as Pro[];
          setPros(previous=>page===0?rows:previous.concat(rows));
          setMore(rows.length===20);
        }else{
          const {data,error:searchError}=await db.rpc("search_service_listings",{...params,p_request_id:null});
          if(searchError)throw searchError;
          if(!active)return;
          const rows=(data||[]) as Job[];
          setJobs(previous=>page===0?rows:previous.concat(rows));
          setMore(rows.length===20);
        }
      }catch{
        if(active)setError("Não foi possível carregar os resultados. Verifique a internet e tente novamente.");
      }finally{if(active)setLoading(false);}
    }
    void load();
    return()=>{active=false;};
  },[proMode,categoryView,filter,page]);
  function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setPage(0);
    setFilter({query:draft.query.trim().slice(0,80),category:draft.category,city:draft.city.trim().slice(0,80)});
  }
  function chooseCategory(id:string){
    const next={query:"",category:id,city:""};
    setDraft(next);setFilter(next);setPage(0);setShowFilters(false);
  }
  function clear(){const empty={query:"",category:"",city:""};setDraft(empty);setPage(0);setFilter(empty);setShowFilters(false);}
  function changeCategory(id:string){
    const next={...draft,category:id,query:"",city:id?"":draft.city};
    setDraft(next);setFilter(next);setPage(0);
    if(proMode&&id)setShowFilters(false);
  }
  const count=proMode?pros.length:jobs.length;
  const crossParams=new URLSearchParams();
  if(filter.category)crossParams.set("categoria",filter.category);
  if(filter.city)crossParams.set("cidade",filter.city);
  if(filter.query)crossParams.set("q",filter.query);
  const other=(proMode?"/oportunidades":"/profissionais")+(crossParams.size?"?"+crossParams.toString():"");
  return <AppFrame active="inicio" title={proMode?"Buscar profissionais":"Pedidos de serviço"}>
    {proMode&&<section className="mf-service-discovery" aria-label="Buscar profissionais por categoria">
      {categoryView?<div className="mf-service-selected">
        <Link href="/profissionais" className="cs-small-link">← Escolher outra categoria</Link>
        <span className="cs-eyebrow">Categoria selecionada</span>
        <h1>{category?category.name:"Profissionais da categoria"}</h1>
        <p>Profissionais que trabalham com {category?category.name.toLocaleLowerCase("pt-BR"):"esta especialidade"}. Confira os perfis e converse diretamente com quem você escolher.</p>
      </div>:<>
        <h2>Qual profissional você procura?</h2>
        <p>Toque em uma área para ver diretamente todos os profissionais cadastrados nela, sem digitar nomes.</p>
        <div className="mf-service-category-grid">
          {categories.map(cat=><button type="button" key={cat.id} onClick={()=>chooseCategory(cat.id)}>
            <Icon name="layers" size={18}/><span>{cat.name}</span><Icon name="chevron" size={16}/>
          </button>)}
        </div>
      </>}
      {!categoryView&&<button type="button" className="mf-service-filter-toggle"
        aria-expanded={showFilters} aria-controls="mf-service-advanced-filters"
        onClick={()=>setShowFilters(open=>!open)}>
        <Icon name="search" size={16}/> {showFilters?"Ocultar pesquisa":"Pesquisar por nome ou cidade (opcional)"}
      </button>}
    </section>}
    {(!proMode||(!categoryView&&showFilters))&&<div id="mf-service-advanced-filters">
    {!proMode&&<><span className="cs-eyebrow">Pesquisa aberta, sem cadastro</span>
    <h1 className="cs-top-title" style={{marginTop:9}}>Veja quem precisa de um serviço</h1>
    <p className="cs-hint">Explore pedidos de clientes sem login. Para enviar um orçamento, entre ou crie sua conta.</p></>}
    <form className="cs-public-search" onSubmit={submit}>
      {proMode&&<p className="cs-hint">Busca opcional: as categorias já mostram os resultados sem digitar um nome.</p>}
      <label className="cs-search"><Icon name="search" size={19}/>
        <input aria-label="O que você procura?" maxLength={80}
          placeholder={proMode?"Ex.: pedreiro":"Ex.: pintura, reforma, instalação"}
          value={draft.query} onChange={e=>setDraft(d=>({...d,query:e.target.value}))}/>
      </label>
      <div className="cs-public-filters">
        <label className="cs-form-label">Categoria<select value={draft.category} onChange={e=>changeCategory(e.target.value)}>
          <option value="">Todas as categorias</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select></label>
        <label className="cs-form-label">Cidade<input maxLength={80} placeholder="Ex.: São Paulo"
          value={draft.city} onChange={e=>setDraft(d=>({...d,city:e.target.value}))}/></label>
      </div>
      <div className="cs-public-actions">
        <button type="submit" className="cs-button cs-button-primary"><Icon name="search" size={16}/> Buscar</button>
        <button type="button" className="cs-button cs-button-outline" onClick={clear}>Limpar filtros</button>
      </div>
    </form>
    </div>}
    <div className="cs-public-switch"><strong>{proMode?"Procurando pedidos para atender?":"Procurando um profissional?"}</strong>
      <Link href={other} className="cs-small-link">{proMode?"Ver pedidos de clientes":"Ver profissionais"} <Icon name="arrow" size={15}/></Link>
    </div>
    <div className="cs-section-head" id="mf-service-results">
      <h2 className="cs-section-title">{proMode?(category?"Profissionais de "+category.name:"Profissionais disponíveis"):"Pedidos publicados"}</h2>
      <span className="cs-hint">{count} exibido(s)</span>
    </div>
    {error&&<p role="alert" className="cs-error">{error}</p>}
    {!loading&&!error&&count===0&&<div className="cs-empty"><Icon name={proMode?"user":"briefcase"} size={29}/>
      <h2>{categoryView?("Ainda não há profissionais cadastrados em "+(category?.name||"esta categoria")):"Nenhum resultado encontrado"}</h2>
      <p>{categoryView?"Nenhum profissional informou esta especialidade no perfil ainda. Assim que profissionais dessa área se cadastrarem, aparecerão aqui automaticamente.":filter.query||filter.city?"Tente outra categoria ou cidade.":"Os novos cadastros e pedidos aparecerão aqui."}</p>
    </div>}
    <div className="cs-info-list">
      {proMode&&pros.map(p=><article className="cs-card cs-public-card" key={p.user_id}>
        <div className="cs-public-head"><div className="cs-provider-face" aria-hidden="true">👷</div>
          <div><h3>{p.display_name}</h3><p className="cs-hint"><Icon name="location" size={13}/> {[p.city,p.state].filter(Boolean).join(", ")||"Região a combinar"}</p>
            {p.is_verified&&<span className="cs-chip"><Icon name="shield" size={13}/> Perfil conferido</span>}
          </div>
        </div>
        {p.specialties.length>0&&<div className="cs-public-tags">{p.specialties.map(s=><span className="cs-chip" key={s}>{s}</span>)}</div>}
        {p.bio&&<p className="cs-proposal-body">{p.bio}</p>}
        <p className="cs-hint">{p.review_count>0?"⭐ "+Number(p.average_rating).toFixed(1)+" · "+p.review_count+" avaliações":"Ainda sem avaliações"}{p.years_experience!==null?" · "+p.years_experience+" anos de experiência":""}</p>
        <div className="cs-public-actions">
          <Link href={"/profissional/"+encodeURIComponent(p.user_id)} className="cs-button cs-button-outline">Ver perfil</Link>
          <Link href={"/profissional/"+encodeURIComponent(p.user_id)+"?iniciar=1"} className="cs-button cs-button-orange"><Icon name="mail" size={16}/> Conversar</Link>
        </div>
      </article>)}
      {!proMode&&jobs.map(job=><article className="cs-card cs-public-card" key={job.id}>
        <div className="cs-proposal-top"><span className="cs-chip">{job.category_name}</span><span className="cs-hint">{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short"}).format(new Date(job.created_at))}</span></div>
        <h3>{job.title}</h3><p className="cs-proposal-body">{job.summary}</p>
        <div className="cs-proposal-bottom"><span className="cs-hint"><Icon name="location" size={13}/> {job.city}, {job.state}</span><span className="cs-hint">{job.budget_max===null?"Valor a combinar":"Até "+price(job.budget_max)}</span></div>
        <Link className="cs-button cs-button-primary" style={{width:"100%"}} href={"/oportunidades/"+encodeURIComponent(job.id)}>Ver pedido <Icon name="arrow" size={16}/></Link>
      </article>)}
    </div>
    {more&&!error&&<button className="cs-button cs-button-outline" style={{width:"100%",marginTop:17}} disabled={loading} onClick={()=>setPage(p=>p+1)}>{loading?"Carregando...":"Carregar mais resultados"}</button>}
    {loading&&<p className="cs-hint" role="status" style={{textAlign:"center",marginTop:17}}>Buscando resultados...</p>}
    <p className="cs-hint cs-public-tip">Cadastro necessário somente ao conversar, publicar ou enviar uma proposta.</p>
  </AppFrame>;
}
