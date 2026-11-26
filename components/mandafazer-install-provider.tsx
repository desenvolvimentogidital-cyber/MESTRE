"use client";

import {createContext,useContext,useEffect,useRef,useState,type ReactNode} from "react";
import {usePathname} from "next/navigation";

type InstallEvent=Event & {
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>;
};
type InstallWindow=Window & {__mfInstallEvent?:InstallEvent};
type InstallState={
  installed:boolean; available:boolean; ios:boolean; busy:boolean;
  feedback:string; install:()=>Promise<void>; manual:boolean;
};
const InstallContext=createContext<InstallState|null>(null);
export function useMandaFazerInstall(){
  const state=useContext(InstallContext);
  if(!state)throw new Error("Missing MandaFazer installation provider");
  return state;
}
export function InstallInstructions({ios}:{ios:boolean}){
  return <div className="mf-install-instructions">
    {ios?<p>No Safari, toque em <strong>Compartilhar</strong>, escolha <strong>Adicionar à Tela de Início</strong> e confirme em <strong>Adicionar</strong>.</p>:
      <p>Abra o site no <strong>Google Chrome</strong> (fora de outros aplicativos), toque nos três pontos <strong>⋮</strong> e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</p>}
    <p>O MandaFazer precisa de internet para acessar sua conta e os serviços.</p>
  </div>;
}
export function MandaFazerInstallProvider({children}:{children:ReactNode}){
  const pathname=usePathname();
  const eventRef=useRef<InstallEvent|null>(null);
  const [available,setAvailable]=useState(false);
  const [installed,setInstalled]=useState(false);
  const [mobile,setMobile]=useState(false);
  const [ios,setIos]=useState(false);
  const [busy,setBusy]=useState(false);
  const [manual,setManual]=useState(false);
  const [feedback,setFeedback]=useState("");
  const [show,setShow]=useState(false);
  useEffect(()=>{
    const w=window as InstallWindow;
    const standalone=window.matchMedia("(display-mode: standalone)");
    const detectInstalled=()=>standalone.matches||Boolean((navigator as Navigator & {standalone?:boolean}).standalone);
    const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
    const isMobile=isIOS||/Android|Mobile/i.test(navigator.userAgent)||(window.matchMedia("(max-width: 820px)").matches&&navigator.maxTouchPoints>0);
    setInstalled(detectInstalled());setMobile(isMobile);setIos(isIOS);
    function capture(e:Event){
      e.preventDefault();eventRef.current=e as InstallEvent;setAvailable(true);setManual(false);
    }
    if(w.__mfInstallEvent){eventRef.current=w.__mfInstallEvent;setAvailable(true);}
    function onInstalled(){
      eventRef.current=null;delete w.__mfInstallEvent;setAvailable(false);setInstalled(true);setShow(false);setFeedback("MandaFazer instalado!");
    }
    function onModeChange(){if(detectInstalled())onInstalled();}
    window.addEventListener("beforeinstallprompt",capture);
    window.addEventListener("appinstalled",onInstalled);
    standalone.addEventListener("change",onModeChange);
    let dismissed=false;try{dismissed=sessionStorage.getItem("mf-install-dismissed")==="1";}catch{}
    if(isMobile&&!detectInstalled()&&!dismissed)setShow(true);
    if("serviceWorker" in navigator&&window.isSecureContext){
      void navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{ /* browser may disallow installation */ });
    }
    return()=>{
      window.removeEventListener("beforeinstallprompt",capture);
      window.removeEventListener("appinstalled",onInstalled);
      standalone.removeEventListener("change",onModeChange);
    };
  },[]);
  function close(){
    setShow(false);try{sessionStorage.setItem("mf-install-dismissed","1");}catch{}
  }
  async function install(){
    if(installed||busy)return;
    const w=window as InstallWindow;
    const event=eventRef.current||w.__mfInstallEvent;
    if(!event){setManual(true);setFeedback("");return;}
    setBusy(true);setFeedback("");setManual(false);
    eventRef.current=null;delete w.__mfInstallEvent;setAvailable(false);
    try{
      await event.prompt();
      const choice=await event.userChoice;
      if(choice.outcome==="accepted"){setFeedback("Instalação solicitada. Confirme no navegador e procure o ícone na tela inicial.");close();}
      else{setFeedback("Você pode instalar quando quiser.");setManual(true);}
    }catch{setManual(true);setFeedback("O navegador não abriu a instalação automática. Siga as instruções abaixo.");}
    finally{setBusy(false);}
  }
  const popup=mobile&&show&&!installed&&pathname!=="/instalar"&&!pathname?.startsWith("/admin");
  return <InstallContext.Provider value={{installed,available,ios,busy,feedback,install,manual}}>
    {children}
    {popup&&<aside className="mf-install-popup" role="region" aria-label="Instalar MandaFazer">
      <button className="mf-install-close" type="button" aria-label="Fechar aviso de instalação" onClick={close}>×</button>
      <div className="mf-install-popup-title">
        <img src="/icons/192?v=20261126-3" alt="" width={58} height={58}/>
        <div><strong>Baixe o MandaFazer</strong><p>Deseja instalar o aplicativo no seu celular?</p></div>
      </div>
      <button type="button" className="mf-install-now" disabled={busy} onClick={()=>void install()}>{busy?"Abrindo instalação…":"Instalar aplicativo"}</button>
      {manual&&<InstallInstructions ios={ios}/>}
      {feedback&&<p role="status">{feedback}</p>}
      <button type="button" className="mf-install-later" onClick={close}>Agora não</button>
    </aside>}
  </InstallContext.Provider>;
}
