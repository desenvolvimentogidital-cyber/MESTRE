"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Icon} from "@/components/conectaserv-ui";

type DemoReport={id:number;reason:string;description:string;done:boolean};
type DemoVerification={id:number;name:string;specialty:string;decision:"pending"|"approved"|"rejected"};
const sampleReports:DemoReport[]=[
  {id:1,reason:"Divergência no serviço",description:"Exemplo fictício: cliente solicita revisão de um orçamento.",done:false},
  {id:2,reason:"Atendimento inadequado",description:"Exemplo fictício: relato encaminhado à moderação.",done:false}
];
const sampleVerifications:DemoVerification[]=[
  {id:1,name:"Profissional Exemplo",specialty:"Elétrica residencial",decision:"pending"},
  {id:2,name:"Equipe Demonstração",specialty:"Reformas e manutenção",decision:"pending"}
];

export default function AdminTestPage(){
  const [allowed,setAllowed]=useState(false);
  const [view,setView]=useState<"reports"|"verifications">("reports");
  const [reports,setReports]=useState(sampleReports);
  const [verifications,setVerifications]=useState(sampleVerifications);
  const [notice,setNotice]=useState("");
  useEffect(()=>{
    try{
      if(window.sessionStorage.getItem("mf-admin-demo")==="1"){setAllowed(true);return;}
    }catch{}
    window.location.replace("/admin");
  },[]);
  function exit(){
    try{window.sessionStorage.removeItem("mf-admin-demo");}catch{}
    window.location.assign("/admin");
  }
  function moderate(id:number){
    setReports(rows=>rows.map(row=>row.id===id?{...row,done:true}:row));
    setNotice("Teste concluído: denúncia marcada como resolvida apenas nesta tela.");
  }
  function verify(id:number,decision:"approved"|"rejected"){
    setVerifications(rows=>rows.map(row=>row.id===id?{...row,decision}:row));
    setNotice("Teste concluído: decisão simulada. Nenhuma conta real foi alterada.");
  }
  if(!allowed)return <main className="mf-admin-gate"><p>Verificando acesso de demonstração...</p></main>;
  const pendingReports=reports.filter(row=>!row.done);
  const pendingVerifications=verifications.filter(row=>row.decision==="pending");
  return <main className="mf-admin-console">
    <header className="mf-admin-topbar">
      <div className="mf-admin-ident">
        <span className="mf-admin-ident-symbol" aria-hidden="true"><Icon name="shield" size={24}/></span>
        <div><span className="mf-admin-wordmark">MandaFazer</span><small>ADMINISTRAÇÃO · TESTE</small></div>
      </div>
      <button type="button" className="mf-admin-signout" onClick={exit}><Icon name="logout" size={16}/> Sair</button>
    </header>
    <div className="mf-admin-content">
      <section className="mf-admin-demo-banner" role="status">
        <strong>AMBIENTE DE TESTE</strong>
        <p>Este é um painel demonstrativo. Os cadastros, denúncias e profissionais abaixo são fictícios. Nenhuma ação acessa ou modifica dados do Supabase. Não é uma conta administradora real.</p>
      </section>
      <div className="mf-admin-breadcrumb"><Icon name="shield" size={14}/> Demonstração <span>/</span> Gestão e segurança</div>
      <section className="mf-admin-intro">
        <div><span className="mf-admin-label">Demonstração isolada</span>
          <h1>Gestão e segurança</h1>
          <p>Teste a navegação, as filas de denúncias, as verificações e os botões de análise. Todas as ações são apenas simulações.</p>
        </div>
        <span className="mf-admin-intro-icon" aria-hidden="true"><Icon name="shield" size={43}/></span>
      </section>
      <div className="mf-admin-section-title"><span>Fila de análise · Exemplo</span></div>
      <div className="cs-card cs-admin-summary">
        <div><span className="cs-hint">Denúncias aguardando</span><strong>{pendingReports.length}</strong></div>
        <div><span className="cs-hint">Verificações pendentes</span><strong>{pendingVerifications.length}</strong></div>
      </div>
      <div className="cs-filter-tabs" role="group" aria-label="Visualização de teste" style={{marginTop:20}}>
        <button type="button" className={view==="reports"?"active":""} onClick={()=>{setView("reports");setNotice("");}}>Denúncias ({pendingReports.length})</button>
        <button type="button" className={view==="verifications"?"active":""} onClick={()=>{setView("verifications");setNotice("");}}>Verificações ({pendingVerifications.length})</button>
      </div>
      {notice&&<p className="mf-admin-demo-notice" role="status">{notice}</p>}
      {view==="reports"&&<div className="mf-admin-demo-list">
        {pendingReports.length===0&&<div className="cs-empty">Todas as denúncias fictícias foram analisadas.</div>}
        {pendingReports.map(row=><article key={row.id} className="cs-card cs-offer-form">
          <strong>{row.reason}</strong><p>{row.description}</p>
          <button type="button" className="mf-admin-demo-action" onClick={()=>moderate(row.id)}>Marcar como resolvida (simular)</button>
        </article>)}
      </div>}
      {view==="verifications"&&<div className="mf-admin-demo-list">
        {pendingVerifications.length===0&&<div className="cs-empty">Todas as verificações fictícias foram analisadas.</div>}
        {pendingVerifications.map(row=><article key={row.id} className="cs-card cs-offer-form">
          <strong>{row.name}</strong><p>{row.specialty}</p>
          <div className="mf-admin-demo-actions">
            <button type="button" className="mf-admin-demo-action" onClick={()=>verify(row.id,"approved")}>Aprovar (simular)</button>
            <button type="button" className="mf-admin-demo-action secondary" onClick={()=>verify(row.id,"rejected")}>Recusar (simular)</button>
          </div>
        </article>)}
      </div>}
      <p className="mf-admin-demo-footer-note">Este modo serve apenas para testes visuais e de interação. <Link href="/admin">A administração real continua protegida.</Link></p>
    </div>
    <footer className="mf-admin-footer">MandaFazer · Área de testes sem dados reais</footer>
  </main>;
}
