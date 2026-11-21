import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./conectaserv.css";

export const metadata: Metadata = {
  title: "ConectaServ — Encontre. Contrate. Realize.",
  description: "A plataforma que conecta clientes a profissionais de serviços.",
  applicationName: "ConectaServ",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = {
  themeColor: "#0751c6",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
