import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame, Icon } from "@/components/conectaserv-ui";
import { OfferForm } from "@/components/offer-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProviderRequestPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/prestador");
  const {data:profile}=await db.from("profiles").select("account_type").eq("id",user.id).maybeSingle();
  if(!profile || !["provider","both"].includes(profile.account_type))redirect("/inicio");
  const {data:provider}=await db.from("provider_profiles").select("is_active").eq("user_id",user.id).maybeSingle();
  if(!provider?.is_active)redirect("/prestador/perfil");
  const {data:request,error}=await db.from("service_requests")
    .select("id,category_id,title,description,city,state,neighborhood,budget_min,budget_max,status,created_at,client_id")
    .eq("id",id).eq("status","published").maybeSingle();
  if(error||!request){
    return <AppFrame active="inicio" title="Detalhes do pedido"><div className="cs-empty"><Icon name="briefcase"/><h2>Pedido não disponível</h2><p>Ele pode ter sido encerrado, removido ou não estar mais público.</p><Link href="/prestador" className="cs-button cs-button-outline">Ver outros pedidos</Link></div></AppFrame>;
  }
  if(request.client_id===user.id)redirect("/cliente");
  const [{data:category},{data:existing}]=await Promise.all([
    db.from("service_categories").select("name").eq("id",request.category_id).maybeSingle(),
    db.from("proposals").select("id,status,amount,message,estimated_days").eq("request_id",id).eq("provider_id",user.id).maybeSingle(),
  ]);
  return <AppFrame active="inicio" title="Detalhes do pedido">
    <Link href="/prestador" className="cs-small-link">← Voltar às oportunidades</Link>
    <div className="cs-card" style={{padding:20,marginTop:16}}>
      <span className="cs-chip">{category?.name||"Serviço"}</span>
      <h1 className="cs-top-title" style={{marginTop:14}}>{request.title}</h1>
      <p className="cs-hint"><Icon name="location" size={15}/> {[request.neighborhood,request.city,request.state].filter(Boolean).join(", ")}</p>
      <h2 className="cs-section-title" style={{marginTop:22}}>O que o cliente precisa</h2>
      <p style={{whiteSpace:"pre-wrap",lineHeight:1.7,fontSize:14}}>{request.description}</p>
      <p className="cs-hint">Orçamento informado: {request.budget_min!==null || request.budget_max!==null
        ? [request.budget_min,request.budget_max].filter(v=>v!==null).map(v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v as number)).join(" a ")
        : "cliente não informou um valor"}</p>
    </div>
    <div className="cs-section-head"><h2 className="cs-section-title">Sua proposta</h2></div>
    {existing ? <div className="cs-card" style={{padding:20}}>
      <span className="cs-status sent">{existing.status==="sent"?"Enviada":existing.status==="accepted"?"Contratada":existing.status==="rejected"?"Recusada":"Retirada"}</span>
      <p style={{whiteSpace:"pre-wrap",fontSize:14,lineHeight:1.6}}>{existing.message}</p>
      <p className="cs-price">{existing.amount===null?"Valor a combinar":new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(existing.amount)}</p>
      <Link href="/propostas" className="cs-button cs-button-outline" style={{width:"100%"}}>Ver minhas propostas</Link>
    </div>:<OfferForm requestId={id}/>}
  </AppFrame>;
}
