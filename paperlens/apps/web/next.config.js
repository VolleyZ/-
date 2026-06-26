/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@paperlens/ai', '@paperlens/core', '@paperlens/db'],
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3', 'chromadb']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3', 'chromadb']
    }
    return config
  }
}

module.exports = nextConfig
