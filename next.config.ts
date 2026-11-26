import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/icons/*": ["./public/mandafazer-emblema.png"] },
};

export default nextConfig;
