import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {hasKnownLeakedPassword} from "../lib/security/password-breach.ts";

// No network calls or real passwords in these tests.
const fixture="SenhaExemploForte9876";
const hash=createHash("sha1").update(fixture,"utf8").digest("hex").toUpperCase();
const expectedPrefix="https://api.pwnedpasswords.com/range/"+hash.slice(0,5);
const suffix=hash.slice(5);
const originalFetch=globalThis.fetch;
try{
  globalThis.fetch=async (url,options)=>{
    assert.equal(url,expectedPrefix);
    assert.equal(options.headers["Add-Padding"],"true");
    assert.equal(options.method,"GET");
    assert.equal(options.cache,"no-store");
    return new Response(suffix+":82\r\n"+"F".repeat(35)+":0\r\n",{status:200});
  };
  assert.equal(await hasKnownLeakedPassword(fixture),true,"known compromised hash must be denied");

  globalThis.fetch=async()=>new Response(suffix+":0\r\n"+"A".repeat(35)+":6\r\n",{status:200});
  assert.equal(await hasKnownLeakedPassword(fixture),false,"padding entries with zero count are safe to ignore");

  globalThis.fetch=async()=>new Response("B".repeat(35)+":15\n",{status:200});
  assert.equal(await hasKnownLeakedPassword(fixture),false,"different suffixes must not be rejected");

  globalThis.fetch=async()=>new Response("Service unavailable",{status:503});
  await assert.rejects(hasKnownLeakedPassword(fixture),/unavailable/,"failed API lookup must not silently allow signup");
}finally{
  globalThis.fetch=originalFetch;
}
console.log("MandaFazer HIBP password screening: mocked leaked, clean, padding and unavailable tests passed");
