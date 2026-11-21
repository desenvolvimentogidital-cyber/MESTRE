"use client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

export function ProposalDecision({proposalId,requestTitle,onDecided}:{
  proposalId:string;requestTitle:string;
  onDecided:(action:"accept"|"reject",conversationId:string|null)=>void;
}){
  const router=useRouter();
  const [busy,setBusy]=useState<"accept"|"reject"|null>(null);
  const [error,setError]=useState("");
  async function decide(action:"accept"|"reject"){
    const verb=action==="accept"?"aceitar":"recusar";
    const explanation=action==="accept"
      ? "Ao aceitar, você contrata este profissional, recusa as outras propostas pendentes e libera uma conversa privada. Deseja continuar?"
      : "Deseja recusar esta proposta? A decisão não poderá ser desfeita.";
    if(!window.confirm(explanation))return;
    setError("");setBusy(action);
    try{
      const db=createClient();
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user)throw new Error("Entre novamente na sua conta para continuar.");
      const {data,error:actionError}=await db.rpc("respond_to_proposal",{
        p_proposal_id:proposalId,p_decision:action,
      });
      if(actionError)throw actionError;
      const chatId=action==="accept"&&typeof data==="string"?data:null;
      onDecided(action,chatId);
      router.refresh();
      if(chatId)router.push("/conversas/"+encodeURIComponent(chatId));
    }catch(err){
      setError(err instanceof Error?err.message:"Não foi possível "+verb+" a proposta de "+requestTitle+".");
    }finally{setBusy(null);}
  }
  return <div style={{display:"grid",gap:9,marginTop:10}}>
    <div className="cs-form-two">
      <button type="button" disabled={!!busy} className="cs-button cs-button-primary" onClick={()=>decide("accept")}><Icon name="check" size={17}/>{busy==="accept"?"Aceitando...":"Aceitar orçamento"}</button>
      <button type="button" disabled={!!busy} className="cs-button cs-button-outline" onClick={()=>decide("reject")}>{busy==="reject"?"Recusando...":"Recusar"}</button>
    </div>
    {error&&<p className="cs-error" role="alert" style={{margin:0}}>{error}</p>}
  </div>;
}
