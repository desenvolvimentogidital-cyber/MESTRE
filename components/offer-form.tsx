"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OfferForm({requestId}:{requestId:string}){
  const router=useRouter();
  const [message,setMessage]=useState("");
  const [amount,setAmount]=useState("");
  const [days,setDays]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setError("");
    if(message.trim().length<20){setError("Descreva sua proposta em pelo menos 20 caracteres.");return;}
    if(amount.trim() && (!Number.isFinite(Number(amount))||Number(amount)<0)){setError("Informe um valor válido.");return;}
    if(days.trim() && (!Number.isInteger(Number(days))||Number(days)<0)){setError("Informe um prazo válido em dias.");return;}
    setBusy(true);
    try{
      const db=createClient();
      const {data:{user},error:authError}=await db.auth.getUser();
      if(authError||!user)throw new Error("Sua sessão expirou. Entre novamente para enviar a proposta.");
      const {error:sendError}=await db.from("proposals").insert({
        request_id:requestId,provider_id:user.id,message:message.trim(),
        amount:amount.trim()?Number(amount):null,
        estimated_days:days.trim()?Number(days):null,status:"sent",
      });
      if(sendError){
        if(sendError.code==="23505")throw new Error("Você já enviou uma proposta para este pedido.");
        throw sendError;
      }
      router.replace("/propostas");
      router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Não foi possível enviar a proposta.");}
    finally{setBusy(false);}
  }
  return <form onSubmit={submit} className="cs-card cs-offer-form">
    <label className="cs-form-label">Mensagem para o cliente
      <textarea rows={5} required minLength={20} maxLength={3000} value={message}
        onChange={e=>setMessage(e.target.value)} placeholder="Explique o serviço, o que está incluído e as condições da proposta."/>
    </label>
    <div className="cs-form-two">
      <label className="cs-form-label">Preço (R$) <small>opcional</small>
        <input type="number" min="0" step="0.01" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Ex.: 350.00"/>
      </label>
      <label className="cs-form-label">Prazo em dias <small>opcional</small>
        <input type="number" min="0" step="1" inputMode="numeric" value={days} onChange={e=>setDays(e.target.value)} placeholder="Ex.: 3"/>
      </label>
    </div>
    <p className="cs-hint">Sua proposta será enviada ao cliente. Envie uma proposta clara e evite compartilhar informações sensíveis desnecessárias.</p>
    {error&&<p role="alert" className="cs-error">{error}</p>}
    <button type="submit" disabled={busy} className="cs-button cs-button-orange" style={{width:"100%"}}>{busy?"Enviando...":"Enviar proposta"}</button>
  </form>;
}
