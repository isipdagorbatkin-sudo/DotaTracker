import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "steamcommunity.com" },
      { protocol: "https", hostname: "avatars.steamstatic.com" },
      { protocol: "https", hostname: "api.opendota.com" },
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
}

export default nextConfig
