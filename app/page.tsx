import Link from "next/link";
import {Brand,Icon,ThemeSwitch} from "@/components/conectaserv-ui";

const serviceLinks=[
  {icon:"home" as const,label:"Reformas e manutenção",query:"reforma"},
  {icon:"hammer" as const,label:"Instalações",query:"instalação"},
  {icon:"bolt" as const,label:"Elétrica",query:"eletricista"},
  {icon:"drop" as const,label:"Hidráulica",query:"encanador"},
];

export default function Home(){
  return <main className="cs-splash-shell cs-splash-v2">
    <header className="cs-splash-header">
      <Brand/>
      <ThemeSwitch/>
    </header>
    <div className="cs-splash-main">
      <div className="cs-splash-copy">
        <div className="cs-hero-eyebrow"><span/> A plataforma que conecta você <span/></div>
        <h1>O profissional certo, <span>para o serviço que você precisa.</span></h1>
        <p>Serviços ao seu alcance, de forma simples e rápida. Encontre profissionais, compare propostas e escolha com confiança.</p>
        <div className="cs-splash-benefits" aria-label="Como o MandaFazer ajuda você">
          <div><Icon name="shield" size={21}/><span>Perfis e<br/>avaliações</span></div>
          <div><Icon name="bolt" size={21}/><span>Propostas<br/>no app</span></div>
          <div><Icon name="lock" size={21}/><span>Conversa<br/>privada</span></div>
        </div>
        <div className="cs-splash-actions">
          <Link href="/inicio" className="cs-button cs-button-primary">Começar <Icon name="arrow" size={20}/></Link>
          <Link href="/acesso" className="cs-button cs-button-outline">Entrar na minha conta</Link>
          <Link href="/instalar" className="cs-small-link cs-install-quick"><Icon name="download" size={19}/> Colocar na tela inicial do celular</Link>
        </div>
      </div>
      <div className="cs-splash-art" aria-label="Profissionais e serviços disponíveis no MandaFazer">
        <div className="cs-hero-photo">
          <img src="https://images.pexels.com/photos/3932291/pexels-photo-3932291.jpeg?auto=compress&dpr=1&h=750&w=1260"
            alt="Profissional da construção civil com capacete de segurança" width={820} height={610}
            decoding="async" fetchPriority="high"/>
        </div>
        <div className="cs-hero-orbit" aria-hidden="true"/>
        <div className="cs-hero-service-panel">
          {serviceLinks.map(service=><Link key={service.label} href={"/profissionais?q="+encodeURIComponent(service.query)}>
            <Icon name={service.icon} size={17}/>
            <span>{service.label}</span>
          </Link>)}
          <Link className="cs-hero-more" href="/profissionais">e muito mais...</Link>
        </div>
      </div>
    </div>
    <footer className="cs-splash-foot"><span>MandaFazer · Seu próximo serviço começa aqui</span></footer>
  </main>;
}
