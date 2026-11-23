import {createHash} from "node:crypto";

/**
 * Application-level breach screening for the Supabase Free project.
 * Sends only the first five SHA-1 hexadecimal characters to HIBP's public
 * k-anonymity endpoint. NEVER send the full password or complete hash.
 *
 * This protects this application's signup and reset flows but does NOT
 * replace the Supabase Auth provider's Pro-only leaked-password setting.
 */
export async function hasKnownLeakedPassword(password:string):Promise<boolean>{
  const sha1=createHash("sha1").update(password,"utf8").digest("hex").toUpperCase();
  const prefix=sha1.slice(0,5);
  const remainder=sha1.slice(5);
  const response=await fetch("https://api.pwnedpasswords.com/range/"+prefix,{
    method:"GET",
    headers:{
      "Add-Padding":"true",
      "User-Agent":"MandaFazer-Auth-Security/1.0",
    },
    cache:"no-store",
    signal:AbortSignal.timeout(6000),
  });
  if(!response.ok)throw new Error("Breach lookup unavailable");
  const range=await response.text();
  // HIBP returns a list of matching hash suffixes and integer counts.
  return range.split(/\r?\n/).some(line=>{
    const separator=line.indexOf(":");
    if(separator!==35)return false;
    return line.slice(0,separator).toUpperCase()===remainder &&
      Number(line.slice(separator+1).trim())>0;
  });
}
