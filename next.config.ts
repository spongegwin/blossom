import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: [
      'placehold.co',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
    ],
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'placehold.co' },
    //   { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    // ],
  },
}

export default nextConfig
