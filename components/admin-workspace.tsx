"use client";
import {useCallback,useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";
import {AdminLegalSettings} from "@/components/admin-legal-settings";

type Report={
  id:string;reason:string;details:string|null;status:string;created_at:string;
  reported_user_id:string|null;request_id:string|null;review_id:string|null;
};
type Verification={id:string;provider_id:string;note:string;status:string;created_at:string};
type SupportTicket={id:string;full_name:string;email:string;topic:string;message:string;status:string;created_at:string};
const topicNames:Record<string,string>={support:"Suporte",account:"Cadastro e acesso",privacy:"Privacidade e dados pessoais",report:"Denúncia e segurança",other:"Outro assunto"};
const moderationActions=[
  {value:"resolve",label:"Marcar como resolvida"},
  {value:"dismiss",label:"Arquivar sem medida"},
  {value:"suspend_provider",label:"Suspender profissional",needs:"reported_user_id"},
  {value:"restore_provider",label:"Reativar profissional",needs:"reported_user_id"},
  {value:"cancel_request",label:"Cancelar pedido não contratado",needs:"request_id"},
  {value:"hide_review",label:"Ocultar avaliação",needs:"review_id"},
] as const;

export function AdminWorkspace(){
  const [reports,setReports]=useState<Report[]>([]);
  const [verifications,setVerifications]=useState<Verification[]>([]);
  const [supportTickets,setSupportTickets]=useState<SupportTicket[]>([]);
  const [names,setNames]=useState<Record<string,string>>({});
  const [view,setView]=useState<"reports"|"verifications"|"support"|"settings">("reports");
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [actions,setActions]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState("");
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const load=useCallback(async()=>{
    const db=createClient();
    const [{data:r,error:re},{data:v,error:ve},{data:t,error:te}]=await Promise.all([
      db.from("reports").select("id,reason,details,status,created_at,reported_user_id,request_id,review_id")
        .in("status",["open","reviewing"]).order("created_at",{ascending:false}).limit(100),
      db.from("verification_requests").select("id,provider_id,note,status,created_at")
        .eq("status","pending").order("created_at",{ascending:true}).limit(100),
      db.from("support_tickets").select("id,full_name,email,topic,message,status,created_at")
        .in("status",["open","reviewing"]).order("created_at",{ascending:true}).limit(100),
    ]);
    if(re||ve||te){setError("Não foi possível atualizar a fila administrativa.");setLoading(false);return;}
    setReports((r||[]) as Report[]);
    setVerifications((v||[]) as Verification[]);
    setSupportTickets((t||[]) as SupportTicket[]);
    const ids=[...new Set((v||[]).map(item=>item.provider_id))];
    if(ids.length){
      const {data:p}=await db.from("provider_profiles").select("user_id,display_name").in("user_id",ids);
      setNames(Object.fromEntries((p||[]).map(item=>[item.user_id,item.display_name])));
    }
    setError("");setLoading(false);
  },[]);
  useEffect(()=>{void load();},[load]);
  useEffect(()=>{if(window.location.hash==="#configuracoes")setView("settings");},[]);
  async function moderate(report:Report){
    const action=actions[report.id]||"resolve";
    if(!window.confirm("Confirmar a ação de moderação: "+moderationActions.find(a=>a.value===action)?.label+"?"))return;
    setBusy(report.id);setError("");setSuccess("");
    try{
      const db=createClient();
      const {error:rpcError}=await db.rpc("admin_moderate_report",{
        p_report_id:report.id,p_action:action,p_note:notes[report.id]?.trim()||null,
      });
      if(rpcError)throw rpcError;
      setSuccess("Ação de moderação registrada com sucesso.");await load();
    }catch(e){setError(e instanceof Error?e.message:"Falha na moderação.");}
    finally{setBusy("");}
  }
  async function verify(row:Verification,decision:"approved"|"rejected"){
    if(!window.confirm(decision==="approved"
      ?"Conferiu as informações profissionais? Deseja aprovar este perfil?"
      :"Deseja recusar esta solicitação de conferência?"))return;
    setBusy(row.id);setError("");setSuccess("");
    try{
      const db=createClient();
      const {error:rpcError}=await db.rpc("admin_review_verification",{
        p_verification_id:row.id,p_decision:decision,p_note:notes[row.id]?.trim()||null,
      });
      if(rpcError)throw rpcError;
      setSuccess("Solicitação analisada. O profissional será notificado.");await load();
    }catch(e){setError(e instanceof Error?e.message:"Falha ao analisar o perfil.");}
    finally{setBusy("");}
  }
  async function handleSupport(row:SupportTicket){
    const action=actions[row.id]||"resolved";
    if(!window.confirm("Registrar esta decisão de atendimento?"))return;
    setBusy(row.id);setError("");setSuccess("");
    try{
      const db=createClient();
      const {data,error:rpcError}=await db.rpc("admin_handle_support_ticket",{
        p_ticket_id:row.id,p_status:action,p_note:notes[row.id]?.trim()||null,
      });
      if(rpcError)throw rpcError;
      if(data!==true)throw new Error("A alteração não foi confirmada.");
      setSuccess("Solicitação de suporte atualizada com sucesso.");
      await load();
    }catch(e){setError(e instanceof Error?e.message:"Falha ao atualizar atendimento.");}
    finally{setBusy("");}
  }
  return <div>
    <div className="cs-card cs-admin-summary">
      <div><span className="cs-hint">Denúncias aguardando</span><strong>{reports.length}</strong></div>
      <div><span className="cs-hint">Conferências pendentes</span><strong>{verifications.length}</strong></div>
      <div><span className="cs-hint">Suporte e privacidade</span><strong>{supportTickets.length}</strong></div>
    </div>
    <div className="cs-filter-tabs" role="group" aria-label="Área de administração" style={{marginTop:20}}>
      <button type="button" className={view==="reports"?"active":""} onClick={()=>setView("reports")}>Denúncias ({reports.length})</button>
      <button type="button" className={view==="verifications"?"active":""} onClick={()=>setView("verifications")}>Verificações ({verifications.length})</button>
      <button type="button" className={view==="support"?"active":""} onClick={()=>setView("support")}>Suporte ({supportTickets.length})</button>
      <button type="button" className={view==="settings"?"active":""} onClick={()=>{setView("settings");window.history.replaceState(null,"","#configuracoes");}}>Configurações</button>
      <button type="button" onClick={()=>{setLoading(true);void load();}}>Atualizar</button>
    </div>
    {loading&&<p className="cs-hint">Carregando fila...</p>}
    {error&&<p className="cs-error" role="alert">{error}</p>}
    {success&&<p className="cs-success" role="status">{success}</p>}
    {!loading&&view==="reports"&&reports.length===0&&<div className="cs-empty">
      <Icon name="shield" size={29}/><h2>Fila de denúncias vazia</h2>
      <p>Novos relatos enviados por clientes ou profissionais aparecerão aqui para análise.</p>
    </div>}
    {!loading&&view==="reports"&&<div className="cs-info-list">{reports.map(row=><article className="cs-card cs-offer-form" key={row.id}>
      <div className="cs-proposal-top"><strong>{row.reason}</strong><span className="cs-status sent">Aguardando análise</span></div>
      {row.details&&<p className="cs-proposal-body">{row.details}</p>}
      <p className="cs-hint">Recebida em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(row.created_at))}</p>
      <div className="cs-hint">
        {row.reported_user_id&&<p>Profissional denunciado: {row.reported_user_id}</p>}
        {row.request_id&&<p>Pedido vinculado: {row.request_id}</p>}
        {row.review_id&&<p>Avaliação vinculada: {row.review_id}</p>}
      </div>
      <label className="cs-form-label">Ação de moderação
        <select value={actions[row.id]||"resolve"} onChange={e=>setActions(s=>({...s,[row.id]:e.target.value}))}>
          {moderationActions.filter(action=>!('needs' in action)||!!row[action.needs]).map(a=><option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </label>
      <label className="cs-form-label">Justificativa ou observação administrativa (opcional)
        <textarea value={notes[row.id]||""} maxLength={800} rows={3}
          onChange={e=>setNotes(s=>({...s,[row.id]:e.target.value}))}/>
      </label>
      <button type="button" disabled={!!busy} className="cs-button cs-button-primary" onClick={()=>void moderate(row)}>{busy===row.id?"Registrando...":"Confirmar decisão"}</button>
    </article>)}</div>}
    {!loading&&view==="verifications"&&verifications.length===0&&<div className="cs-empty">
      <Icon name="shield" size={29}/><h2>Nenhuma verificação pendente</h2><p>As solicitações aparecerão aqui.</p></div>}
    {!loading&&view==="verifications"&&<div className="cs-info-list">{verifications.map(row=><article className="cs-card cs-offer-form" key={row.id}>
      <strong>{names[row.provider_id]||"Profissional inscrito"}</strong>
      <p className="cs-hint">Identificador: {row.provider_id}</p>
      <p className="cs-proposal-body">{row.note}</p>
      <p className="cs-hint">A equipe deve verificar as informações antes de conceder o selo. Não equivale a uma validação governamental de identidade.</p>
      <label className="cs-form-label">Observação para o profissional (opcional)
        <textarea rows={3} maxLength={800} value={notes[row.id]||""} onChange={e=>setNotes(s=>({...s,[row.id]:e.target.value}))}/>
      </label>
      <div className="cs-form-two">
        <button disabled={!!busy} type="button" className="cs-button cs-button-primary" onClick={()=>void verify(row,"approved")}>Aprovar perfil</button>
        <button disabled={!!busy} type="button" className="cs-button cs-button-outline" onClick={()=>void verify(row,"rejected")}>Recusar</button>
      </div>
    </article>)}</div>}
    {!loading&&view==="support"&&supportTickets.length===0&&<div className="cs-empty">
      <Icon name="mail" size={29}/><h2>Sem atendimentos pendentes</h2>
      <p>Pedidos de suporte e direitos de privacidade feitos em /suporte aparecerão aqui.</p>
    </div>}
    {!loading&&view==="support"&&<div className="cs-info-list">{supportTickets.map(row=><article className="cs-card cs-offer-form" key={row.id}>
      <div className="cs-proposal-top"><strong>{topicNames[row.topic]||row.topic}</strong>
        <span className="cs-status sent">{row.status==="reviewing"?"Em análise":"Novo"}</span>
      </div>
      <p className="cs-hint">Protocolo: MF-{row.id.split("-").slice(0,2).join("-").toUpperCase()}</p>
      <p><strong>{row.full_name}</strong> · {row.email}</p>
      <p className="cs-proposal-body" style={{whiteSpace:"pre-wrap"}}>{row.message}</p>
      <p className="cs-hint">Recebido em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(row.created_at))}</p>
      <label className="cs-form-label">Situação
        <select value={actions[row.id]||"resolved"} onChange={e=>setActions(a=>({...a,[row.id]:e.target.value}))}>
          <option value="reviewing">Marcar em análise</option>
          <option value="resolved">Resolver solicitação</option>
          <option value="closed">Encerrar solicitação</option>
        </select>
      </label>
      <label className="cs-form-label">Registro administrativo do atendimento
        <textarea rows={3} maxLength={1200} value={notes[row.id]||""}
          onChange={e=>setNotes(a=>({...a,[row.id]:e.target.value}))}
          placeholder="Anote as medidas e eventual retorno ao solicitante."/>
      </label>
      <button type="button" className="cs-button cs-button-primary" disabled={!!busy} onClick={()=>void handleSupport(row)}>
        {busy===row.id?"Salvando...":"Registrar atendimento"}
      </button>
      <p className="cs-hint">O protocolo comprova o recebimento no sistema. Para responder ao titular, utilize o e-mail informado; este painel ainda não envia e-mails automaticamente.</p>
    </article>)}</div>}
    {!loading&&view==="settings"&&<AdminLegalSettings/>}
  </div>;
}
