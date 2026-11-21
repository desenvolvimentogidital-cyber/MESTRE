"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

export function ContactProfessional({providerId,autoStart=false}:{providerId:string;autoStart?:boolean}){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const once=useRef(false);
 async function start(){
   if(once.current)return;
   once.current=true;setBusy(true);setError("");
   try{
     const db=createClient();
     const {data:auth,error:authError}=await db.auth.getUser();
     if(authError||!auth.user){
       router.push("/acesso?redirectTo="+encodeURIComponent("/profissional/"+providerId+"?iniciar=1"));
       return;
     }
     const {data,error:rpcError}=await db.rpc("start_direct_conversation",{p_provider_id:providerId});
     if(rpcError)throw rpcError;
     if(typeof data!=="string")throw new Error("Não foi possível criar a conversa.");
     router.replace("/conversas/"+encodeURIComponent(data));
     router.refresh();
   }catch(e){setError(e instanceof Error?e.message:"Não foi possível abrir a conversa.");}
   finally{setBusy(false);once.current=false;}
 }
 useEffect(()=>{
   if(autoStart&&!once.current){void start();}
   // Only auto-start once after returning from authentication.
   // eslint-disable-next-line react-hooks/exhaustive-deps
 },[autoStart]);
 return <div style={{display:"grid",gap:10}}>
   <button className="cs-button cs-button-orange" style={{width:"100%"}}
     onClick={()=>void start()} disabled={busy} type="button">
     <Icon name="mail" size={17}/> {busy?"Abrindo conversa...":"Conversar com este profissional"}
   </button>
   {error&&<p role="alert" className="cs-error">{error}</p>}
   <p className="cs-hint">Para enviar mensagens é necessário entrar ou criar uma conta de cliente. O contato acontece dentro do ConectaServ.</p>
   <Link className="cs-small-link" href="/cliente/novo">Prefere publicar um pedido e receber orçamentos?</Link>
 </div>;
}
