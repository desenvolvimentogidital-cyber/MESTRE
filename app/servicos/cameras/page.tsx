import Link from "next/link";
import { AppFrame, FeaturePhoto, Icon } from "@/components/conectaserv-ui";

export default function CamerasPage() {
  return <AppFrame active="inicio" title="Detalhes do serviço">
    <div className="cs-detail">
      <div className="cs-service-hero"><FeaturePhoto kind="camera"/><span className="cs-service-photo-label"><Icon name="camera" size={15}/> Segurança e câmeras</span></div>
      <span className="cs-chip"><Icon name="shield" size={14}/> Categoria: segurança</span>
      <h1>Instalação de câmeras de segurança</h1>
      <p>Encontre profissionais para instalação, configuração e manutenção de sistemas de câmeras. Descreva o local e o tipo de serviço para receber propostas personalizadas.</p>
      <h2>Valor do serviço</h2>
      <div className="cs-price">Sob orçamento</div>
      <p>O valor depende da quantidade de câmeras, dos equipamentos e da instalação. Não há preço ou avaliação fictícia nesta página.</p>
      <h2>Como funciona?</h2>
      <div className="cs-info-list">
        <div className="cs-list-card cs-card"><span className="cs-list-icon"><Icon name="briefcase"/></span><div><h3>Publique seu pedido</h3><p>Conte o que precisa e indique sua cidade.</p></div></div>
        <div className="cs-list-card cs-card"><span className="cs-list-icon"><Icon name="mail"/></span><div><h3>Receba propostas</h3><p>Profissionais podem responder com preço e prazo.</p></div></div>
        <div className="cs-list-card cs-card"><span className="cs-list-icon"><Icon name="check"/></span><div><h3>Compare e escolha</h3><p>Acompanhe a contratação no seu perfil.</p></div></div>
      </div>
      <Link href="/cliente/novo" className="cs-button cs-button-primary">Solicitar orçamento <Icon name="arrow"/></Link>
    </div>
  </AppFrame>;
}
