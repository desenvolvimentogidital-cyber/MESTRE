import Link from "next/link";
import { AppFrame, Icon } from "@/components/conectaserv-ui";

export default function NotificationsPage() {
  return <AppFrame active="notificacoes" title="Notificações">
    <h1 className="cs-top-title">Notificações</h1>
    <p className="cs-hint">Aqui você acompanhará os avisos sobre seus serviços.</p>
    <div className="cs-empty">
      <Icon name="bell" size={33}/>
      <h2>Sem notificações por enquanto</h2>
      <p>Este módulo ainda está em preparação. Nenhum aviso fictício será exibido como mensagem real.</p>
      <Link href="/cliente" className="cs-button cs-button-outline">Ver meus pedidos</Link>
    </div>
  </AppFrame>;
}
