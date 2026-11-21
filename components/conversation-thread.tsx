"use client";
import {useEffect,useRef,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

type Message={id:string;sender_id:string;body:string;created_at:string};
export function ConversationThread({conversationId,userId,requestId,initialStatus}:{
  conversationId:string;userId:string;requestId:string|null;initialStatus:string;
}){
  const [messages,setMessages]=useState<Message[]>([]);
  const [draft,setDraft]=useState("");
  const [status,setStatus]=useState(initialStatus);
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [error,setError]=useState("");
  const tail=useRef<HTMLDivElement|null>(null);
  const dbRef=useRef<ReturnType<typeof createClient>|null>(null);
  if(!dbRef.current)dbRef.current=createClient();

  useEffect(()=>{
    let active=true;
    const db=dbRef.current!;
    async function fetchThread(){
      const {data,error:fetchError}=await db.from("messages")
        .select("id,sender_id,body,created_at").eq("conversation_id",conversationId)
        .order("created_at",{ascending:false}).limit(100);
      if(!active)return;
      if(fetchError){setError("Não foi possível carregar as mensagens.");}
      else{setMessages(((data||[]) as Message[]).reverse());setError("");}
      if(requestId){
        const {data:request}=await db.from("service_requests").select("status").eq("id",requestId).maybeSingle();
        if(active&&request)setStatus(request.status);
      }
      if(active)setLoading(false);
    }
    void fetchThread();
    const timer=window.setInterval(()=>{void fetchThread();},8000);
    return()=>{active=false;window.clearInterval(timer);};
  },[conversationId,requestId]);
  useEffect(()=>{tail.current?.scrollIntoView({behavior:"smooth",block:"end"});},[messages.length]);

  async function send(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const body=draft.trim();
    if(!body||body.length>2000||sending||status!=="in_progress")return;
    setSending(true);setError("");
    try{
      const db=dbRef.current!;
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user||auth.user.id!==userId)throw new Error("Sua sessão expirou. Entre novamente.");
      const {error:sendError}=await db.from("messages")
        .insert({conversation_id:conversationId,sender_id:userId,body});
      if(sendError)throw sendError;
      setDraft("");
      const {data:latest,error:readError}=await db.from("messages")
        .select("id,sender_id,body,created_at").eq("conversation_id",conversationId)
        .order("created_at",{ascending:false}).limit(100);
      if(!readError)setMessages(((latest||[]) as Message[]).reverse());
    }catch(err){
      setError(err instanceof Error?err.message:"Não foi possível enviar a mensagem.");
    }finally{setSending(false);}
  }
  return <section className="cs-chat-shell">
    <div className="cs-chat-banner"><Icon name="shield" size={18}/> <span>Conversa privada entre cliente e profissional. Evite compartilhar senhas e dados bancários.</span></div>
    <div className="cs-chat-history" role="log" aria-label="Mensagens da conversa" aria-live="polite">
      {loading&&<p className="cs-hint">Carregando mensagens...</p>}
      {!loading&&messages.length===0&&<div className="cs-chat-placeholder"><Icon name="mail" size={25}/><p>A conversa está aberta. Envie a primeira mensagem para combinar os detalhes.</p></div>}
      {messages.map(message=><div key={message.id} className={"cs-chat-bubble "+(message.sender_id===userId?"mine":"theirs")}>
        <p>{message.body}</p>
        <time dateTime={message.created_at}>{new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(message.created_at))}</time>
      </div>)}
      <div ref={tail}/>
    </div>
    {error&&<p role="alert" className="cs-error" style={{margin:0}}>{error}</p>}
    {status!=="in_progress"?
      <p className="cs-hint cs-chat-closed"><Icon name="check" size={17}/> Serviço encerrado. Esta conversa está disponível somente para leitura.</p>:
      <form onSubmit={send} className="cs-chat-compose">
        <textarea value={draft} maxLength={2000} rows={2} onChange={e=>setDraft(e.target.value)}
          placeholder="Digite sua mensagem..." aria-label="Nova mensagem"/>
        <button className="cs-button cs-button-primary" disabled={sending||!draft.trim()} type="submit">
          {sending?"Enviando...":"Enviar"} <Icon name="arrow" size={16}/>
        </button>
      </form>}
    <p className="cs-hint" style={{textAlign:"center"}}>As mensagens são atualizadas automaticamente durante a conversa.</p>
  </section>;
}
