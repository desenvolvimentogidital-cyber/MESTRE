"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type IconName = "home" | "briefcase" | "bell" | "user" | "search" | "bolt" | "drop" | "sparkle" | "hammer" | "arrow" | "chevron" | "moon" | "sun" | "heart" | "shield" | "menu" | "camera" | "star" | "check" | "location" | "clock" | "logout" | "mail" | "lock";

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
  };
  return <svg {...common}>{shape[name]}</svg>;
}

export function Brand({ compact = false, centered = false }: { compact?: boolean; centered?: boolean }) {
  return <Link href="/" className={"cs-brand" + (centered ? " centered" : "")} aria-label="ConectaServ, página inicial">
    <svg className="cs-mark" viewBox="0 0 90 80" role="img" aria-label="Símbolo ConectaServ">
      <path d="M11 51C8 31 24 16 47 8L80 35H65L46 20C28 29 18 44 18 57Z" fill="#0752c5"/>
      <path d="M43 10 57 2l28 26-8 7-27-23Z" fill="#102958"/>
      <path d="M68 8h9v20h-9Z" fill="#102958"/>
      <path d="M25 65C41 46 57 44 83 53 58 53 43 67 12 72Z" fill="#ff8417"/>
      <path d="M35 57c1-10 6-18 13-19 8 1 12 8 12 19l-12 8Z" fill="#12376c"/>
      <path d="M40 33a8 8 0 0 1 16 0v7H40Z" fill="#ff9818"/>
      <path d="M38 38h20" stroke="#102958" strokeWidth="3"/>
    </svg>
    {!compact && <span className="cs-brand-word"><strong>Conecta<span>Serv</span></strong><small>Encontre. Contrate. Realize.</small></span>}
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

export function AppHeader({ title }: { title?: string }) {
  return <header className="cs-app-head">
    {title ? <Link href="/inicio" className="cs-back">‹</Link> : <Brand compact />}
    <strong>{title || "ConectaServ"}</strong>
    <ThemeSwitch />
  </header>;
}

export function BottomNav({ active }: { active: "inicio" | "propostas" | "notificacoes" | "perfil" }) {
  const tabs = [
    { id: "inicio", href: "/inicio", name: "Início", icon: "home" },
    { id: "propostas", href: "/propostas", name: "Propostas", icon: "briefcase" },
    { id: "notificacoes", href: "/notificacoes", name: "Notificações", icon: "bell" },
    { id: "perfil", href: "/perfil", name: "Perfil", icon: "user" },
  ] as const;
  return <nav className="cs-bottom-nav" aria-label="Navegação principal">
    {tabs.map(tab => <Link key={tab.id} href={tab.href} className={"cs-tab" + (active === tab.id ? " active" : "")} aria-current={active === tab.id ? "page" : undefined}><Icon name={tab.icon} size={22}/><span>{tab.name}</span></Link>)}
  </nav>;
}

export function AppFrame({ children, active, title }: { children: React.ReactNode; active: "inicio" | "propostas" | "notificacoes" | "perfil"; title?: string }) {
  return <main className="cs-app"><AppHeader title={title}/><section className="cs-app-body">{children}</section><BottomNav active={active}/></main>;
}

export function FeaturePhoto({ kind = "builder", className = "" }: { kind?: "builder" | "camera"; className?: string }) {
  const src = kind === "builder"
    ? "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=950&q=82"
    : "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=950&q=82";
  return <div className={"cs-feature-photo " + className}><img src={src} alt={kind === "builder" ? "Profissional da construção civil trabalhando" : "Serviço de câmera de segurança"}/></div>;
}
