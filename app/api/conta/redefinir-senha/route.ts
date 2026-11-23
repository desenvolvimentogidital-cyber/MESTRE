import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {hasKnownLeakedPassword} from "@/lib/security/password-breach";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=20;

const noStore={"Cache-Control":"private, no-store"};
function reply(error:string,status:number){return NextResponse.json({error},{status,headers:noStore});}

/**
 * Account-scoped password update. Requires a valid Supabase session,
 * then screens the new password without disclosing it to a third party.
 */
export async function POST(request:NextRequest){
  if(!(request.headers.get("content-type")||"").includes("application/json"))return reply("Envie os dados solicitados.",415);
  let body:unknown;
  try{
    const raw=await request.text();
    if(raw.length>700)return reply("Dados inválidos.",413);
    body=JSON.parse(raw);
  }catch{return reply("Dados inválidos.",400);}
  if(!body||typeof body!=="object"||Array.isArray(body))return reply("Dados inválidos.",400);
  const {password}=body as Record<string,unknown>;
  if(typeof password!=="string"||password.length<10||password.length>128||!/[a-zA-ZÀ-ÿ]/.test(password)||!/[0-9]/.test(password)){
    return reply("A senha precisa de 10 a 128 caracteres, incluindo letras e números.",400);
  }
  try{
    const db=await createClient();
    const {data:{user},error:authError}=await db.auth.getUser();
    if(!user||authError)return reply("Sua sessão expirou. Abra novamente o link de recuperação enviado por e-mail.",401);
    try{
      if(await hasKnownLeakedPassword(password))return reply("Essa senha já apareceu em vazamentos de dados. Escolha uma senha diferente e única.",422);
    }catch{return reply("A verificação de segurança está temporariamente indisponível. Tente novamente.",503);}
    const {error}=await db.auth.updateUser({password});
    if(error)return reply("Não foi possível alterar sua senha. Confira sua sessão e tente novamente.",422);
    return NextResponse.json({ok:true},{status:200,headers:noStore});
  }catch{return reply("Não foi possível verificar sua sessão. Tente novamente.",503);}
}
