"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

/** Only an uncontracted request may be cancelled by its own client. */
export function CancelRequestButton({requestId}:{requestId:string}){
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function cancel(){
    if(!window.confirm("Cancelar este pedido? As propostas pendentes serão recusadas e o anúncio sairá das oportunidades. Esta ação não pode ser desfeita."))return;
    setBusy(true);setError("");
    try{
      const db=createClient();
      const {data:{user},error:authError}=await db.auth.getUser();
      if(authError||!user)throw new Error("Sua sessão expirou. Entre novamente.");
      const {data,error:cancelError}=await db.rpc("cancel_my_service_request",{p_request_id:requestId});
      if(cancelError)throw cancelError;
      if(data!==true)throw new Error("Não foi possível cancelar o pedido.");
      router.refresh();
    }catch(e){
      setError(e instanceof Error?e.message:"Não foi possível cancelar o pedido.");
    }finally{setBusy(false);}
  }
  return <div style={{display:"grid",gap:8}}>
    <button type="button" className="cs-button cs-button-outline" disabled={busy} onClick={()=>void cancel()}>
      {busy?"Cancelando...":"Cancelar pedido ainda aberto"}
    </button>
    {error&&<p role="alert" className="cs-error">{error}</p>}
  </div>;
}
