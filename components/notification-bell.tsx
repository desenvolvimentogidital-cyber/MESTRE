"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

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
    <Icon name="bell" size={21}/>
    {count>0&&<span className="cs-notice-count">{count>99?"99+":count}</span>}
  </Link>;
}
