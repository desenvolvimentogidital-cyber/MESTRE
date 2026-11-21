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
  let title="Serviço contratado",status="completed";
  if(conversation.request_id){
    const {data:request}=await db.from("service_requests")
      .select("title,status").eq("id",conversation.request_id).maybeSingle();
    if(request){title=request.title;status=request.status;}
  }
  return <AppFrame active="propostas" title="Conversa privada">
    <Link href="/conversas" className="cs-small-link">← Minhas conversas</Link>
    <h1 className="cs-top-title" style={{marginTop:15}}>{title}</h1>
    <p className="cs-hint">{conversation.client_id===user.id?"Fale com o profissional contratado.":"Fale com o cliente que aceitou sua proposta."}</p>
    <ConversationThread conversationId={id} userId={user.id} requestId={conversation.request_id} initialStatus={status}/>
  </AppFrame>;
}
