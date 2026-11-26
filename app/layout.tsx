import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./conectaserv.css";
import "./mandafazer-refresh.css";
import "./mandafazer-premium.css";
import "./mandafazer-image-one.css";
import "./mandafazer-install.css";
import {MandaFazerInstallProvider} from "@/components/mandafazer-install-provider";

export const metadata: Metadata = {
  title: "MandaFazer — Conecta, Contrata, Resolve",
  description: "A plataforma que conecta clientes a profissionais de serviços.",
  applicationName: "MandaFazer",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {url: "/icons/192?v=20261126-3", sizes: "192x192", type: "image/png"},
      {url: "/icons/512?v=20261126-3", sizes: "512x512", type: "image/png"},
    ],
    apple: [{url: "/icons/192?v=20261126-3", sizes: "192x192", type: "image/png"}],
  },
  appleWebApp: {capable: true, title: "MandaFazer", statusBarStyle: "default"},
};
export const viewport: Viewport = {
  themeColor: "#04142b",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" suppressHydrationWarning>
    <head>
      <script id="mf-install-boot" dangerouslySetInnerHTML={{__html:"window.addEventListener(\x27beforeinstallprompt\x27,function(e){e.preventDefault();window.__mfInstallEvent=e});window.addEventListener(\x27appinstalled\x27,function(){delete window.__mfInstallEvent})"}}/>
      <script id="mf-theme-boot" dangerouslySetInnerHTML={{__html:
        "try{document.documentElement.dataset.theme=localStorage.getItem('conectaserv-theme')==='dark'?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}"
      }}/>
    </head>
    <body><MandaFazerInstallProvider>{children}</MandaFazerInstallProvider></body>
  </html>;
}
