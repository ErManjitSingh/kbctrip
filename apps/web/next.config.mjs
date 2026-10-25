import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Image hosts copied from Unotrips next.config.ts (pixel-same media sources).
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
      { protocol: 'https', hostname: 'website.travelwithuno.com', pathname: '/**' },
      { protocol: 'https', hostname: 'travelwithuno.com', pathname: '/**' },
      { protocol: 'https', hostname: 'unotrips.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.unotrips.com', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.unotrips.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.vecteezy.com', pathname: '/**' },
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.thrillophilia.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media1.thrillophilia.com', pathname: '/**' },
      { protocol: 'https', hostname: 'instahimachal.com', pathname: '/**' },
      { protocol: 'https', hostname: 'navbharattourism.com', pathname: '/**' },
      { protocol: 'https', hostname: 'trailblazertours.com', pathname: '/**' },
      { protocol: 'https', hostname: 'unpluggedlife.in', pathname: '/**' },
      { protocol: 'https', hostname: 'www.orchidhotel.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.maritim.com', pathname: '/**' },
      { protocol: 'https', hostname: 't4.ftcdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 's7ap1.scene7.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.indianexpress.com', pathname: '/**' },
      { protocol: 'https', hostname: 'static.justwravel.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.lehladakhindia.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/media/**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': root,
    };
    return config;
  },
};

export default nextConfig;
