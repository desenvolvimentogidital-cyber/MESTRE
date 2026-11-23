import Link from "next/link";
import {AppFrame} from "@/components/conectaserv-ui";

export const metadata={title:"Termos de Uso | MandaFazer",description:"Regras para utilização do marketplace de profissionais MandaFazer."};
export default function TermsPage(){
  return <AppFrame active="perfil" title="Termos de Uso">
    <article className="cs-card mf-legal-content">
      <span className="cs-eyebrow">Condições da plataforma</span>
      <h1>Termos de Uso</h1>
      <p className="cs-hint">Atualizados em 23 de novembro de 2026</p>
      <p>Ao utilizar o MandaFazer, você concorda com as regras abaixo. A plataforma aproxima pessoas que procuram serviços de profissionais que os oferecem, permitindo busca por categoria, pedidos, propostas, conversas e avaliações.</p>
      <h2>1. Contas e responsabilidades</h2>
      <p>Cadastre informações verdadeiras e atualizadas, mantenha sua senha em sigilo e não utilize contas de terceiros. Cada usuário é responsável pelo conteúdo publicado com sua conta. O acesso de cliente e o de profissional possuem funcionalidades diferentes.</p>
      <h2>2. Anúncios e prestação dos serviços</h2>
      <p>Profissionais devem informar somente as áreas em que realmente atuam, descrever suas qualificações com precisão e respeitar obrigações legais aplicáveis às suas atividades. Clientes devem publicar solicitações legítimas e com descrições adequadas.</p>
      <p>Orçamentos, prazos, materiais, execução, garantias e quaisquer valores negociados são combinados entre cliente e profissional. O MandaFazer atua como plataforma de aproximação, não como empregador dos profissionais e, na versão atual, não processa pagamentos ou cobra comissões dentro do aplicativo.</p>
      <h2>3. Contratação e conversas</h2>
      <p>O cliente pode aceitar ou recusar propostas. Quando um serviço é contratado, os participantes têm acesso ao canal de conversa correspondente. Não compartilhe informações confidenciais com quem não esteja envolvido no atendimento.</p>
      <h2>4. Avaliações e moderação</h2>
      <p>As avaliações devem refletir experiências reais. É proibido publicar conteúdo falso, ofensivo, discriminatório, fraudulento, ilegal ou que viole direitos de outras pessoas. Denúncias podem ser analisadas pela administração, que poderá ocultar conteúdo, recusar verificações ou suspender perfis conforme as circunstâncias.</p>
      <p>O selo de perfil conferido indica uma análise administrativa de informações fornecidas; não representa certificação governamental de identidade, licença ou capacidade técnica.</p>
      <h2>5. Segurança e condutas proibidas</h2>
      <p>É proibido tentar acessar contas ou conversas alheias, obter dados de terceiros sem autorização, manipular avaliações, explorar vulnerabilidades ou publicar conteúdo que exponha dados pessoais indevidamente.</p>
      <h2>6. Disponibilidade e alterações</h2>
      <p>A plataforma poderá passar por manutenção, correções e mudanças necessárias à segurança. Não garantimos disponibilidade ininterrupta nem um número mínimo de profissionais em cada especialidade ou região.</p>
      <h2>7. Proteção de dados e contato</h2>
      <p>Consulte a <Link href="/privacidade">Política de Privacidade</Link> para entender o tratamento de dados pessoais. Dúvidas, reclamações e solicitações podem ser enviadas pelo <Link href="/suporte">canal de atendimento com protocolo</Link>.</p>
      <h2>8. Identificação do operador</h2>
      <p>O nome comercial da plataforma é <strong>MandaFazer</strong>. A identificação jurídica completa do responsável pela operação será acrescentada antes da abertura geral ao público.</p>
      <nav className="mf-legal-actions"><Link className="cs-button cs-button-primary" href="/suporte">Falar com o suporte</Link><Link className="cs-button cs-button-outline" href="/privacidade">Política de Privacidade</Link></nav>
    </article>
  </AppFrame>;
}
