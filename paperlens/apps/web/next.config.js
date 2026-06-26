/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@paperlens/ai', '@paperlens/core', '@paperlens/db'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'chromadb']
    }
    return config
  }
}

module.exports = nextConfig
