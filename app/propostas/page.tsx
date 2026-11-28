"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/client";
import {ProposalDecision} from "@/components/proposal-decision";

type Proposal={
  id:string;request_id:string;provider_id:string;status:string;
  amount:number|null;message:string;created_at:string;estimated_days:number|null;title?:string;providerName?:string;
};
type Tab="all"|"sent"|"accepted";
type Role="client"|"provider";
const statusName:Record<string,string>={sent:"Pendente",accepted:"Contratada",rejected:"Recusada",withdrawn:"Retirada"};
const money=(n:number)=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);

export default function ProposalsPage(){
  const router=useRouter();
  const [tab,setTab]=useState<Tab>("all");
  const [role,setRole]=useState<Role>("client");
  const [received,setReceived]=useState<Proposal[]>([]);
  const [sent,setSent]=useState<Proposal[]>([]);
  const [chats,setChats]=useState<Record<string,string>>({});
  const [busy,setBusy]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    let mounted=true;
    async function load(){
      try{
        const db=createClient();
        const {data:auth,error:authError}=await db.auth.getUser();
        if(authError||!auth.user){router.replace("/acesso?redirectTo=/propostas");return;}
        const userId=auth.user.id;
        const {data:profile,error:profileError}=await db.from("profiles").select("account_type").eq("id",userId).maybeSingle();
        if(profileError)throw profileError;
        if(profile?.account_type!=="client"&&profile?.account_type!=="provider"){
          router.replace("/inicio");return;
        }
        const currentRole:Role=profile.account_type;
        if(mounted)setRole(currentRole);
        if(currentRole!=="provider"){
          const {data:requests,error:requestError}=await db.from("service_requests").select("id,title").eq("client_id",userId);
          if(requestError)throw requestError;
          if((requests||[]).length){
            const {data:proposals,error:proposalError}=await db.from("proposals")
              .select("id,request_id,provider_id,status,amount,message,created_at,estimated_days")
              .in("request_id",(requests||[]).map(r=>r.id)).order("created_at",{ascending:false});
            if(proposalError)throw proposalError;
            const titles=Object.fromEntries((requests||[]).map(r=>[r.id,r.title]));
            const offerList=(proposals||[]) as Proposal[];
            const providers=[...new Set(offerList.map(p=>p.provider_id))];
            const {data:providerProfiles}=providers.length
              ? await db.from("provider_profiles").select("user_id,display_name").in("user_id",providers)
              : {data:[] as Array<{user_id:string;display_name:string}>};
            const names=Object.fromEntries((providerProfiles||[]).map(p=>[p.user_id,p.display_name]));
            if(mounted)setReceived(offerList.map(p=>({...p,title:titles[p.request_id],providerName:names[p.provider_id]})));
          }
        }
        if(currentRole!=="client"){
          const {data:proposals,error:proposalError}=await db.from("proposals")
            .select("id,request_id,provider_id,status,amount,message,created_at,estimated_days")
            .eq("provider_id",userId).order("created_at",{ascending:false});
          if(proposalError)throw proposalError;
          let final=(proposals||[]) as Proposal[];
          if(final.length){
            const {data:requests}=await db.from("service_requests").select("id,title").in("id",[...new Set(final.map(p=>p.request_id))]);
            const titles=Object.fromEntries((requests||[]).map(r=>[r.id,r.title]));
            final=final.map(p=>({...p,title:titles[p.request_id]}));
          }
          if(mounted)setSent(final);
        }
        const {data:conversations,error:convoError}=await db.from("conversations")
          .select("id,request_id,provider_id").or("client_id.eq."+userId+",provider_id.eq."+userId);
        if(!convoError&&mounted){setChats(Object.fromEntries((conversations||[]).map(chat=>[chat.request_id+":"+chat.provider_id,chat.id])));}
      }catch(err){if(mounted)setError(err instanceof Error?err.message:"Não foi possível carregar as propostas.");}
      finally{if(mounted)setBusy(false);}
    }
    load();
    return()=>{mounted=false;};
  },[router]);
  const isSent=role==="provider";
  const data=isSent?sent:received;
  const filtered=useMemo(()=>data.filter(p=>tab==="all"||(tab==="accepted"?p.status==="accepted":p.status==="sent")),[data,tab]);
  function handleDecision(proposalId:string,requestId:string,action:"accept"|"reject",chatId:string|null){
    setReceived(current=>current.map(p=>{
      if(p.id===proposalId)return {...p,status:action==="accept"?"accepted":"rejected"};
      if(action==="accept"&&p.request_id===requestId&&p.status==="sent")return {...p,status:"rejected"};
      return p;
    }));
    if(chatId){const proposal=received.find(p=>p.id===proposalId);if(proposal)setChats(current=>({...current,[requestId+":"+proposal.provider_id]:chatId}));}
  }
  return <AppFrame title="Minhas Propostas" active="propostas">
    <div className="mf-page-heading">
      <span className="cs-eyebrow">{isSent?"Área do profissional":"Área do cliente"}</span>
      <h1 className="cs-top-title">{isSent?"Meus orçamentos":"Minhas propostas"}</h1>
      <p>{isSent?"Gerencie os orçamentos enviados aos clientes.":"Tudo sobre seus orçamentos, do pedido à contratação."}</p>
    </div>
    {!busy&&!error&&<div className="mf-proposal-metrics" aria-label="Resumo das propostas">
      <span>Propostas<strong>{data.length}</strong></span>
      <span>Pendentes<strong>{data.filter(p=>p.status==="sent").length}</strong></span>
      <span>Contratadas<strong>{data.filter(p=>p.status==="accepted").length}</strong></span>
    </div>}
    <div className="cs-filter-tabs" role="group" aria-label="Filtrar por situação">
      <button type="button" className={tab==="all"?"active":""} onClick={()=>setTab("all")}>Todas ({data.length})</button>
      <button type="button" className={tab==="sent"?"active":""} onClick={()=>setTab("sent")}>Pendentes</button>
      <button type="button" className={tab==="accepted"?"active":""} onClick={()=>setTab("accepted")}>Contratadas</button>
    </div>
    {busy&&<p className="cs-hint">Carregando propostas...</p>}
    {error&&<p role="alert" className="cs-error">{error}</p>}
    {!busy&&!error&&filtered.length===0&&<div className="cs-empty">
      <Icon name="briefcase" size={29}/>
      <h2>{tab==="all"?"Ainda não há propostas":"Nenhuma proposta nesta categoria"}</h2>
      <p>{isSent?"Suas propostas enviadas aos clientes aparecerão aqui.":"Quando profissionais responderem aos seus pedidos, os orçamentos aparecerão aqui."}</p>
      <Link className="cs-button cs-button-primary" href={isSent?"/prestador":"/cliente/novo"}>{isSent?"Encontrar pedidos":"Publicar pedido"}</Link>
    </div>}
    {!busy&&!error&&filtered.map(proposal=><article className="cs-card cs-proposal-card" key={proposal.id}>
      <div className="cs-proposal-top">
        <div><h3>{proposal.title||"Pedido de serviço"}</h3>{!isSent&&<p className="cs-hint" style={{margin:"5px 0"}}>Profissional: {proposal.providerName||"Profissional cadastrado"}</p>}<span className="cs-proposal-date">{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short"}).format(new Date(proposal.created_at))}</span></div>
        <span className={"cs-status "+proposal.status}>{statusName[proposal.status]||proposal.status}</span>
      </div>
      <strong className="cs-price">{proposal.amount===null?"Sob consulta":money(proposal.amount)}</strong>
      <p className="cs-proposal-body">{proposal.message}</p>
      <div className="cs-proposal-bottom">
        <span className="cs-hint">{proposal.estimated_days!==null?"Prazo: "+proposal.estimated_days+" dia(s)":"Prazo a combinar"}</span>
        <Link href={proposal.status==="accepted"
          ? (chats[proposal.request_id+":"+proposal.provider_id]?"/conversas/"+encodeURIComponent(chats[proposal.request_id+":"+proposal.provider_id]):"/conversas")
          : isSent?(proposal.status==="sent"?"/prestador/pedido/"+encodeURIComponent(proposal.request_id):"/oportunidades/"+encodeURIComponent(proposal.request_id)):"/cliente#pedido-"+encodeURIComponent(proposal.request_id)} className="cs-small-link">
          {proposal.status==="accepted"?"Abrir conversa":"Ver pedido"} <Icon name="chevron" size={15}/>
        </Link>
      </div>
      {!isSent&&proposal.status==="sent"&&<ProposalDecision proposalId={proposal.id} requestTitle={proposal.title||"serviço"}
        onDecided={(action,chatId)=>handleDecision(proposal.id,proposal.request_id,action,chatId)}/>}
    </article>)}
  </AppFrame>;
}
