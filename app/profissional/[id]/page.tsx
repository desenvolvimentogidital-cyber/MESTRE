import Link from "next/link";
import {redirect} from "next/navigation";
import {ContactProfessional} from "@/components/contact-professional";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {createClient} from "@/lib/supabase/server";

type Review={id:string;rating:number;comment:string|null;created_at:string};
export default async function ProfessionalProfilePage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{iniciar?:string}>}){
  const {id}=await params;
  const {iniciar}=await searchParams;
  const db=await createClient();
  if(iniciar==="1"){
    const {data:{user}}=await db.auth.getUser();
    if(!user)redirect("/acesso?redirectTo="+encodeURIComponent("/profissional/"+encodeURIComponent(id)+"?iniciar=1"));
  }
  const {data:pro}=await db.from("provider_profiles")
    .select("user_id,display_name,bio,city,state,years_experience,is_verified,average_rating,review_count")
    .eq("user_id",id).eq("is_active",true).eq("is_suspended",false).maybeSingle();
  if(!pro)return <AppFrame active="inicio" title="Profissional">
    <div className="cs-empty"><Icon name="user" size={28}/><h2>Perfil indisponível</h2><p>Não foi possível encontrar este profissional ativo.</p>
      <Link href="/inicio" className="cs-button cs-button-outline">Voltar aos serviços</Link></div>
  </AppFrame>;
  const [{data:categories},{data:reviews}]=await Promise.all([
    db.from("provider_categories").select("category_id").eq("provider_id",id),
    db.from("reviews").select("id,rating,comment,created_at").eq("provider_id",id).eq("is_visible",true)
      .order("created_at",{ascending:false}).limit(20),
  ]);
  const categoryIds=(categories||[]).map(c=>c.category_id);
  const {data:names}=categoryIds.length
    ? await db.from("service_categories").select("name").in("id",categoryIds)
    : {data:[] as Array<{name:string}>};
  return <AppFrame active="inicio" title="Perfil profissional">
    <Link href="/inicio" className="cs-small-link">← Voltar</Link>
    <div className="cs-card cs-profile-card" style={{marginTop:17}}>
      <div className="cs-user-avatar" aria-hidden="true">👷</div>
      <h1>{pro.display_name}</h1>
      {pro.is_verified&&<span className="cs-chip"><Icon name="shield" size={15}/> Perfil conferido pela equipe</span>}
      <p style={{marginTop:9}}>{[pro.city,pro.state].filter(Boolean).join(", ")||"Região não informada"}</p>
      {pro.review_count>0?<p className="cs-rating-display"><Icon name="star" size={18}/> {Number(pro.average_rating).toFixed(1)} de 5 · {pro.review_count} avaliação(ões)</p>
        :<p className="cs-hint">Ainda sem avaliações</p>}
      {pro.years_experience!==null&&<p className="cs-hint">{pro.years_experience} ano(s) de experiência informados</p>}
    </div>
    <div className="cs-section-head"><h2 className="cs-section-title">Sobre o profissional</h2></div>
    <p className="cs-hint">{pro.bio||"O profissional ainda não adicionou uma descrição dos seus serviços."}</p>
    {(names||[]).length>0&&<div className="cs-info-list" style={{display:"flex",flexWrap:"wrap"}}>{(names||[]).map(c=><span className="cs-chip" key={c.name}>{c.name}</span>)}</div>}
    <div className="cs-section-head"><h2 className="cs-section-title">Avaliações de clientes</h2></div>
    {(reviews||[]).length===0&&<p className="cs-hint">Ainda não há avaliações de serviços concluídos.</p>}
    <div className="cs-info-list">{((reviews||[]) as Review[]).map(review=><article key={review.id} className="cs-card cs-proposal-card">
      <div className="cs-proposal-top"><span className="cs-rating-display"><Icon name="star" size={15}/> {review.rating} de 5 estrelas</span>
        <span className="cs-proposal-date">{new Intl.DateTimeFormat("pt-BR",{dateStyle:"short"}).format(new Date(review.created_at))}</span></div>
      {review.comment&&<p className="cs-proposal-body">{review.comment}</p>}
      <Link className="cs-small-link" href={"/denuncias/nova?reviewId="+encodeURIComponent(review.id)}>Denunciar avaliação</Link>
    </article>)}</div>
    <div className="cs-section-head"><h2 className="cs-section-title">Contrate com segurança</h2></div>
    <ContactProfessional providerId={id} autoStart={iniciar==="1"}/>
    <Link className="cs-button cs-button-outline" style={{marginTop:12}} href="/cliente/novo">Publicar um pedido de serviço</Link>
    <Link className="cs-small-link" style={{marginTop:17}} href={"/denuncias/nova?userId="+encodeURIComponent(pro.user_id)}>Denunciar este perfil</Link>
  </AppFrame>;
}
