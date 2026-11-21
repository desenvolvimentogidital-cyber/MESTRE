import {ImageResponse} from "next/og";
import {createElement} from "react";

const supportedSizes = new Set([192, 512]);

/**
 * Real PNG icons for Android's install flow. Both variants keep all the marks
 * within the maskable safe zone so circular/rounded phone icons don't crop them.
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

  const root = createElement("div", {
    style: {
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", backgroundColor: "#0751c6", color: "#fff",
      position: "relative",
    },
  }, [
    createElement("div", {
      key: "logo",
      style: {
        display: "flex", flexDirection: "row", alignItems: "center",
        justifyContent: "center", fontFamily: "Arial, sans-serif",
        fontWeight: 900, fontSize: size * .36, letterSpacing: -size * .025,
        lineHeight: 1,
      },
    }, [
      createElement("span", {key: "c", style: {color: "#fff"}}, "C"),
      createElement("span", {key: "s", style: {color: "#ff850f"}}, "S"),
    ]),
    createElement("div", {
      key: "accent",
      style: {display: "flex", width: size * .32, height: size * .025,
        backgroundColor: "#ff850f", borderRadius: size * .02,
        marginTop: size * .04},
    }),
  ]);

  return new ImageResponse(root, {
    width: size,
    height: size,
    headers: {"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"},
  });
}
