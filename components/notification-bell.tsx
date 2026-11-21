"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";

export function NotificationBell(){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    let active=true;
    const db=createClient();
    async function load(){
      const {data:auth}=await db.auth.getUser();
      if(!active)return;
      if(!auth.user){setCount(0);return;}
      const {count:total,error}=await db.from("notifications")
        .select("id",{count:"exact",head:true})
        .eq("recipient_id",auth.user.id).is("read_at",null);
      if(active&&!error)setCount(total||0);
    }
    void load();
    const timer=window.setInterval(()=>{void load();},20000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);
  return <Link href="/notificacoes" className="cs-notice-bell" aria-label={count?"Notificações: "+count+" não lida(s)":"Abrir notificações"} title="Notificações">
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
    {count>0&&<span className="cs-notice-count">{count>99?"99+":count}</span>}
  </Link>;
}
