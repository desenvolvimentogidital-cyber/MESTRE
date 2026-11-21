"use client";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

const reasons=[
  {value:"Fraude ou tentativa de golpe",label:"Fraude ou tentativa de golpe"},
  {value:"Assédio ou ofensa",label:"Assédio ou ofensa"},
  {value:"Conteúdo inadequado",label:"Conteúdo inadequado"},
  {value:"Spam ou propaganda",label:"Spam ou propaganda"},
  {value:"Outro problema",label:"Outro problema"},
];
export function ReportForm({userId,requestId,reviewId}:{userId:string|null;requestId:string|null;reviewId:string|null}){
  const [reason,setReason]=useState(reasons[0].value);
  const [details,setDetails]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [done,setDone]=useState(false);
  const router=useRouter();
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    if(!userId&&!requestId&&!reviewId){setError("Nenhum conteúdo identificado para análise.");return;}
    setBusy(true);
    try{
      const db=createClient();
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user)throw new Error("Entre novamente em sua conta.");
      if(userId===auth.user.id)throw new Error("Não é possível denunciar a própria conta.");
      const {error:insertError}=await db.from("reports").insert({
        reporter_id:auth.user.id,reported_user_id:userId,request_id:requestId,review_id:reviewId,
        reason,details:details.trim()||null,
      });
      if(insertError)throw insertError;
      setDone(true);
      router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Não foi possível registrar a denúncia.");}
    finally{setBusy(false);}
  }
  if(done)return <div className="cs-empty">
    <h2>Denúncia recebida</h2>
    <p>Sua denúncia foi registrada para análise. Você pode acompanhar a situação em Minhas denúncias.</p>
    <Link href="/denuncias" className="cs-button cs-button-primary">Acompanhar denúncia</Link>
  </div>;
  return <form className="cs-card cs-offer-form" onSubmit={submit}>
    <label className="cs-form-label">Qual é o motivo?
      <select value={reason} onChange={e=>setReason(e.target.value)} required>
        {reasons.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
    <label className="cs-form-label">Detalhes (opcional)
      <textarea value={details} onChange={e=>setDetails(e.target.value)}
        maxLength={1500} rows={6} placeholder="Descreva objetivamente o ocorrido e quando aconteceu."/>
    </label>
    <p className="cs-hint">Sua denúncia será vista pela equipe responsável pela moderação. Não publique dados pessoais de terceiros.</p>
    {error&&<p className="cs-error" role="alert">{error}</p>}
    <button disabled={busy} type="submit" className="cs-button cs-button-orange">{busy?"Enviando...":"Enviar denúncia"}</button>
  </form>;
}
