import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://localhost:8000/api/:path*",
        },
        {
          source: "/health",
          destination: "http://localhost:8000/health",
        },
      ],
    }
  },
}

export default nextConfig
