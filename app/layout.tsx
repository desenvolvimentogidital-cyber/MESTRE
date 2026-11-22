import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./conectaserv.css";

export const metadata: Metadata = {
  title: "ConectaServ — Encontre. Contrate. Realize.",
  description: "A plataforma que conecta clientes a profissionais de serviços.",
  applicationName: "ConectaServ",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {url: "/icons/192?v=3", sizes: "192x192", type: "image/png"},
      {url: "/icons/512?v=3", sizes: "512x512", type: "image/png"},
    ],
    apple: [{url: "/icons/192?v=3", sizes: "192x192", type: "image/png"}],
  },
  appleWebApp: {capable: true, title: "ConectaServ", statusBarStyle: "default"},
};
export const viewport: Viewport = {
  themeColor: "#0751c6",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
