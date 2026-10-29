import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{source:"/:path*",has:[{type:"host" as const,value:"www\\.vasilismoumkas\\.com"}],destination:"https://vasilismoumkas.com/:path*",permanent:true}];
  },
  // Papaki runs the traced standalone server produced on Linux. This keeps the
  // production runtime independent from the full source tree and build toolchain.
  output: process.env.NEXT_SKIP_STANDALONE === "1" ? undefined : "standalone",
  // Browser verification runs beside the developer's normal server and needs
  // its own Next.js lock/build directory.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: {
    // Papaki shared hosting enforces a low process limit. Keep Next.js build
    // generation in a single worker so it does not fail with spawn EAGAIN.
    cpus: 1,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
