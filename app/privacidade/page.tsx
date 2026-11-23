import Link from "next/link";
import {AppFrame} from "@/components/conectaserv-ui";
import {PublicOperator} from "@/components/public-operator";

export const metadata={title:"Política de Privacidade | MandaFazer",description:"Entenda como o MandaFazer trata dados pessoais de clientes e profissionais."};
const updated="23 de novembro de 2026";
export default function PrivacyPage(){
  return <AppFrame active="perfil" title="Política de Privacidade">
    <article className="cs-card mf-legal-content">
      <span className="cs-eyebrow">Transparência e proteção de dados</span>
      <h1>Política de Privacidade</h1>
      <p className="cs-hint">Atualizada em {updated}</p>
      <p>O MandaFazer é uma plataforma para aproximar clientes e profissionais de serviços. Esta política explica quais dados são utilizados, para que são necessários e como solicitar informações ou exercer direitos relacionados aos seus dados pessoais.</p>
      <h2>1. Quem opera a plataforma e como entrar em contato</h2>
      <p>A plataforma utiliza o nome comercial <strong>MandaFazer</strong>. Os dados do responsável pela operação e seu contato oficial são publicados abaixo quando cadastrados pela administração.</p><PublicOperator/>
      <h2>2. Quais dados são tratados</h2>
      <p>Dados informados no cadastro, como nome, e-mail, tipo de conta e, quando aplicável, telefone e informações de perfil profissional; áreas de atuação, cidade e estado; informações que você publica em pedidos, propostas, avaliações e denúncias; mensagens trocadas com outros participantes; além de dados técnicos necessários à autenticação e à segurança da aplicação.</p>
      <h2>3. Finalidades do tratamento</h2>
      <p>Permitir cadastro, autenticação, localização de profissionais por categoria, publicação de pedidos, envio e aceite de propostas, conversas privadas entre participantes, avaliações, avisos dentro do aplicativo, suporte, prevenção de fraudes, verificação manual de perfis e investigação de denúncias.</p>
      <h2>4. Bases legais</h2>
      <p>Conforme a finalidade, o tratamento pode ocorrer para executar contratos ou procedimentos preliminares solicitados pelo usuário, cumprir obrigações legais, atender interesses legítimos ponderados com direitos e liberdades dos titulares ou, quando exigido, mediante consentimento específico. A aceitação dos Termos de Uso não equivale ao consentimento para todas as formas de tratamento.</p>
      <h2>5. Visibilidade e compartilhamento</h2>
      <p>Dados do perfil profissional e as informações escolhidas para publicação podem ser exibidos publicamente para facilitar a busca. Pedidos públicos são apresentados de forma resumida; mensagens privadas são acessíveis aos participantes autorizados. Dados necessários à operação são processados por fornecedores de infraestrutura, incluindo <strong>Supabase</strong> (autenticação e banco de dados) e <strong>Vercel</strong> (hospedagem do aplicativo), sujeitos aos respectivos compromissos e medidas de segurança.</p>
      <p>Para reforçar a segurança de senhas criadas ou redefinidas pelo aplicativo, o MandaFazer consulta o serviço público Pwned Passwords, da Have I Been Pwned. É enviado apenas um prefixo de cinco caracteres do hash SHA-1 para pesquisar vazamentos conhecidos; a senha completa e o hash completo não são compartilhados com esse serviço.</p>
      <h2>6. Cuidados ao publicar informações</h2>
      <p>Evite incluir documentos, senhas, números de telefone, e-mails, endereços residenciais completos ou dados sensíveis nos títulos e descrições dos pedidos. Utilize as mensagens privadas do aplicativo para combinações necessárias entre as partes.</p>
      <h2>7. Retenção e segurança</h2>
      <p>Os registros são mantidos pelo período necessário às finalidades indicadas e, quando aplicável, por prazos de conservação impostos ou permitidos pela legislação. Utilizamos autenticação, controle de acesso por perfil, restrições no banco e medidas de monitoramento. Nenhum sistema pode garantir risco zero.</p>
      <h2>8. Direitos do titular</h2>
      <p>Você pode solicitar informações sobre tratamento, confirmação, acesso, correção, anonimização ou eliminação quando cabível, portabilidade nas condições aplicáveis, informações de compartilhamento, oposição e revisão de decisões automatizadas quando previstas. Algumas solicitações exigem verificação de identidade antes de fornecer ou alterar dados.</p>
      <p>Para solicitar acesso, correção, exclusão ou informações, abra <Link href="/suporte">o canal de privacidade</Link>, selecione <strong>Privacidade e dados pessoais</strong> e guarde o protocolo fornecido. A solicitação será analisada conforme os prazos legais.</p>
      <h2>9. Crianças e adolescentes</h2>
      <p>A plataforma não foi projetada para cadastro autônomo de menores de idade. Caso identifique uso irregular ou conteúdo que afete crianças e adolescentes, comunique pelo canal de suporte.</p>
      <h2>10. Atualizações</h2>
      <p>Esta política poderá ser atualizada quando houver mudanças de funcionamento ou obrigações legais. A versão em vigor permanecerá disponível nesta página.</p>
      <nav className="mf-legal-actions"><Link className="cs-button cs-button-primary" href="/suporte">Falar sobre meus dados</Link><Link className="cs-button cs-button-outline" href="/termos">Ler Termos de Uso</Link></nav>
    </article>
  </AppFrame>;
}
