"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

type Notification={
  id:string;kind:string;title:string;body:string;
  request_id:string|null;conversation_id:string|null;
  read_at:string|null;created_at:string;
};
function notificationLink(item:Notification){
  if(item.kind==="new_request"&&item.request_id)return "/prestador/pedido/"+encodeURIComponent(item.request_id);
  if(item.kind==="new_message"&&item.conversation_id)return "/conversas/"+encodeURIComponent(item.conversation_id);
  if(item.kind==="verification_update")return "/prestador/perfil";
  if(item.kind==="new_review")return "/prestador/perfil";
  if(item.kind==="report_update")return "/denuncias";
  if(item.kind==="service_completed")return "/propostas";
  return "/propostas";
}

export default function NotificationsPage(){
  const router=useRouter();
  const [items,setItems]=useState<Notification[]>([]);
  const [unreadOnly,setUnreadOnly]=useState(false);
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState("");
  const [actor,setActor]=useState("");
  useEffect(()=>{
    let active=true;
    const db=createClient();
    async function load(){
      const {data:auth,error:authError}=await db.auth.getUser();
      if(!active)return;
      if(authError||!auth.user){router.replace("/acesso?redirectTo=/notificacoes");return;}
      setActor(auth.user.id);
      const {data, error:queryError}=await db.from("notifications")
        .select("id,kind,title,body,request_id,conversation_id,read_at,created_at")
        .eq("recipient_id",auth.user.id).order("created_at",{ascending:false}).limit(75);
      if(!active)return;
      if(queryError)setError("Não foi possível carregar seus avisos.");
      else{setItems((data||[]) as Notification[]);setError("");}
      setBusy(false);
    }
    void load();
    const timer=window.setInterval(()=>{void load();},15000);
    return()=>{active=false;window.clearInterval(timer);};
  },[router]);

  async function markRead(id:string){
    if(!actor)return;
    const db=createClient();
    const {error:editError}=await db.from("notifications")
      .update({read_at:new Date().toISOString()}).eq("id",id).eq("recipient_id",actor).is("read_at",null);
    if(editError){setError("Não foi possível marcar a notificação como lida.");return;}
    setItems(current=>current.map(item=>item.id===id?{...item,read_at:new Date().toISOString()}:item));
  }
  async function markAllRead(){
    if(!actor)return;
    const db=createClient();
    const {error:editError}=await db.from("notifications")
      .update({read_at:new Date().toISOString()}).eq("recipient_id",actor).is("read_at",null);
    if(editError){setError("Não foi possível marcar todos os avisos como lidos.");return;}
    setItems(current=>current.map(item=>({...item,read_at:item.read_at||new Date().toISOString()})));
  }
  const unread=items.filter(item=>!item.read_at).length;
  const shown=unreadOnly?items.filter(item=>!item.read_at):items;
  return <AppFrame active="notificacoes" title="Notificações">
    <div className="cs-section-head" style={{marginTop:0}}>
      <div><h1 className="cs-top-title">Notificações</h1>
        <p className="cs-hint" style={{marginTop:6}}>{unread===0?"Nenhum aviso não lido":unread+" aviso(s) não lido(s)"}</p></div>
      <span className="cs-chip"><Icon name="bell" size={16}/> {unread}</span>
    </div>
    <div className="cs-filter-tabs" role="group" aria-label="Filtro de notificações">
      <button type="button" className={!unreadOnly?"active":""} onClick={()=>setUnreadOnly(false)}>Todas</button>
      <button type="button" className={unreadOnly?"active":""} onClick={()=>setUnreadOnly(true)}>Não lidas</button>
      {unread>0&&<button type="button" onClick={()=>void markAllRead()}>Marcar todas como lidas</button>}
    </div>
    {busy&&<p className="cs-hint">Carregando avisos...</p>}
    {error&&<p className="cs-error" role="alert">{error}</p>}
    {!busy&&shown.length===0&&<div className="cs-empty"><Icon name="bell" size={30}/>
      <h2>{unreadOnly?"Nenhum aviso pendente":"Ainda não há notificações"}</h2>
      <p>Você receberá avisos automaticamente dentro do aplicativo sobre pedidos, orçamentos, mensagens e contratações.</p>
      <Link className="cs-button cs-button-outline" href="/inicio">Ir para serviços</Link>
    </div>}
    <div className="cs-info-list">{shown.map(item=><article className={"cs-card cs-notice "+(!item.read_at?"is-new":"")} key={item.id}>
      <div className="cs-proposal-top"><strong>{item.title}</strong>{!item.read_at&&<span className="cs-notice-dot" aria-label="Não lida"/>}</div>
      <p>{item.body}</p>
      <div className="cs-proposal-bottom">
        <time className="cs-hint" dateTime={item.created_at}>{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(item.created_at))}</time>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {!item.read_at&&<button type="button" className="cs-small-link cs-text-button" onClick={()=>void markRead(item.id)}>Marcar lida</button>}
          <Link className="cs-small-link" href={notificationLink(item)} onClick={()=>{void markRead(item.id);}}>Abrir <Icon name="chevron" size={15}/></Link>
        </div>
      </div>
    </article>)}</div>
    <p className="cs-hint" style={{marginTop:20,textAlign:"center"}}>Os avisos são atualizados automaticamente enquanto você utiliza o ConectaServ.</p>
  </AppFrame>;
}
