
import type {NextConfig} from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // IMPORTANT: this MUST stay explicitly set. The Firebase App Hosting Next.js
    // adapter rewrites next.config at build time and injects `unoptimized: true`
    // whenever neither `images.unoptimized` nor `images.loader` is defined:
    //   https://github.com/firebase/apphosting-adapters/blob/main/packages/%40apphosting/adapter-nextjs/src/overrides.ts
    // With that injected, /_next/image 404s in production and every <Image>
    // degrades to a bare <img src="<full-res original>"> with no srcset — which is
    // what pushed the mobile LCP to ~8.5s. Setting it explicitly opts back in.
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    // Originals in Firebase Storage are named by upload timestamp, so a replaced
    // image always gets a new URL — a long optimizer cache is safe.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Optimized output is immutable for a given (url, w, q) triple.
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
