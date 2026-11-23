"use client";
import {useEffect,useState} from "react";
import {createClient} from "@/lib/supabase/client";
import Link from "next/link";

export function AdminLegalSettings(){
 const [operatorName,setOperatorName]=useState("");
 const [contactEmail,setContactEmail]=useState("");
 const [cnpj,setCnpj]=useState("");
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [saved,setSaved]=useState("");
 useEffect(()=>{
  let active=true;
  async function load(){
   try{
    const db=createClient();
    const {data,error:e}=await db.from("site_legal_settings").select("operator_name,contact_email,cnpj").eq("id",1).maybeSingle();
    if(!active)return;
    if(e)throw e;
    setOperatorName(data?.operator_name||"");
    setContactEmail(data?.contact_email||"");
    setCnpj(data?.cnpj||"");
   }catch{
    if(active)setError("Não foi possível carregar as informações públicas do responsável.");
   }finally{if(active)setLoading(false);}
  }
  void load();
  return()=>{active=false;};
 },[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  setBusy(true);setError("");setSaved("");
  try{
   const db=createClient();
   const {data,error:saveError}=await db.rpc("admin_update_site_legal_settings",{
    p_operator_name:operatorName.trim(),p_contact_email:contactEmail.trim(),p_cnpj:cnpj.trim()||null,
   });
   if(saveError)throw saveError;
   if(data!==true)throw new Error("Não foi possível confirmar a atualização.");
   setSaved("Dados oficiais atualizados. Já podem aparecer nas páginas públicas de Privacidade e Termos.");
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível salvar os dados.");}
  finally{setBusy(false);}
 }
 return <section className="cs-card cs-offer-form mf-admin-legal-settings">
  <h2>Identificação do operador</h2>
  <p className="cs-hint">Essas informações serão públicas e fazem parte das condições para abrir o MandaFazer a novos usuários. Cadastre os dados verdadeiros do responsável pela plataforma.</p>
  {loading?<p>Carregando...</p>:<form onSubmit={submit} style={{display:"grid",gap:13}}>
   <label className="cs-form-label">Nome completo do responsável ou razão social
    <input required minLength={3} maxLength={160} value={operatorName} onChange={e=>setOperatorName(e.target.value)} placeholder="Responsável legal pela plataforma"/>
   </label>
   <label className="cs-form-label">E-mail oficial para contato e direitos de privacidade
    <input type="email" required maxLength={254} value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="E-mail atendido pelo responsável"/>
   </label>
   <label className="cs-form-label">CNPJ (somente se houver)
    <input inputMode="numeric" maxLength={18} value={cnpj} onChange={e=>setCnpj(e.target.value)} placeholder="14 dígitos, opcional"/>
   </label>
   <p className="cs-hint">Não informe CPF aqui: esses dados ficarão visíveis aos visitantes. Caso opere como pessoa física, preencha apenas nome e e-mail.</p>
   {error&&<p className="cs-error" role="alert">{error}</p>}
   {saved&&<p className="cs-success" role="status">{saved}</p>}
   <button disabled={busy} type="submit" className="cs-button cs-button-primary">{busy?"Salvando...":"Publicar dados oficiais"}</button>
  </form>}
  <div className="mf-legal-actions">
   <Link className="cs-small-link" href="/privacidade">Ver Privacidade</Link>
   <Link className="cs-small-link" href="/termos">Ver Termos</Link>
   <Link className="cs-small-link" href="/suporte">Ver Suporte</Link>
  </div>
 </section>;
}
