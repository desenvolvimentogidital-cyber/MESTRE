import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/server";

type Chat={id:string;request_id:string|null;client_id:string;provider_id:string;created_at:string};
export default async function ConversationsPage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/conversas");
  const {data,error}=await db.from("conversations")
    .select("id,request_id,client_id,provider_id,created_at")
    .or("client_id.eq."+user.id+",provider_id.eq."+user.id)
    .order("created_at",{ascending:false});
  const chats=(data||[]) as Chat[];
  const titles:Record<string,string>={};
  const ids=[...new Set(chats.map(c=>c.request_id).filter((id):id is string=>!!id))];
  if(ids.length){
    const {data:requests}=await db.from("service_requests").select("id,title").in("id",ids);
    for(const request of requests||[])titles[request.id]=request.title;
  }
  return <AppFrame active="propostas" title="Conversas">
    <span className="cs-eyebrow">Contato privado</span>
    <h1 className="cs-top-title" style={{marginTop:8}}>Minhas conversas</h1>
    <p className="cs-hint">Converse com quem você contratou ou com o cliente que aceitou sua proposta.</p>
    {error&&<p role="alert" className="cs-error">Não foi possível carregar as conversas.</p>}
    {!error&&chats.length===0&&<div className="cs-empty">
      <Icon name="mail" size={30}/>
      <h2>Ainda não há conversas</h2>
      <p>Uma conversa será criada automaticamente quando o cliente aceitar a proposta de um profissional.</p>
      <Link href="/propostas" className="cs-button cs-button-primary">Ver propostas</Link>
    </div>}
    <div className="cs-info-list">
      {chats.map(chat=><Link key={chat.id} href={"/conversas/"+encodeURIComponent(chat.id)} className="cs-list-card cs-card">
        <span className="cs-list-icon"><Icon name="mail"/></span>
        <span style={{flex:1,minWidth:0}}><h3>{chat.request_id?titles[chat.request_id]||"Serviço contratado":"Conversa sobre serviço"}</h3>
          <p>{chat.client_id===user.id?"Conversa com o profissional":"Conversa com o cliente"}</p></span>
        <Icon name="chevron"/>
      </Link>)}
    </div>
  </AppFrame>;
}
