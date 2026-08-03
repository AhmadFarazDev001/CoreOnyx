import type { NextConfig } from "next";

/**
 * Next.js configuration and Content Security Policy (CSP) headers.
 * Configured to allow Next.js hot-reloading in dev and secure defaults in production.
 */
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1'
  ],
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    const scriptSrc = isDev 
      ? "'self' 'unsafe-inline' 'unsafe-eval'" 
      : "'self' 'unsafe-inline'";

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://*.googleusercontent.com https://*.blob.vercel-storage.com data:; connect-src 'self' wss://*.pusher.com https://*.pusher.com;`
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
