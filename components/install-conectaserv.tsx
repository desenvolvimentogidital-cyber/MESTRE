"use client";
import {Icon} from "@/components/conectaserv-ui";
import {useMandaFazerInstall,InstallInstructions} from "@/components/mandafazer-install-provider";

export function InstallConectaServ(){
  const {installed,available,ios,busy,feedback,install,manual}=useMandaFazerInstall();
  return <div className="cs-install-action">
    {installed?<div className="cs-success"><Icon name="check" size={17}/> O MandaFazer já está aberto como aplicativo.</div>:<>
      <button className="cs-button cs-button-orange" type="button" disabled={busy} onClick={()=>void install()}>
        <Icon name="download" size={19}/> {busy?"Abrindo instalação…":"Instalar MandaFazer no celular"}
      </button>
      {(!available||manual)&&<InstallInstructions ios={ios}/>}
    </>}
    {feedback&&<p className="cs-hint" role="status">{feedback}</p>}
  </div>;
}
