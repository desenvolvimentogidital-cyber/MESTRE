import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {ConversationThread} from "@/components/conversation-thread";
import {createClient} from "@/lib/supabase/server";

export default async function ConversationPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/conversas");
  const {data:conversation,error}=await db.from("conversations")
    .select("id,request_id,client_id,provider_id").eq("id",id).maybeSingle();
  if(error||!conversation||(conversation.client_id!==user.id&&conversation.provider_id!==user.id)){
    return <AppFrame active="propostas" title="Conversa"><div className="cs-empty">
      <Icon name="lock"/><h2>Conversa indisponível</h2>
      <p>Este contato não existe ou você não tem acesso a ele.</p>
      <Link href="/conversas" className="cs-button cs-button-outline">Voltar às conversas</Link>
    </div></AppFrame>;
  }
  let title="Conversa com o profissional",status="in_progress";
  if(!conversation.request_id){
    const {data:provider}=await db.from("provider_profiles")
      .select("display_name,is_active,is_suspended").eq("user_id",conversation.provider_id).maybeSingle();
    if(provider){title="Contato com "+provider.display_name;status=provider.is_active&&!provider.is_suspended?"in_progress":"completed";}
  }
  if(conversation.request_id){
    const {data:request}=await db.from("service_requests")
      .select("title,status").eq("id",conversation.request_id).maybeSingle();
    if(request){title=request.title;status=request.status;}
  }
  return <AppFrame active="propostas" title="Conversa privada">
    <Link href="/conversas" className="cs-small-link">← Minhas conversas</Link>
    <h1 className="cs-top-title" style={{marginTop:15}}>{title}</h1>
    <p className="cs-hint">{conversation.client_id===user.id?"Converse com o profissional pelo ConectaServ.":"Converse com o cliente pelo ConectaServ."}</p>
    <Link className="cs-small-link" href={"/denuncias/nova?userId="+encodeURIComponent(conversation.client_id===user.id?conversation.provider_id:conversation.client_id)+(conversation.request_id?"&requestId="+encodeURIComponent(conversation.request_id):"")}>Denunciar comportamento</Link>
    <ConversationThread conversationId={id} userId={user.id} requestId={conversation.request_id} initialStatus={status}/>
  </AppFrame>;
}
