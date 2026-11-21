import Link from "next/link";
import { Brand, FeaturePhoto, Icon, ThemeSwitch } from "@/components/conectaserv-ui";

export default function Home() {
  return <main className="cs-splash-shell">
    <header className="cs-splash-header">
      <Brand />
      <ThemeSwitch />
    </header>
    <div className="cs-splash-main">
      <div className="cs-splash-copy">
        <span className="cs-eyebrow">A plataforma que conecta você</span>
        <h1>O profissional certo, <span>para o serviço que você precisa.</span></h1>
        <p>Serviços ao seu alcance, de forma simples e rápida. Encontre profissionais, compare propostas e escolha com confiança.</p>
        <div className="cs-splash-actions">
          <Link href="/inicio" className="cs-button cs-button-primary">Começar <Icon name="arrow" size={18}/></Link>
          <Link href="/acesso" className="cs-button cs-button-outline">Entrar na minha conta</Link>
        </div>
      </div>
      <div className="cs-splash-art">
        <FeaturePhoto kind="builder"/>
        <div className="cs-splash-overlay"><Icon name="shield"/> Encontre. Contrate. Realize.</div>
      </div>
    </div>
    <footer className="cs-splash-foot">ConectaServ · Seu próximo serviço começa aqui</footer>
  </main>;
}
