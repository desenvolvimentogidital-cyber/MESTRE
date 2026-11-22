import type {ReactNode} from "react";
import type {Metadata} from "next";
import "./admin.css";

export const metadata:Metadata={
  title:"Central Administrativa | MandaFazer",
  description:"Área privada e restrita para administração da plataforma MandaFazer.",
  robots:{index:false,follow:false,noarchive:true,nosnippet:true},
};

/** Área independente: não utiliza AppFrame nem navegação pública do marketplace. */
export default function PrivateAdminLayout({children}:{children:ReactNode}){
  return <div className="mf-admin-root">{children}</div>;
}
