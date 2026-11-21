"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {Icon} from "@/components/conectaserv-ui";

export function ReviewForm({requestId,providerId}:{requestId:string;providerId:string}){
  const [rating,setRating]=useState(0);
  const [comment,setComment]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    if(rating<1||rating>5){setError("Escolha de uma a cinco estrelas.");return;}
    setBusy(true);
    try{
      const db=createClient();
      const {data:auth,error:authError}=await db.auth.getUser();
      if(authError||!auth.user)throw new Error("Sua sessão expirou. Faça login novamente.");
      const {error:insertError}=await db.from("reviews").insert({
        request_id:requestId,client_id:auth.user.id,provider_id:providerId,
        rating,comment:comment.trim()||null,
      });
      if(insertError){
        if(insertError.code==="23505")throw new Error("Este serviço já foi avaliado.");
        throw insertError;
      }
      router.replace("/cliente");
      router.refresh();
    }catch(err){setError(err instanceof Error?err.message:"Não foi possível registrar a avaliação.");}
    finally{setBusy(false);}
  }
  return <form onSubmit={submit} className="cs-card cs-offer-form">
    <label className="cs-form-label">Como foi a qualidade do serviço?</label>
    <div className="cs-stars-input" role="group" aria-label="Escolha de uma a cinco estrelas">
      {[1,2,3,4,5].map(value=><button key={value} type="button"
        aria-label={value+" estrela"+(value>1?"s":"")} aria-pressed={rating===value}
        onClick={()=>setRating(value)} className={value<=rating?"selected":""}>
        <Icon name="star" size={30}/></button>)}
    </div>
    <span className="cs-hint">{rating===0?"Toque nas estrelas":rating+" de 5 estrelas"}</span>
    <label className="cs-form-label">Conte como foi sua experiência (opcional)
      <textarea rows={5} maxLength={1000} value={comment} onChange={e=>setComment(e.target.value)}
        placeholder="Pontualidade, qualidade, atendimento e resultado do serviço."/>
    </label>
    <p className="cs-hint">Sua avaliação ficará visível para outros clientes e poderá ser denunciada se violar as regras da plataforma.</p>
    {error&&<p role="alert" className="cs-error">{error}</p>}
    <button type="submit" className="cs-button cs-button-orange" disabled={busy||rating===0}>{busy?"Enviando...":"Publicar avaliação"}</button>
  </form>;
}
