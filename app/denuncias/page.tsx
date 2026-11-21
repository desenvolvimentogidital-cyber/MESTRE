import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/server";

const labels:Record<string,string>={open:"Recebida",reviewing:"Em análise",resolved:"Resolvida",dismissed:"Encerrada"};
export default async function ReportsPage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/denuncias");
  const {data,rejected}=await (async()=>{
    const r=await db.from("reports").select("id,reason,details,status,created_at,resolved_at,resolution_note")
      .eq("reporter_id",user.id).order("created_at",{ascending:false}).limit(70);
    return {data:r.data,rejected:r.error};
  })();
  return <AppFrame active="perfil" title="Minhas denúncias">
    <h1 className="cs-top-title">Minhas denúncias</h1>
    <p className="cs-hint">Acompanhe os relatos que você enviou para análise.</p>
    {rejected&&<p className="cs-error" role="alert">Não foi possível carregar seus relatos.</p>}
    {!rejected&&(!data||data.length===0)&&<div className="cs-empty"><Icon name="shield" size={28}/><h2>Nenhuma denúncia registrada</h2>
      <p>Você pode denunciar um perfil, anúncio, avaliação ou comportamento inadequado pelo próprio conteúdo.</p>
      <Link href="/inicio" className="cs-button cs-button-outline">Explorar serviços</Link></div>}
    <div className="cs-info-list">{(data||[]).map(item=><article className="cs-card cs-proposal-card" key={item.id}>
      <div className="cs-proposal-top"><strong>{item.reason}</strong><span className={"cs-status "+(item.status==="resolved"?"accepted":"sent")}>{labels[item.status]||item.status}</span></div>
      {item.details&&<p className="cs-proposal-body">{item.details}</p>}
      <p className="cs-hint">Registrada em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short"}).format(new Date(item.created_at))}</p>
      {item.resolution_note&&<p className="cs-hint">Retorno da equipe: {item.resolution_note}</p>}
    </article>)}</div>
  </AppFrame>;
}
