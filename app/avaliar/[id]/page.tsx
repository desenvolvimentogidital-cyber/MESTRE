import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {ReviewForm} from "@/components/review-form";
import {createClient} from "@/lib/supabase/server";

export default async function ReviewServicePage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/cliente");
  const {data:request}=await db.from("service_requests")
    .select("id,title,client_id,status").eq("id",id).eq("client_id",user.id).maybeSingle();
  if(!request||request.status!=="completed")return <AppFrame active="inicio" title="Avaliação">
    <div className="cs-empty"><Icon name="star" size={27}/><h2>Avaliação indisponível</h2>
      <p>Você só pode avaliar um serviço que contratou e concluiu.</p>
      <Link href="/cliente" className="cs-button cs-button-outline">Voltar aos pedidos</Link></div>
  </AppFrame>;
  const [{data:accepted},{data:existing}]=await Promise.all([
    db.from("proposals").select("provider_id").eq("request_id",id).eq("status","accepted").maybeSingle(),
    db.from("reviews").select("id,rating,comment").eq("request_id",id).maybeSingle(),
  ]);
  if(!accepted)return <AppFrame active="inicio" title="Avaliação"><p className="cs-error">Não foi possível localizar o profissional contratado.</p></AppFrame>;
  const {data:provider}=await db.from("provider_profiles")
    .select("display_name").eq("user_id",accepted.provider_id).maybeSingle();
  return <AppFrame active="inicio" title="Avaliar serviço">
    <Link href="/cliente" className="cs-small-link">← Meus pedidos</Link>
    <h1 className="cs-top-title" style={{marginTop:18}}>Avalie seu profissional</h1>
    <p className="cs-hint">Pedido: {request.title}</p>
    <div className="cs-card" style={{padding:18,marginTop:18}}>
      <strong>{provider?.display_name||"Profissional contratado"}</strong>
      <p className="cs-hint">Sua avaliação ajuda outros clientes a encontrar profissionais.</p>
    </div>
    {existing?<div className="cs-empty"><Icon name="check" size={28}/><h2>Você já avaliou este serviço</h2>
      <p>Obrigado! Sua nota foi de {existing.rating} de 5 estrelas.</p>
      <Link href="/cliente" className="cs-button cs-button-outline">Voltar aos pedidos</Link></div>
      :<ReviewForm requestId={id} providerId={accepted.provider_id}/>}
  </AppFrame>;
}
