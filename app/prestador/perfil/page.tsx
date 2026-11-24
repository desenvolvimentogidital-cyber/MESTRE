import Link from "next/link";
import {redirect} from "next/navigation";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {ProviderProfileForm} from "@/components/provider-profile-form";
import {VerificationRequestForm} from "@/components/verification-request-form";
import {createClient} from "@/lib/supabase/server";

export default async function ProviderProfilePage(){
  const db=await createClient();
  const {data:{user}}=await db.auth.getUser();
  if(!user)redirect("/acesso?redirectTo=/prestador/perfil");
  const {data:profile}=await db.from("profiles").select("account_type").eq("id",user.id).maybeSingle();
  if(!profile||!["provider","both"].includes(profile.account_type))redirect("/inicio");
  const {data,error}=await db.from("provider_profiles")
    .select("display_name,bio,city,state,years_experience,is_active,is_verified,is_suspended,services").eq("user_id",user.id).maybeSingle();
  if(error||!data){
    return <AppFrame active="perfil" title="Meu perfil profissional"><div className="cs-error">Seu perfil profissional ainda não está disponível. Entre em contato com o suporte.</div></AppFrame>;
  }
  const [{data:categories},{data:selected},{data:verification}]=await Promise.all([
    db.from("service_categories").select("id,name").eq("is_active",true).order("name"),
    db.from("provider_categories").select("category_id").eq("provider_id",user.id),
    db.from("verification_requests").select("status,note,admin_note,reviewed_at").eq("provider_id",user.id).maybeSingle(),
  ]);
  return <AppFrame active="perfil" title="Meu perfil profissional">
    <Link href="/prestador" className="cs-small-link">← Voltar às oportunidades</Link>
    <div className="cs-section-head"><h1 className="cs-top-title">Apresente seu trabalho</h1></div>
    <p className="cs-hint">Informações que ajudam os clientes a conhecer você. Não publique endereço residencial ou documentos pessoais.</p>
    <ProviderProfileForm userId={user.id} initial={data} categories={categories||[]} selectedCategoryIds={(selected||[]).map(item=>item.category_id)}/>
    <div className="cs-section-head"><h2 className="cs-section-title">Verificação profissional</h2></div>
    <VerificationRequestForm initial={verification||null} isVerified={data.is_verified}/>
    <p className="cs-hint" style={{marginTop:18}}><Icon name="shield" size={14}/> O selo de perfil conferido depende de aprovação humana da equipe.</p>
  </AppFrame>;
}
