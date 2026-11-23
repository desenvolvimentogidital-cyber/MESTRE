"use client";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import Link from "next/link";

type Operator={operator_name:string|null;contact_email:string|null;cnpj:string|null};
export function PublicOperator(){
 const [info,setInfo]=useState<Operator|null>(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{
  let active=true;
  try{
   const db=createClient();
   void db.from("site_legal_settings").select("operator_name,contact_email,cnpj").eq("id",1).maybeSingle()
    .then(({data})=>{if(active){setInfo((data||null) as Operator|null);setLoaded(true);}})
    .catch(()=>{if(active)setLoaded(true);});
  }catch{setLoaded(true);}
  return()=>{active=false;};
 },[]);
 if(!loaded)return <p className="cs-hint">Consultando dados do operador...</p>;
 if(!info?.operator_name||!info?.contact_email)return <p className="cs-hint">A identificação jurídica do responsável pela plataforma está em preparação e será divulgada antes da abertura geral. Por enquanto, as solicitações podem ser registradas pelo <Link href="/suporte">canal de atendimento com protocolo</Link>.</p>;
 return <div className="mf-operator-public">
  <p><strong>Responsável pela operação:</strong> {info.operator_name}</p>
  {info.cnpj&&<p><strong>CNPJ:</strong> {info.cnpj}</p>}
  <p><strong>Contato oficial:</strong> <a href={"mailto:"+info.contact_email}>{info.contact_email}</a></p>
  <p><Link href="/suporte">Enviar solicitação com protocolo</Link></p>
 </div>;
}
