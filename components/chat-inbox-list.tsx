"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";

export type ChatListItem={
  id:string;title:string;otherParty:string;
  unread_count:number;last_message_excerpt:string|null;
  last_message_at:string|null;last_sender_id:string|null;
};
type Summary={conversation_id:string;unread_count:number;last_message_at:string|null;last_message_excerpt:string|null;last_sender_id:string|null};

export function ChatInboxList({initialChats,userId}:{initialChats:ChatListItem[];userId:string}){
  const [chats,setChats]=useState<ChatListItem[]>(initialChats);
  const [error,setError]=useState("");
  useEffect(()=>{
    let live=true;
    const db=createClient();
    async function refresh(){
      const {data,error:loadError}=await db.rpc("my_chat_inbox");
      if(!live)return;
      if(loadError){setError("Os avisos de mensagens estão temporariamente indisponíveis.");return;}
      setError("");
      const summary=(data||[]) as Summary[];
      const known=new Map(initialChats.map(item=>[item.id,item]));
      if(summary.some(item=>!known.has(item.conversation_id))){
        // New service conversations need their titles loaded by the server.
        window.location.reload();
        return;
      }
      const sorted=summary.map(item=>{
        const base=known.get(item.conversation_id)!;
        return {...base,unread_count:Number(item.unread_count)||0,
          last_message_excerpt:item.last_message_excerpt,
          last_message_at:item.last_message_at,
          last_sender_id:item.last_sender_id};
      });
      setChats(sorted);
    }
    void refresh();
    const timer=window.setInterval(refresh,10000);
    function onFocus(){void refresh();}
    window.addEventListener("focus",onFocus);
    window.addEventListener("cs-chat-read",onFocus);
    return()=>{
      live=false;window.clearInterval(timer);
      window.removeEventListener("focus",onFocus);
      window.removeEventListener("cs-chat-read",onFocus);
    };
  },[initialChats,userId]);
  return <div className="cs-info-list cs-inbox">
    {error&&<p className="cs-hint" role="status">{error}</p>}
    {chats.map(chat=><Link key={chat.id} href={"/conversas/"+encodeURIComponent(chat.id)}
      className={"cs-list-card cs-card cs-chat-list-item"+(chat.unread_count>0?" has-unread":"")}>
      <span className="cs-list-icon" aria-hidden="true"><Icon name="mail"/></span>
      <span className="cs-chat-list-content">
        <strong>{chat.title}</strong>
        <small className="cs-hint">{chat.otherParty}</small>
        {chat.last_message_excerpt
          ? <span className="cs-chat-preview">
              {chat.last_sender_id===userId?"Você: ":""}{chat.last_message_excerpt}
            </span>
          : <span className="cs-chat-preview">Nenhuma mensagem ainda. Comece a conversa.</span>}
      </span>
      <span className="cs-chat-list-side">
        {chat.last_message_at&&<time dateTime={chat.last_message_at} className="cs-hint">
          {new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(chat.last_message_at))}
        </time>}
        {chat.unread_count>0?<span className="cs-message-count cs-message-count-inline">
          {chat.unread_count>99?"99+":chat.unread_count}
        </span>:<Icon name="chevron" size={17}/>}
      </span>
    </Link>)}
  </div>;
}
