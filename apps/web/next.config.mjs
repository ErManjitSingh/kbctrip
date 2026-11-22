import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(self), usb=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Intentionally permissive enough for GA / Meta / Clarity / Razorpay; tighten later with nonces.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://www.clarity.ms https://checkout.razorpay.com https://api.razorpay.com",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google.com https://www.facebook.com",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ['railkit'],
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
      { protocol: 'https', hostname: 'api.kbctrip.com', pathname: '/media/**' },
      { protocol: 'https', hostname: 'kbctrip.com', pathname: '/media/**' },
    ],
  },
  async rewrites() {
    const mediaHost = (
      process.env.NEXT_PUBLIC_KBC_BOOKING_API_URL ||
      process.env.KBC_BOOKING_API_URL ||
      'https://api.kbctrip.com/api'
    )
      .replace(/\/$/, '')
      .replace(/\/api$/, '');
    return [
      // Relative /media/... paths from marketplace photos → booking media host
      {
        source: '/media/:path*',
        destination: `${mediaHost}/media/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
      {
        source: '/reference/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
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
