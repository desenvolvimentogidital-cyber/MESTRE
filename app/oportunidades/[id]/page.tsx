import Link from "next/link";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/server";

type Job={
 id:string;category_name:string;title:string;summary:string;city:string;
 state:string;budget_max:number|null;created_at:string;
};
export default async function PublicJobPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const db=await createClient();
  const valid=/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id);
  let job:Job|undefined;
  if(valid){
    const {data}=await db.rpc("search_service_listings",{
      p_query:"",p_category_id:null,p_city:"",p_limit:1,p_offset:0,p_request_id:id,
    });
    job=(data||[])[0] as Job|undefined;
  }
  if(!job)return <AppFrame active="inicio" title="Pedido de serviço">
    <div className="cs-empty"><Icon name="briefcase" size={28}/><h2>Pedido indisponível</h2>
      <p>O anúncio pode ter sido encerrado ou removido.</p>
      <Link href="/oportunidades" className="cs-button cs-button-outline">Ver outros pedidos</Link>
    </div></AppFrame>;

  const {data:{user}}=await db.auth.getUser();
  let role:string|null=null;
  if(user){
    const {data:profile}=await db.from("profiles").select("account_type").eq("id",user.id).maybeSingle();
    role=profile?.account_type||null;
  }
  const responsePath="/prestador/pedido/"+encodeURIComponent(job.id);
  const loginPath="/acesso?tipo=prestador&acessar=1&redirectTo="+encodeURIComponent(responsePath);
  const canOffer=role==="provider"||role==="both";
  const money=(value:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
  return <AppFrame active="inicio" title="Detalhes do pedido">
    <Link href="/oportunidades" className="cs-small-link">← Voltar aos pedidos</Link>
    <article className="cs-card cs-public-card" style={{marginTop:18}}>
      <span className="cs-chip">{job.category_name}</span>
      <h1 className="cs-top-title" style={{marginTop:14}}>{job.title}</h1>
      <p className="cs-hint"><Icon name="location" size={15}/> {job.city}, {job.state}</p>
      <p className="cs-hint">Publicado em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"long"}).format(new Date(job.created_at))}</p>
      <div className="cs-section-head"><h2 className="cs-section-title">O que o cliente precisa</h2></div>
      <p className="cs-proposal-body" style={{whiteSpace:"pre-wrap",lineHeight:1.75}}>{job.summary}</p>
      <strong className="cs-price">{job.budget_max===null?"Valor a combinar":"Até "+money(job.budget_max)}</strong>
      <p className="cs-hint">Por segurança, dados pessoais de contato não ficam disponíveis nesta página pública.</p>
      {(canOffer||!user)&&<Link className="cs-button cs-button-orange" style={{width:"100%"}}
        href={canOffer?responsePath:loginPath}>
        <Icon name="mail" size={17}/> {canOffer?"Ver detalhes e enviar orçamento":"Entrar para enviar proposta"}
      </Link>}
      {!user&&<p className="cs-hint">Não tem cadastro? Na tela de acesso, toque em <strong>Cadastre-se</strong> e escolha profissional.</p>}
      {user&&!canOffer&&<p className="cs-hint">Para responder pedidos é necessário ter uma conta profissional.</p>}
    </article>
  </AppFrame>;
}
