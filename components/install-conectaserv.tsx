"use client";

import {useEffect,useState} from "react";
import {Icon} from "@/components/conectaserv-ui";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: "accepted" | "dismissed"; platform: string}>;
};

export function InstallMandaFazer(){
  const [installEvent,setInstallEvent]=useState<InstallEvent|null>(null);
  const [installed,setInstalled]=useState(false);
  const [feedback,setFeedback]=useState("");

  useEffect(()=>{
    const standalone=window.matchMedia("(display-mode: standalone)").matches;
    setInstalled(standalone);
    function onPrompt(event:Event){
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    }
    function onInstalled(){
      setInstalled(true);
      setInstallEvent(null);
      setFeedback("MandaFazer instalado na tela inicial!");
    }
    window.addEventListener("beforeinstallprompt",onPrompt);
    window.addEventListener("appinstalled",onInstalled);
    return()=>{
      window.removeEventListener("beforeinstallprompt",onPrompt);
      window.removeEventListener("appinstalled",onInstalled);
    };
  },[]);

  async function install(){
    if(!installEvent)return;
    try{
      await installEvent.prompt();
      const result=await installEvent.userChoice;
      if(result.outcome==="accepted")setFeedback("Instalação aceita. Procure o ícone MandaFazer na tela inicial.");
      else setFeedback("Você pode instalar depois pelo menu do navegador.");
      setInstallEvent(null);
    }catch{
      setFeedback("Use o menu do navegador para adicionar o MandaFazer à tela inicial.");
    }
  }

  return <div className="cs-install-action">
    {installed
      ? <div className="cs-success"><Icon name="check" size={17}/> O MandaFazer já está aberto como aplicativo.</div>
      : installEvent
        ? <button className="cs-button cs-button-orange" type="button" onClick={()=>void install()}>
            <Icon name="download" size={19}/> Instalar MandaFazer no celular
          </button>
        : <div className="cs-card cs-install-guide">
            <p>Abra esta página no <strong>Google Chrome</strong>. Toque nos três pontinhos <strong>⋮</strong> e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</p>
            <p>Depois, confirme em <strong>Instalar</strong> ou <strong>Adicionar</strong>. O ícone MandaFazer ficará junto dos aplicativos do seu celular.</p>
          </div>
    }
    {feedback&&<p className="cs-hint" role="status">{feedback}</p>}
  </div>;
}
