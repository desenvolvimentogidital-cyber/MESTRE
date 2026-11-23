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
 const [confirmed,setConfirmed]=useState(false);
 const [accountBusy,setAccountBusy]=useState(false);
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
 async function fillFromMyAccount(){
  if(accountBusy)return;
  setAccountBusy(true);setError("");setSaved("");
  try{
   const db=createClient();
   const {data:{user},error:authError}=await db.auth.getUser();
   if(!user||authError||!user.email)throw new Error("Entre com sua conta administrativa para continuar.");
   const {data:profile,error:profileError}=await db.from("profiles").select("full_name").eq("id",user.id).maybeSingle();
   if(profileError)throw profileError;
   setOperatorName(profile?.full_name||"");
   setContactEmail(user.email);
   setConfirmed(false);
   setSaved("Dados da sua conta preenchidos. Confira se são os dados oficiais que deseja divulgar; nada foi publicado ainda.");
  }catch(err){setError(err instanceof Error?err.message:"Não foi possível carregar seus dados.");}
  finally{setAccountBusy(false);}
 }
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;
  if(!confirmed){setError("Confirme que os dados são oficiais e podem ser publicados.");return;}
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
  <button type="button" className="cs-button cs-button-outline" onClick={()=>void fillFromMyAccount()} disabled={loading||accountBusy||busy}>
   {accountBusy?"Carregando...":"Preencher com meus dados da conta"}
  </button>
  <p className="cs-hint">O preenchimento é apenas uma sugestão: seu nome de cadastro pode ser diferente do responsável jurídico ou da razão social. Nada é publicado até você conferir e salvar.</p>
  {loading?<p>Carregando...</p>:<form onSubmit={submit} style={{display:"grid",gap:13}}>
   <label className="cs-form-label">Nome completo do responsável ou razão social
    <input required minLength={3} maxLength={160} value={operatorName} onChange={e=>{setOperatorName(e.target.value);setConfirmed(false);}} placeholder="Responsável legal pela plataforma"/>
   </label>
   <label className="cs-form-label">E-mail oficial para contato e direitos de privacidade
    <input type="email" required maxLength={254} value={contactEmail} onChange={e=>{setContactEmail(e.target.value);setConfirmed(false);}} placeholder="E-mail atendido pelo responsável"/>
   </label>
   <label className="cs-form-label">CNPJ (somente se houver)
    <input inputMode="numeric" maxLength={18} value={cnpj} onChange={e=>{setCnpj(e.target.value);setConfirmed(false);}} placeholder="14 dígitos, opcional"/>
   </label>
   <p className="cs-hint">Não informe CPF aqui: esses dados ficarão visíveis aos visitantes. Caso opere como pessoa física, preencha apenas nome e e-mail.</p>
   <label className="mf-admin-legal-confirm"><input type="checkbox" required checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>
    <span>Confirmo que estes são os dados oficiais do responsável pelo MandaFazer e autorizo sua publicação na Política de Privacidade e nos Termos de Uso.</span>
   </label>
   {error&&<p className="cs-error" role="alert">{error}</p>}
   {saved&&<p className="cs-success" role="status">{saved}</p>}
   <button disabled={busy||!confirmed} type="submit" className="cs-button cs-button-primary">{busy?"Salvando...":"Publicar dados oficiais"}</button>
  </form>}
  <div className="mf-legal-actions">
   <Link className="cs-small-link" href="/privacidade">Ver Privacidade</Link>
   <Link className="cs-small-link" href="/termos">Ver Termos</Link>
   <Link className="cs-small-link" href="/suporte">Ver Suporte</Link>
  </div>
 </section>;
}
