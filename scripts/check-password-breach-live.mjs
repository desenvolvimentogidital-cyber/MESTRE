import {hasKnownLeakedPassword} from "../lib/security/password-breach.ts";

// Fixture is a publicly known, compromised example password, never a real user secret.
// Optional CI integration probe: the source controls and unit tests do not depend on
// the public API's availability; this detects an upstream outage separately.
const leaked=await hasKnownLeakedPassword("password123456");
if(!leaked)throw new Error("Public Pwned Passwords check did not detect the fixture");
console.log("Pwned Passwords integration: external k-anonymity lookup confirmed");
