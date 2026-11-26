import Link from "next/link";
import {AppFrame,Icon} from "@/components/conectaserv-ui";
import {InstallConectaServ} from "@/components/install-conectaserv";

export default function InstallPage(){
  return <AppFrame active="inicio" title="Instalar MandaFazer">
    <div className="cs-install-heading">
      <img className="cs-install-icon" src="/icons/192?v=20261126-3" alt="Ícone MandaFazer com casa e capacete" width={94} height={94}/>
      <span className="cs-eyebrow">Acesso rápido no celular</span>
      <h1 className="cs-top-title">MandaFazer no seu celular</h1>
      <p className="cs-hint">Abra como um aplicativo, sem precisar digitar o endereço do site toda vez.</p>
    </div>
    <InstallConectaServ/>
    <div className="cs-card cs-install-guide" style={{marginTop:17}}>
      <h2 className="cs-section-title">Como funciona depois de instalar?</h2>
      <p><Icon name="check" size={17}/> Você abre pelo ícone na tela inicial.</p>
      <p><Icon name="check" size={17}/> Cadastro, serviços, propostas e mensagens continuam conectados à sua conta.</p>
      <p><Icon name="check" size={17}/> Quando publicarmos novas versões no site, elas ficam disponíveis ao abrir ou atualizar o aplicativo.</p>
      <p><Icon name="shield" size={17}/> É necessário ter internet para utilizar as funcionalidades.</p>
    </div>
    <Link href="/acesso" className="cs-button cs-button-primary" style={{marginTop:18,width:"100%"}}>Entrar ou criar conta <Icon name="arrow" size={18}/></Link>
    <Link href="/inicio" className="cs-small-link" style={{display:"flex",justifyContent:"center",marginTop:14}}>Conhecer os serviços</Link>
  </AppFrame>;
}
