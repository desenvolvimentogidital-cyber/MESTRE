import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {ImageResponse} from "next/og";
import {createElement} from "react";

export const runtime = "nodejs";
const supportedSizes = new Set([192, 512]);

/** Render the approved MandaFazer emblem in launcher-compatible PNG sizes. */
export async function GET(
  _request: Request,
  {params}: {params: Promise<{size: string}>}
) {
  const size = Number((await params).size);
  if (!supportedSizes.has(size)) {
    return new Response("Ícone não encontrado", {status: 404});
  }
  const bytes = await readFile(join(process.cwd(),"public","mandafazer-emblema.png"));
  const width = Math.round(size*.82);
  const height = Math.round(width*1230/1278);
  const root = createElement("div",{
    style:{
      width:"100%",height:"100%",display:"flex",
      justifyContent:"center",alignItems:"center",
      backgroundColor:"#04132d",
    },
  },createElement("img",{
    src:"data:image/png;base64,"+bytes.toString("base64"),
    alt:"",
    width,height,
    style:{width,height,objectFit:"contain"},
  }));
  return new ImageResponse(root,{
    width:size,height:size,
    headers:{"Cache-Control":"public, max-age=3600, stale-while-revalidate=86400"},
  });
}
