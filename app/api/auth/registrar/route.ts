import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";

export const dynamic="force-dynamic";
export const maxDuration=30;

const allowedRoles=new Set(["client","provider"]);
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function authMessage(message:string,code:string|undefined,status:number|undefined){
  const m=message.toLowerCase(),c=(code||"").toLowerCase();
  if(c.includes("email_address_not_authorized")||m.includes("email address not authorized")||m.includes("email not authorized")){
    return "O Supabase ainda exige envio de e-mail. Para liberar cadastro imediato, desative Confirm email em Authentication > Providers > Email no painel Supabase.";
  }
  if(status===429||c.includes("rate_limit")||m.includes("rate limit"))return "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.";
  if(c.includes("email_exists")||m.includes("already registered"))return "Não foi possível cadastrar este e-mail. Se já tiver conta, entre ou recupere sua senha.";
  if(c.includes("weak_password")||m.includes("weak password")||m.includes("password should"))return "Escolha uma senha mais forte, com pelo menos 8 caracteres.";
  if(c.includes("email")||m.includes("invalid email"))return "Confira o endereço de e-mail informado.";
  if(status===500||m.includes("database error"))return "O cadastro falhou no servidor de autenticação. Tente novamente; se persistir, informe ao suporte.";
  return "O cadastro não pôde ser concluído agora. Confira os dados e tente novamente.";
}

export async function POST(request:NextRequest){
  const contentType=request.headers.get("content-type")||"";
  if(!contentType.includes("application/json"))return NextResponse.json({error:"Envie os dados do formulário."},{status:415});
  let input:unknown;
  try{
    const raw=await request.text();
    if(raw.length>4000)return NextResponse.json({error:"Dados muito extensos."},{status:413});
    input=JSON.parse(raw);
  }catch{return NextResponse.json({error:"Dados inválidos."},{status:400});}
  if(typeof input!=="object"||!input||Array.isArray(input))return NextResponse.json({error:"Dados inválidos."},{status:400});
  const body=input as Record<string,unknown>;
  const name=typeof body.name==="string"?body.name.trim():"";
  const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
  const password=typeof body.password==="string"?body.password:"";
  const role=typeof body.type==="string"?body.type:"";
  if(name.length<2||name.length>100)return NextResponse.json({error:"Informe seu nome completo (2 a 100 caracteres)."},{status:400});
  if(email.length>254||!emailPattern.test(email))return NextResponse.json({error:"Confira o e-mail informado."},{status:400});
  if(password.length<10||password.length>128||!/[a-zA-ZÀ-ÿ]/.test(password)||!/[0-9]/.test(password))return NextResponse.json({error:"A senha precisa ter 10 a 128 caracteres, incluindo letras e números."},{status:400});
  if(body.acceptedTerms!==true)return NextResponse.json({error:"Leia e aceite os Termos de Uso antes de criar sua conta."},{status:400});
  if(!allowedRoles.has(role))return NextResponse.json({error:"Escolha cliente ou profissional."},{status:400});

  try{
    const db=await createClient();
    const {data,error}=await db.auth.signUp({
      email,password,options:{
        data:{full_name:name,account_type:role,terms_version:"2026-11-23",terms_acknowledged_at:new Date().toISOString()},
      },
    });
    if(error){
      // Avoid logging email or password; report only the Supabase error classification.
      console.error("conectaserv signup failure",{code:error.code||"unknown",status:error.status||500});
      const mapped=authMessage(error.message,error.code,error.status);
      return NextResponse.json({error:mapped},{status:error.status===429?429:422});
    }
    if(!data.user)return NextResponse.json({error:"O servidor não confirmou a criação da conta. Tente novamente."},{status:502});
    const confirmed=Boolean(data.session);
    return NextResponse.json({
      ok:true,
      sessionReady:confirmed,
      message:confirmed?"Conta criada! Acessando o ConectaServ...":"O Supabase ainda está exigindo confirmação de e-mail. Desative Confirm email no painel do projeto para permitir entrar imediatamente, sem e-mail.",
    },{status:201,headers:{"Cache-Control":"no-store"}});
  }catch(err){
    console.error("conectaserv signup unexpected error",err instanceof Error?err.name:"unknown");
    return NextResponse.json({error:"Não foi possível conectar ao cadastro. Verifique a internet e tente novamente."},{status:503});
  }
}
