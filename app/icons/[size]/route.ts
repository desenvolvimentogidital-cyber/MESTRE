import {ImageResponse} from "next/og";
import {createElement} from "react";
import {mestreIconJpeg} from "@/lib/assets/mestre-original-icon";

const supportedSizes = new Set([192, 512]);

/**
 * The uploaded Mestre logo, not the generic "CS" placeholder.
 * Render as PNG for Android installability; margin keeps the emblem within
 * the rounded-square / maskable launcher icon crop.
 */
export async function GET(
  _request: Request,
  {params}: {params: Promise<{size: string}>}
) {
  const {size: requestedSize} = await params;
  const size = Number(requestedSize);
  if (!supportedSizes.has(size)) {
    return new Response("Ícone não encontrado", {status: 404});
  }
  const root = createElement("div",{
    style:{
      width:"100%",height:"100%",display:"flex",
      justifyContent:"center",alignItems:"center",
      backgroundColor:"#04132d",
    },
  },createElement("img",{
    src:"data:image/jpeg;base64,"+mestreIconJpeg,
    alt:"",
    width:Math.round(size*.92),
    height:Math.round(size*.92),
    style:{
      display:"flex",width:Math.round(size*.92),
      height:Math.round(size*.92),objectFit:"contain",
      borderRadius:Math.round(size*.18),
    },
  }));
  return new ImageResponse(root,{
    width:size,height:size,
    headers:{"Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"},
  });
}
