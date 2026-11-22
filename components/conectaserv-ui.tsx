"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {MessageUnreadBadge} from "@/components/message-unread-badge";
import {createClient} from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type IconName = "home" | "briefcase" | "bell" | "user" | "search" | "bolt" | "drop" | "sparkle" | "hammer" | "arrow" | "chevron" | "moon" | "sun" | "heart" | "shield" | "menu" | "camera" | "star" | "check" | "location" | "clock" | "logout" | "mail" | "lock" | "download" | "wind" | "scissors" | "truck" | "leaf" | "wrench" | "layers";

export function Icon({ name, size = 21 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const shape: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-8h6v8" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12c5 4 13 4 18 0"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    bolt: <path d="m13 2-9 12h7l-1 8 10-12h-7l0-8Z"/>,
    drop: <path d="M12 2C8 8 5 11 5 15a7 7 0 0 0 14 0c0-4-3-7-7-13Z"/>,
    sparkle: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></>,
    hammer: <><path d="m14 6 4-4 4 4-4 4zM14 6l-3 3m0 0 3 3L6 20a2 2 0 0 1-3-3l8-8Z"/></>,
    arrow: <><path d="M4 12h16m-6-6 6 6-6 6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    moon: <path d="M20 15.5A9 9 0 0 1 8.5 4a9 9 0 1 0 11.5 11.5Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    shield: <><path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4Z"/><path d="m8.5 12 2.5 2.5 5-5"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    camera: <><rect x="3" y="6" width="18" height="15" rx="2"/><circle cx="12" cy="13" r="3"/><path d="m8 6 1-3h6l1 3"/></>,
    star: <path d="m12 2 3.2 6.5 7.2 1-5.2 5.1 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1L12 2Z"/>,
    check: <path d="m4 12 5 5L20 6"/>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></>,
    logout: <><path d="M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5M14 7l5 5-5 5M19 12H9"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></>,
    wind: <><path d="M3 8h11a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 16h7a3 3 0 1 1-3 3"/></>,
    scissors: <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 8.2 20 20M14.3 10.4 20 4M8.2 15.8 13 11"/></>,
    truck: <><path d="M2 6h13v11H2zM15 10h4l3 4v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    leaf: <><path d="M20 4C10 4 4 9 4 16a4 4 0 0 0 4 4c7 0 12-6 12-16Z"/><path d="M4 20c2-4 6-7 11-10"/></>,
    wrench: <><path d="M14 7a5 5 0 0 0-7 7l-4 4a2 2 0 0 0 3 3l4-4a5 5 0 0 0 7-7l-4 4-3-3 4-4Z"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
  };
  return <svg {...common}>{shape[name]}</svg>;
}

export function Brand({ compact = false, centered = false }: { compact?: boolean; centered?: boolean }) {
  return <Link href="/" className={"cs-brand cs-brand-mandafazer"+(compact?" compact":"")+(centered?" centered":"")}
    aria-label="MandaFazer, página inicial">
    <img src="/mandafazer-logo.avif?v=20261122" width={780} height={204}
      className="cs-brand-banner" alt="MandaFazer — Conecta, Contrata, Resolve"
      decoding="async" />
  </Link>;
}

export function ThemeSwitch() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      const enabled = localStorage.getItem("conectaserv-theme") === "dark";
      setDark(enabled);
      document.documentElement.dataset.theme = enabled ? "dark" : "light";
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("conectaserv-theme", next ? "dark" : "light"); } catch { /* Private browsing */ }
  }
  return <button type="button" className="cs-icon-button" onClick={toggle} aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"} title={dark ? "Tema claro" : "Tema escuro"}><Icon name={dark ? "sun" : "moon"}/></button>;
}

function HeaderMenu(){
  return <details className="mf-v1-header-menu">
    <summary aria-label="Abrir menu do aplicativo" title="Menu"><Icon name="menu" size={23}/></summary>
    <nav aria-label="Menu do aplicativo" className="mf-v1-header-popover">
      <Link href="/inicio"><Icon name="home" size={17}/> Início</Link>
      <Link href="/profissionais"><Icon name="search" size={17}/> Encontrar profissionais</Link>
      <Link href="/oportunidades"><Icon name="briefcase" size={17}/> Pedidos publicados</Link>
      <Link href="/painel"><Icon name="layers" size={17}/> Meu painel</Link>
      <Link href="/propostas"><Icon name="layers" size={17}/> Propostas</Link>
      <Link href="/conversas"><Icon name="mail" size={17}/> Minhas conversas</Link>
      <Link href="/perfil"><Icon name="user" size={17}/> Minha conta</Link>
    </nav>
  </details>;
}

