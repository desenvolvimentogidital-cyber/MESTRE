"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import Link from "next/link";

type Topic="support"|"account"|"privacy"|"report"|"other";
const options:{value:Topic;label:string}[]=[
 {value:"support",label:"Ajuda para usar o aplicativo"},
 {value:"account",label:"Cadastro ou acesso à conta"},
 {value:"privacy",label:"Privacidade e dados pessoais"},
 {value:"report",label:"Denúncia ou segurança"},
 {value:"other",label:"Outro assunto"},
];

export function SupportForm(){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [topic,setTopic]=useState<Topic>("support");
 const [message,setMessage]=useState("");
 const [website,setWebsite]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [receipt,setReceipt]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  setBusy(true);setError("");
  try{
   const db=createClient();
   const {data,error:submissionError}=await db.rpc("submit_support_ticket",{
    p_full_name:name.trim(),p_email:email.trim(),p_topic:topic,
    p_message:message.trim(),p_website:website,
   });
   if(submissionError)throw new Error(submissionError.message);
   if(typeof data!=="string"||!/^[a-f0-9-]{36}$/i.test(data))throw new Error("Não recebemos a confirmação do protocolo.");
   setReceipt(data);
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível enviar sua solicitação.");}
  finally{setBusy(false);}
 }
 if(receipt){
  const protocol="MF-"+receipt.split("-").slice(0,2).join("-").toUpperCase();
  return <section className="cs-card mf-support-success" role="status">
   <h2>Solicitação recebida</h2>
   <p>Seu protocolo é:</p>
   <strong>{protocol}</strong>
   <p>Guarde ou tire uma captura de tela desse número. Sua mensagem foi registrada para análise da equipe. Não é necessário cadastro para enviar solicitações.</p>
   <button type="button" className="cs-button cs-button-outline" onClick={()=>{setReceipt("");setMessage("");}}>Enviar outra solicitação</button>
  </section>;
 }
 return <form onSubmit={submit} className="cs-card cs-offer-form mf-support-form">
  <p className="cs-hint">Você pode falar com a equipe mesmo sem conta. Um protocolo será exibido após o envio.</p>
  <label className="cs-form-label">Seu nome
   <input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Como podemos chamar você?"/>
  </label>
  <label className="cs-form-label">E-mail para retorno
   <input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seuemail@exemplo.com"/>
  </label>
  <label className="cs-form-label">Assunto
   <select value={topic} onChange={e=>setTopic(e.target.value as Topic)}>
    {options.map(o=><option value={o.value} key={o.value}>{o.label}</option>)}
   </select>
  </label>
  <label className="cs-form-label">Descreva sua solicitação
   <textarea required rows={5} minLength={20} maxLength={3000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Conte o que aconteceu ou qual dado deseja consultar, corrigir ou excluir."/>
  </label>
  <div aria-hidden="true" className="mf-support-honey"><label>Site<input type="text" autoComplete="off" tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
  <p className="cs-hint">Se for um pedido sobre seus dados, a equipe poderá pedir uma confirmação adicional de identidade antes de compartilhar ou alterar informações. Veja nossa <Link href="/privacidade">Política de Privacidade</Link>.</p>
  {error&&<p className="cs-error" role="alert">{error}</p>}
  <button className="cs-button cs-button-primary" type="submit" disabled={busy}>{busy?"Enviando...":"Enviar e receber protocolo"}</button>
 </form>;
}
