import Link from "next/link";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {SupportForm} from "@/components/support-form";

export const metadata={title:"Suporte e Privacidade | MandaFazer",description:"Fale com o MandaFazer, relate problemas e solicite seus dados com protocolo."};
export default function SupportPage(){
 return <AppFrame active="perfil" title="Suporte MandaFazer">
  <section className="mf-page-heading">
   <span className="cs-eyebrow">Canal de atendimento</span>
   <h1 className="cs-top-title">Fale com o MandaFazer</h1>
   <p>Envie dúvidas, problemas de cadastro, relatos de segurança ou solicitações de privacidade. O atendimento fornece um número de protocolo.</p>
  </section>
  <SupportForm/>
  <div className="cs-card" style={{marginTop:16}}>
   <p className="cs-hint"><Icon name="shield" size={16}/> Não publique senhas, documentos ou dados sensíveis neste formulário.</p>
   <nav className="mf-legal-actions"><Link href="/privacidade" className="cs-small-link">Política de Privacidade</Link><Link href="/termos" className="cs-small-link">Termos de Uso</Link></nav>
  </div>
 </AppFrame>;
}