export function AppHeader({ title }: { title?: string }) {
  return <header className="cs-app-head mf-v1-header">
    <HeaderMenu/>
    <Brand compact/>
    {title&&<span className="cs-visually-hidden">{title}</span>}
    <ThemeSwitch/>
  </header>;
}

type NavSection="inicio"|"propostas"|"notificacoes"|"conversas"|"perfil";
type NavRole="loading"|"guest"|"client"|"provider";
type NavTab={id:NavSection|"buscar"|"pedidos"|"acesso";href:string;name:string;icon:IconName};

export function BottomNav({active}:{active:NavSection}){
  const [role,setRole]=useState<NavRole>("loading");
  const pathname=usePathname();
  useEffect(()=>{
    let live=true;
    const db=createClient();
    async function resolveRole(){
      const {data:auth}=await db.auth.getUser();
      if(!live)return;
      if(!auth.user){setRole("guest");return;}
      const {data:profile}=await db.from("profiles").select("account_type").eq("id",auth.user.id).maybeSingle();
      if(!live)return;
      setRole(profile?.account_type==="client"?"client":profile?.account_type==="provider"?"provider":"guest");
    }
    void resolveRole();
    return()=>{live=false;};
  },[]);
  if(role==="loading")return <nav className="cs-bottom-nav cs-bottom-nav-loading" aria-label="Carregando menu"><span className="cs-hint">Carregando seu menu...</span></nav>;
  const tabs:NavTab[]=role==="client"?
    [
      {id:"inicio",href:"/inicio",name:"Início",icon:"home"},
      {id:"pedidos",href:"/cliente",name:"Meus pedidos",icon:"briefcase"},
      {id:"conversas",href:"/conversas",name:"Mensagens",icon:"mail"},
      {id:"perfil",href:"/perfil",name:"Meu perfil",icon:"user"},
    ]:role==="provider"?
    [
      {id:"inicio",href:"/inicio",name:"Início",icon:"home"},
      {id:"pedidos",href:"/prestador",name:"Oportunidades",icon:"briefcase"},
      {id:"conversas",href:"/conversas",name:"Mensagens",icon:"mail"},
      {id:"perfil",href:"/perfil",name:"Meu perfil",icon:"user"},
    ]:[
      {id:"inicio",href:"/inicio",name:"Início",icon:"home"},
      {id:"buscar",href:"/profissionais",name:"Profissionais",icon:"search"},
      {id:"pedidos",href:"/oportunidades",name:"Pedidos",icon:"briefcase"},
      {id:"acesso",href:"/acesso",name:"Entrar",icon:"user"},
    ];
  return <nav className="cs-bottom-nav" aria-label={role==="provider"?"Navegação profissional":role==="client"?"Navegação do cliente":"Navegação pública"}>
    {tabs.map(tab=>{
      const selected=pathname===tab.href ||
        (tab.href==="/cliente"&&pathname?.startsWith("/cliente/")) ||
        (tab.href==="/prestador"&&pathname?.startsWith("/prestador/")&&!pathname?.startsWith("/prestador/perfil")) ||
        (tab.href==="/perfil"&&pathname==="/prestador/perfil");
      return <Link key={tab.id} href={tab.href}
        className={"cs-tab"+(selected?" active":"")}
        aria-current={selected?"page":undefined}>
      <span className="cs-nav-icon-wrap">
        <Icon name={tab.icon} size={22}/>
        {tab.id==="conversas"&&<MessageUnreadBadge/>}
      </span>
      <span>{tab.name}</span>
    </Link>})}
  </nav>;
}

export function AppFrame({children,active,title}:{
  children:React.ReactNode;active:NavSection;title?:string;
}){
  return <main className="cs-app"><AppHeader title={title}/>
    <section className="cs-app-body">{children}</section>
    <BottomNav active={active}/>
  </main>;
}

export function FeaturePhoto({ kind = "builder", className = "" }: { kind?: "builder" | "camera"; className?: string }) {
  const src = kind === "builder"
    ? "https://images.pexels.com/photos/3932291/pexels-photo-3932291.jpeg?auto=compress&dpr=1&h=750&w=1260"
    : "https://images.unsplash.com/photo-1676630656246-3047520adfdf?auto=format&fit=crop&w=1080&q=85";
  return <div className={"cs-feature-photo " + className}><img src={src} loading={kind === "builder" ? "eager" : "lazy"} decoding="async" alt={kind === "builder" ? "Profissional de construção com capacete e uniforme" : "Técnico instalando câmera de segurança em uma parede"}/></div>;
}
