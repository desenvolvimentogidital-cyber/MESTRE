"use client";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";

/** Unread messages, not generic notifications. No count for guests. */
export function MessageUnreadBadge(){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    let live=true;
    const db=createClient();
    async function fetchUnread(){
      const {data:auth}=await db.auth.getUser();
      if(!live)return;
      if(!auth.user){setCount(0);return;}
      const {data,error}=await db.rpc("my_unread_message_total");
      if(live&&!error)setCount(Math.max(0,Number(data)||0));
    }
    function onChange(){void fetchUnread();}
    void fetchUnread();
    const timer=window.setInterval(onChange,12000);
    window.addEventListener("cs-chat-read",onChange);
    window.addEventListener("focus",onChange);
    return()=>{
      live=false;window.clearInterval(timer);
      window.removeEventListener("cs-chat-read",onChange);
      window.removeEventListener("focus",onChange);
    };
  },[]);
  if(count===0)return null;
  return <span className="cs-message-count" aria-label={count+" mensagem(ns) não lida(s)"}>
    {count>99?"99+":count}
  </span>;
}
