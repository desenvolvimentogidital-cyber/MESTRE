"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Profile={display_name:string;bio:string|null;city:string|null;state:string|null;years_experience:number|null;is_active:boolean};
export function ProviderProfileForm({userId,initial}:{userId:string;initial:Profile}){
  const [name,setName]=useState(initial.display_name);
  const [bio,setBio]=useState(initial.bio||"");
  const [city,setCity]=useState(initial.city||"");
  const [state,setState]=useState(initial.state||"");
  const [years,setYears]=useState(initial.years_experience?.toString()||"");
  const [active,setActive]=useState(initial.is_active);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setMessage("");setError("");
    if(name.trim().length<3){setError("Informe um nome profissional com pelo menos 3 caracteres.");return;}
    if(years.trim()&&(!Number.isInteger(Number(years))||Number(years)<0||Number(years)>80)){setError("Informe um tempo de experiência válido.");return;}
    setBusy(true);
    try{
      const db=createClient();
      const {data:{user},error:authError}=await db.auth.getUser();
      if(authError||!user||user.id!==userId)throw new Error("Sua sessão expirou. Entre novamente.");
      const {data,error:updateError}=await db.from("provider_profiles").update({
        display_name:name.trim(),bio:bio.trim()||null,city:city.trim()||null,
        state:state.trim().toUpperCase()||null,years_experience:years.trim()?Number(years):null,
        is_active:active,updated_at:new Date().toISOString(),
      }).eq("user_id",userId).select("user_id").maybeSingle();
      if(updateError)throw updateError;
      if(!data)throw new Error("O perfil não foi atualizado. Verifique sua permissão.");
      setMessage("Perfil atualizado com sucesso.");
    }catch(err){setError(err instanceof Error?err.message:"Não foi possível salvar seu perfil.");}
    finally{setBusy(false);}
  }
  return <form onSubmit={submit} className="cs-card cs-offer-form">
    <label className="cs-form-label">Nome profissional ou da empresa
      <input required minLength={3} maxLength={90} value={name} onChange={e=>setName(e.target.value)}/>
    </label>
    <label className="cs-form-label">Sobre meus serviços
      <textarea rows={4} maxLength={1000} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Quais serviços você realiza? Qual sua especialidade?"/>
    </label>
    <div className="cs-form-two">
      <label className="cs-form-label">Cidade
        <input maxLength={100} value={city} onChange={e=>setCity(e.target.value)} placeholder="Ex.: Barueri"/>
      </label>
      <label className="cs-form-label">Estado
        <input maxLength={2} value={state} onChange={e=>setState(e.target.value)} placeholder="SP"/>
      </label>
    </div>
    <label className="cs-form-label">Anos de experiência
      <input type="number" min="0" max="80" step="1" inputMode="numeric" value={years} onChange={e=>setYears(e.target.value)}/>
    </label>
    <label className="cs-provider-toggle"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>
      <span><strong>Perfil ativo</strong><small>Disponibiliza seu perfil e permite responder a pedidos publicados.</small></span>
    </label>
    {message&&<p className="cs-success" role="status">{message}</p>}
    {error&&<p className="cs-error" role="alert">{error}</p>}
    <button className="cs-button cs-button-primary" type="submit" disabled={busy}>{busy?"Salvando...":"Salvar meu perfil"}</button>
  </form>;
}
