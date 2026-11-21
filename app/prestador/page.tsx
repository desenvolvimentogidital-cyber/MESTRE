import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame, Icon } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/server";

type Opportunity = {id:string; category_id:string; title:string; description:string; city:string; state:string; budget_min:number|null; budget_max:number|null; created_at:string};
type OwnOffer = {request_id:string;status:string};
const price=(value:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(value);

export default async function ProviderPage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user) redirect("/acesso?redirectTo=/prestador");
  const {data:profile}=await db.from("profiles").select("account_type,full_name").eq("id",user.id).maybeSingle();
  if(!profile || !["provider","both"].includes(profile.account_type)) {
    return <AppFrame active="inicio" title="Área do profissional">
      <div className="cs-empty"><Icon name="shield" size={33}/><h2>Área de profissionais</h2>
        <p>Esta conta está cadastrada como cliente. Para oferecer serviços, cadastre uma conta profissional.</p>
        <Link href="/inicio" className="cs-button cs-button-outline">Voltar aos serviços</Link>
      </div></AppFrame>;
  }
  const {data:provider,error:providerError}=await db.from("provider_profiles")
    .select("display_name,city,state,is_active").eq("user_id",user.id).maybeSingle();
  if(providerError || !provider){
    return <AppFrame active="inicio" title="Área do profissional"><div className="cs-error">Não foi possível localizar seu perfil profissional. Entre em contato com o suporte antes de enviar propostas.</div></AppFrame>;
  }
  const [offersResult,requestsResult,serviceAreasResult]=await Promise.all([
    db.from("proposals").select("request_id,status").eq("provider_id",user.id),
    provider.is_active
      ? db.from("service_requests").select("id,category_id,title,description,city,state,budget_min,budget_max,created_at").eq("status","published").order("created_at",{ascending:false}).limit(50)
      : Promise.resolve({data:[],error:null}),
    db.from("provider_categories").select("category_id").eq("provider_id",user.id),
  ]);
  const selectedAreas=new Set((serviceAreasResult.data||[]).map(area=>area.category_id));
  const requests=((requestsResult.data||[]) as Opportunity[]).filter(item=>selectedAreas.size===0 || selectedAreas.has(item.category_id));
  const offers=(offersResult.data || []) as OwnOffer[];
  const offered=new Map(offers.map(offer=>[offer.request_id,offer.status]));
  const ids=[...new Set(requests.map(r=>r.category_id))];
  const names:Record<string,string>={};
  if(ids.length){
    const {data:categories}=await db.from("service_categories").select("id,name").in("id",ids);
    for(const category of categories || [])names[category.id]=category.name;
  }
  return <AppFrame active="inicio" title="Área do profissional">
    <span className="cs-eyebrow">Bem-vindo ao ConectaServ</span>
    <h1 className="cs-top-title" style={{marginTop:8}}>Olá, {provider.display_name.split(" ")[0]}! 👋</h1>
    <p className="cs-hint">Encontre oportunidades e envie propostas para clientes que precisam do seu serviço.</p>
    <div className="cs-card" style={{padding:18,marginTop:20}}>
      <div className="cs-proposal-top">
        <div><strong style={{display:"block",fontSize:16}}>Meu perfil profissional</strong>
          <p className="cs-hint" style={{margin:"6px 0 0"}}>{[provider.city,provider.state].filter(Boolean).join(", ") || "Complete sua região de atendimento"}</p>
        </div>
        <span className={"cs-status "+(provider.is_active?"accepted":"cancelled")}>{provider.is_active?"Ativo":"Pausado"}</span>
      </div>
      <Link className="cs-button cs-button-outline" style={{marginTop:14,width:"100%"}} href="/prestador/perfil">Editar meu perfil <Icon name="chevron" size={17}/></Link>
    </div>
    <div className="cs-section-head"><h2 className="cs-section-title">Pedidos disponíveis</h2><Link href="/propostas" className="cs-small-link">Minhas propostas <Icon name="arrow" size={16}/></Link></div>
    {!provider.is_active && <div className="cs-empty"><Icon name="briefcase"/><h2>Perfil pausado</h2><p>Ative seu perfil para visualizar oportunidades e participar dos orçamentos.</p><Link href="/prestador/perfil" className="cs-button cs-button-primary">Ativar meu perfil</Link></div>}
    {provider.is_active && requestsResult.error && <div role="alert" className="cs-error">Não foi possível carregar os pedidos no momento.</div>}
    {provider.is_active && offersResult.error && <div role="alert" className="cs-error">Não foi possível verificar as propostas que você já enviou. Tente novamente.</div>}
    {provider.is_active && !requestsResult.error && requests.length===0 && <div className="cs-empty"><Icon name="search" size={29}/><h2>Sem pedidos publicados</h2><p>Novas oportunidades aparecerão aqui quando clientes publicarem serviços.</p></div>}
    {provider.is_active && !requestsResult.error && !offersResult.error && <div className="cs-info-list">
      {requests.map(request=><article className="cs-card cs-proposal-card" key={request.id}>
        <div className="cs-proposal-top">
          <span className="cs-chip">{names[request.category_id]||"Serviço"}</span>
          {offered.has(request.id)&&<span className="cs-status sent">Proposta enviada</span>}
        </div>
        <h3>{request.title}</h3>
        <p className="cs-proposal-body">{request.description.length>180?request.description.slice(0,180)+"…":request.description}</p>
        <div className="cs-proposal-bottom">
          <span className="cs-hint"><Icon name="location" size={13}/> {request.city}, {request.state}</span>
          <span className="cs-hint">{request.budget_max!==null?"Até "+price(request.budget_max):"Valor a combinar"}</span>
        </div>
        <Link href={"/prestador/pedido/"+encodeURIComponent(request.id)} className="cs-button cs-button-primary" style={{width:"100%"}}>{offered.has(request.id)?"Ver minha proposta":"Ver pedido e enviar proposta"} <Icon name="arrow" size={16}/></Link>
      </article>)}
    </div>}
  </AppFrame>;
}
