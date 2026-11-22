import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {ChatInboxList,type ChatListItem} from "@/components/chat-inbox-list";
import {createClient} from "@/lib/supabase/server";

type Chat={id:string;request_id:string|null;client_id:string;provider_id:string;created_at:string};
type Summary={conversation_id:string;unread_count:number;last_message_at:string|null;last_message_excerpt:string|null;last_sender_id:string|null};

export default async function ConversationsPage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/conversas");
  const {data:profile}=await db.from("profiles")
    .select("account_type").eq("id",user.id).maybeSingle();
  if(profile?.account_type!=="client"&&profile?.account_type!=="provider")redirect("/inicio");

  const [{data,error},{data:summaries,error:summaryError}]=await Promise.all([
    db.from("conversations").select("id,request_id,client_id,provider_id,created_at")
      .or("client_id.eq."+user.id+",provider_id.eq."+user.id)
      .order("created_at",{ascending:false}).limit(200),
    db.rpc("my_chat_inbox"),
  ]);
  const chats=(data||[]) as Chat[];
  const titles:Record<string,string>={};
  const providers:Record<string,string>={};
  const providerIds=[...new Set(chats.map(c=>c.provider_id))];
  if(providerIds.length){
    const {data:profiles}=await db.from("provider_profiles").select("user_id,display_name").in("user_id",providerIds);
    for(const p of profiles||[])providers[p.user_id]=p.display_name;
  }
  const requestIds=[...new Set(chats.map(c=>c.request_id).filter((id):id is string=>!!id))];
  if(requestIds.length){
    const {data:requests}=await db.from("service_requests").select("id,title").in("id",requestIds);
    for(const request of requests||[])titles[request.id]=request.title;
  }
  const summariesById=new Map(((summaries||[]) as Summary[]).map(s=>[s.conversation_id,s]));
  const initialChats:ChatListItem[]=chats.map(c=>{
    const summary=summariesById.get(c.id);
    const isClient=c.client_id===user.id;
    return {
      id:c.id,
      title:c.request_id?titles[c.request_id]||"Serviço contratado":
        isClient?"Contato com "+(providers[c.provider_id]||"profissional"):"Contato com cliente",
      otherParty:isClient?"Profissional: "+(providers[c.provider_id]||"profissional cadastrado"):"Cliente do serviço",
      unread_count:Number(summary?.unread_count)||0,
      last_message_at:summary?.last_message_at||null,
      last_message_excerpt:summary?.last_message_excerpt||null,
      last_sender_id:summary?.last_sender_id||null,
    };
  }).sort((a,b)=>Date.parse(b.last_message_at||"")-Date.parse(a.last_message_at||"")||0);
  const unread=initialChats.reduce((sum,c)=>sum+c.unread_count,0);
  return <AppFrame active="conversas" title="Mensagens">
    <span className="cs-eyebrow">{profile.account_type==="client"?"Conversas do cliente":"Conversas do profissional"}</span>
    <div className="cs-section-head" style={{marginTop:8}}>
      <h1 className="cs-top-title">Minhas mensagens</h1>
      {unread>0&&<span className="cs-message-count cs-message-count-inline">{unread>99?"99+":unread}</span>}
    </div>
    <p className="cs-hint">Cada conversa fica identificada pelo serviço. As mensagens novas aparecem com um número ao lado.</p>
    {(error||summaryError)&&<p role="alert" className="cs-error">Não foi possível carregar todas as mensagens. Tente atualizar a página.</p>}
    {!error&&chats.length===0&&<div className="cs-empty">
      <Icon name="mail" size={30}/>
      <h2>Nenhuma conversa ainda</h2>
      <p>Quando iniciar contato ou fechar um serviço, as mensagens aparecerão aqui, separadas por assunto.</p>
      <Link href={profile.account_type==="client"?"/profissionais":"/oportunidades"}
        className="cs-button cs-button-primary">{profile.account_type==="client"?"Buscar profissionais":"Ver pedidos de serviço"}</Link>
    </div>}
    {chats.length>0&&<ChatInboxList initialChats={initialChats} userId={user.id}/>}
  </AppFrame>;
}
