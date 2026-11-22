import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./conectaserv.css";
import "./mandafazer-refresh.css";

export const metadata: Metadata = {
  title: "MandaFazer — Conecta, Contrata, Resolve",
  description: "A plataforma que conecta clientes a profissionais de serviços.",
  applicationName: "MandaFazer",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {url: "/icons/192?v=3", sizes: "192x192", type: "image/png"},
      {url: "/icons/512?v=3", sizes: "512x512", type: "image/png"},
    ],
    apple: [{url: "/icons/192?v=3", sizes: "192x192", type: "image/png"}],
  },
  appleWebApp: {capable: true, title: "MandaFazer", statusBarStyle: "default"},
};
export const viewport: Viewport = {
  themeColor: "#04142b",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
