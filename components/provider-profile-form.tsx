"use client";
import {useState} from "react";
import {createClient} from "@/lib/supabase/client";

type Profile={display_name:string;bio:string|null;city:string|null;state:string|null;years_experience:number|null;is_active:boolean;is_suspended:boolean};
export function ProviderProfileForm({userId,initial,categories,selectedCategoryIds}:{userId:string;initial:Profile;categories:Array<{id:string;name:string}>;selectedCategoryIds:string[]}){
  const [name,setName]=useState(initial.display_name);
  const [bio,setBio]=useState(initial.bio||"");
  const [city,setCity]=useState(initial.city||"");
  const [state,setState]=useState(initial.state||"");
  const [years,setYears]=useState(initial.years_experience?.toString()||"");
  const [active,setActive]=useState(initial.is_active);
  const [selected,setSelected]=useState<string[]>(selectedCategoryIds);
  const [savedCategories,setSavedCategories]=useState<string[]>(selectedCategoryIds);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setMessage("");setError("");
    if(name.trim().length<3){setError("Informe um nome profissional com pelo menos 3 caracteres.");return;}
    if(years.trim()&&(!Number.isInteger(Number(years))||Number(years)<0||Number(years)>80)){setError("Informe um tempo de experiência válido.");return;}
    if(selected.length===0){setError("Selecione pelo menos uma categoria de atuação para que os clientes encontrem seu perfil.");return;}
    if(!active&&selected.some(id=>!savedCategories.includes(id))){setError("Ative seu perfil antes de adicionar novas categorias.");return;}
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
      const added=selected.filter(id=>!savedCategories.includes(id));
      const removed=savedCategories.filter(id=>!selected.includes(id));
      if(added.length){
        const {error:addError}=await db.from("provider_categories").insert(added.map(category_id=>({provider_id:userId,category_id})));
        if(addError)throw addError;
      }
      if(removed.length){
        const {error:deleteError}=await db.from("provider_categories").delete().eq("provider_id",userId).in("category_id",removed);
        if(deleteError)throw deleteError;
      }
      setSavedCategories([...selected]);
      setMessage("Perfil e áreas de atuação atualizados.");
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
    <div className="cs-form-label">Categorias de serviço
      <p className="cs-hint" style={{margin:0}}>Selecione as áreas em que você realmente atua. Os clientes que tocarem nessas categorias verão seu perfil diretamente, sem pesquisar nomes.</p>
      <div className="cs-category-checks">{categories.map(category=><label key={category.id} className="cs-category-check"><input type="checkbox" checked={selected.includes(category.id)} onChange={e=>setSelected(current=>e.target.checked?[...current,category.id]:current.filter(id=>id!==category.id))}/>{category.name}</label>)}</div>
    </div>
    <label className="cs-provider-toggle"><input type="checkbox" checked={active} disabled={initial.is_suspended} onChange={e=>setActive(e.target.checked)}/>
      <span><strong>Perfil ativo</strong><small>{initial.is_suspended?"Suspenso pela moderação; procure a equipe para solicitar revisão.":"Disponibiliza seu perfil e permite responder a pedidos publicados."}</small></span>
    </label>
    {message&&<p className="cs-success" role="status">{message}</p>}
    {error&&<p className="cs-error" role="alert">{error}</p>}
    <button className="cs-button cs-button-primary" type="submit" disabled={busy}>{busy?"Salvando...":"Salvar meu perfil"}</button>
  </form>;
}
