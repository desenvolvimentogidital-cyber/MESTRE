"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

export function CompleteServiceButton({requestId}:{requestId:string}){
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();
  async function complete(){
    if(!window.confirm("Confirma que o serviço foi concluído? A contratação será encerrada e a conversa ficará somente para consulta."))return;
    setBusy(true);setError("");
    try{
      const db=createClient();
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user)throw new Error("Entre novamente na sua conta.");
      const {data,error:rpcError}=await db.rpc("complete_service_request",{p_request_id:requestId});
      if(rpcError)throw rpcError;
      if(data!==true)throw new Error("O serviço não pôde ser concluído.");
      router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Erro ao concluir serviço.");}
    finally{setBusy(false);}
  }
  return <div style={{display:"grid",gap:7}}>
    <button type="button" className="cs-button cs-button-outline" disabled={busy} onClick={complete}>
      <Icon name="check" size={16}/>{busy?"Concluindo...":"Confirmar serviço concluído"}
    </button>
    {error&&<p className="cs-error" role="alert">{error}</p>}
  </div>;
}
