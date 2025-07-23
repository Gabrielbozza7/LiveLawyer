import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.REAL_BACKEND_URL}:path*`,
      },
    ]
  },
}

export default nextConfig
