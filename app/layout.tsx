import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mestre — Serviços perto de você",
  description: "Encontre profissionais de confiança ou divulgue seus serviços no Mestre.",
  applicationName: "Mestre",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#10251f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
