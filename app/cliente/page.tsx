import Link from "next/link";
import { redirect } from "next/navigation";
import { AppFrame, Icon } from "@/components/conectaserv-ui";
import { createClient } from "@/lib/supabase/server";
import { CompleteServiceButton } from "@/components/complete-service-button";

type ClientRequest = {
  id: string; category_id: string; title: string; description: string;
  city: string; state: string; status: string; created_at: string;
};
const statusLabels: Record<string,string> = {
  draft:"Rascunho", published:"Publicado", in_progress:"Em andamento",
  completed:"Concluído", cancelled:"Cancelado",
};

export default async function ClientHomePage() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect("/acesso?redirectTo=/cliente");
  const [requestResult, profileResult] = await Promise.all([
    db.from("service_requests").select("id,category_id,title,description,city,state,status,created_at").eq("client_id",user.id).order("created_at",{ascending:false}),
    db.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),
  ]);
  const requests = (requestResult.data || []) as ClientRequest[];
  const names: Record<string,string> = {};
  const ids = [...new Set(requests.map(r=>r.category_id))];
  if (ids.length) {
    const { data } = await db.from("service_categories").select("id,name").in("id",ids);
    (data || []).forEach(category => { names[category.id] = category.name; });
  }
  const requestIds=requests.map(r=>r.id);
  const chatsByRequest:Record<string,string>={};
  const unreadByRequest:Record<string,number>={};
  if(requestIds.length){
    const [{data:chats},{data:inbox}]=await Promise.all([
      db.from("conversations").select("id,request_id").eq("client_id",user.id).in("request_id",requestIds),
      db.rpc("my_chat_inbox"),
    ]);
    const unreadByChat=new Map<string,number>(((inbox||[]) as Array<{conversation_id:string;unread_count:number}>).map(chat=>[chat.conversation_id,Number(chat.unread_count)||0]));
    for(const chat of ((chats||[]) as Array<{id:string;request_id:string|null}>)){
      if(chat.request_id){
        chatsByRequest[chat.request_id]=chat.id;
        unreadByRequest[chat.request_id]=unreadByChat.get(chat.id)||0;
      }
    }
  }
  const countActive = requests.filter(r => r.status === "published" || r.status === "in_progress").length;
  return <AppFrame active="inicio" title="Meus Pedidos">
    <div className="cs-home-hello">
      <div>
        <span className="cs-eyebrow">Área do cliente</span>
        <h1 className="cs-top-title" style={{marginTop:6}}>Olá{profileResult.data?.full_name ? ", " + profileResult.data.full_name.split(" ")[0] : ""}! 👋</h1>
        <p>Gerencie os serviços que você publicou.</p>
      </div>
      <span className="cs-user-avatar" aria-hidden="true">🏠</span>
    </div>
    <div className="cs-card" style={{display:"grid",gridTemplateColumns:"1fr 1fr",padding:18,gap:14,marginTop:22}}>
      <div><div className="cs-hint">Pedidos publicados</div><div className="cs-price" style={{fontSize:31,marginTop:5}}>{requests.length}</div></div>
      <div><div className="cs-hint">Em aberto</div><div className="cs-price" style={{fontSize:31,marginTop:5}}>{countActive}</div></div>
    </div>
    <Link href="/cliente/novo" className="cs-button cs-button-orange" style={{width:"100%",marginTop:20}}>＋ Publicar um novo pedido</Link>
    <div className="cs-section-head"><h2 className="cs-section-title">Meus pedidos</h2><Link href="/propostas" className="cs-small-link">Propostas <Icon name="arrow" size={16}/></Link></div>
    {requestResult.error && <div role="alert" className="cs-error">Não foi possível carregar os pedidos. Tente novamente mais tarde.</div>}
    {!requestResult.error && requests.length === 0 && <div className="cs-empty">
      <Icon name="briefcase" size={30}/>
      <h2>Seu primeiro serviço começa aqui</h2>
      <p>Publique o que precisa, informe sua localização e receba propostas dos profissionais.</p>
      <Link href="/cliente/novo" className="cs-button cs-button-primary">Criar pedido</Link>
    </div>}
    {!requestResult.error && <div className="cs-info-list">{requests.map(request => <article className="cs-card cs-proposal-card" key={request.id}>
      <div className="cs-proposal-top">
        <span className="cs-chip">{names[request.category_id] || "Serviço"}</span>
        <span className={"cs-status " + request.status}>{statusLabels[request.status] || request.status}</span>
      </div>
      <h3>{request.title}</h3>
      <p className="cs-proposal-body">{request.description}</p>
      <div className="cs-proposal-bottom">
        <span className="cs-hint"><Icon name="location" size={13}/> {request.city}, {request.state}</span>
        <time className="cs-proposal-date" dateTime={request.created_at}>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short"}).format(new Date(request.created_at))}</time>
      </div>
      {request.status === "in_progress" && <div style={{display:"grid",gap:9,marginTop:12}}>
        <Link className="cs-button cs-button-primary"
          href={chatsByRequest[request.id]?"/conversas/"+encodeURIComponent(chatsByRequest[request.id]):"/conversas"}>
          <Icon name="mail" size={17}/> Mensagens deste serviço
          {unreadByRequest[request.id]>0&&<span className="cs-message-count cs-message-count-inline">
            {unreadByRequest[request.id]>99?"99+":unreadByRequest[request.id]}
          </span>}
        </Link>
        <CompleteServiceButton requestId={request.id}/>
      </div>}
      {request.status === "completed" && <div style={{display:"grid",gap:9,marginTop:12}}>
        <p className="cs-hint" style={{marginBottom:0}}>Serviço encerrado. O histórico da conversa continua disponível.</p>
        <Link href={"/avaliar/"+encodeURIComponent(request.id)} className="cs-button cs-button-orange"><Icon name="star" size={17}/> Avaliar profissional</Link>
      </div>}
    </article>)}</div>}
  </AppFrame>;
}
