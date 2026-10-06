import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the tool lives under endothe.dev/tools/check-bpm.
  // XOR rule from the camelot deploy: basePath set = NO strip-prefix in traefik.
  basePath: "/tools/check-bpm",
  output: "standalone",
};

export default nextConfig;