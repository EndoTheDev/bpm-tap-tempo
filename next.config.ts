import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the tool lives under endothe.dev/tools/bpm-tap-tempo.
  // XOR rule from the camelot deploy: basePath set = NO strip-prefix in traefik.
  basePath: "/tools/bpm-tap-tempo",
  output: "standalone",
};

export default nextConfig;