"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

type Request={status:string;note:string;admin_note:string|null;reviewed_at:string|null};
export function VerificationRequestForm({initial,isVerified}:{initial:Request|null;isVerified:boolean}){
  const [status,setStatus]=useState(initial?.status||(isVerified?"approved":""));
  const [note,setNote]=useState(initial?.status==="rejected"?initial.note:"");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");setSuccess("");
    setBusy(true);
    try{
      const db=createClient();
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user)throw new Error("Entre novamente na sua conta.");
      const {error:rpcError}=await db.rpc("request_provider_verification",{p_note:note.trim()});
      if(rpcError)throw rpcError;
      setStatus("pending");
      setSuccess("Solicitação enviada. Aguarde a análise da equipe.");
    }catch(err){setError(err instanceof Error?err.message:"Não foi possível enviar sua solicitação.");}
    finally{setBusy(false);}
  }
  return <div className="cs-card cs-offer-form">
    <div><h2 className="cs-section-title">Conferência do perfil profissional</h2>
      <p className="cs-hint">A equipe pode analisar suas informações e histórico de atuação. Este selo não significa validação oficial de identidade ou garantia do serviço.</p>
    </div>
    {isVerified||status==="approved"?<p className="cs-success"><Icon name="shield" size={17}/> Perfil conferido pela equipe.</p>
      :status==="pending"?<p className="cs-chip"><Icon name="clock" size={15}/> Solicitação em análise</p>
      :<form onSubmit={submit} className="cs-auth-form">
        {status==="rejected"&&<div className="cs-error"><strong>Solicitação não aprovada.</strong> {initial?.admin_note||"Você pode enviar uma nova solicitação com informações adicionais."}</div>}
        <label className="cs-form-label">Descreva sua experiência e atividades profissionais
          <textarea rows={5} required minLength={20} maxLength={500} value={note}
            onChange={e=>setNote(e.target.value)}
            placeholder="Informe suas especialidades, tempo de atuação e informações profissionais que podem ser avaliadas."/>
        </label>
        <p className="cs-hint">Não envie senhas, documentos pessoais, CPF ou dados bancários neste formulário.</p>
        <button type="submit" className="cs-button cs-button-primary" disabled={busy}>{busy?"Enviando...":"Solicitar conferência"}</button>
      </form>}
    {success&&<p role="status" className="cs-success">{success}</p>}
    {error&&<p role="alert" className="cs-error">{error}</p>}
  </div>;
}
