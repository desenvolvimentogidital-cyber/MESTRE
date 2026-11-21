import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {ReportForm} from "@/components/report-form";
import {createClient} from "@/lib/supabase/server";

const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function NewReportPage({searchParams}:{searchParams:Promise<{userId?:string;requestId?:string;reviewId?:string}>}){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/denuncias");
  const query=await searchParams;
  const userId=query.userId&&uuid.test(query.userId)?query.userId:null;
  const requestId=query.requestId&&uuid.test(query.requestId)?query.requestId:null;
  const reviewId=query.reviewId&&uuid.test(query.reviewId)?query.reviewId:null;
  return <AppFrame active="perfil" title="Denunciar conteúdo">
    <Link href="/denuncias" className="cs-small-link">← Minhas denúncias</Link>
    <h1 className="cs-top-title" style={{marginTop:18}}>Enviar denúncia</h1>
    <p className="cs-hint">Ajude a manter o ConectaServ seguro. Nossa equipe analisará seu relato.</p>
    {userId||requestId||reviewId?<ReportForm userId={userId} requestId={requestId} reviewId={reviewId}/>:
      <div className="cs-empty"><Icon name="shield" size={30}/><h2>Selecione um conteúdo</h2>
        <p>Para denunciar um pedido, profissional, avaliação ou conversa, use a opção Denunciar no conteúdo correspondente.</p>
        <Link href="/inicio" className="cs-button cs-button-outline">Voltar aos serviços</Link>
      </div>}
  </AppFrame>;
}
