const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
const BACKEND_API_URL      = process.env.BACKEND_API_URL;

const staticParsedUrl        = new URL(NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
const backendStaticParsedUrl = new URL(process.env.NEXT_PUBLIC_BACKEND_STATIC_URL ?? 'http://localhost:8000');
const backendMediaParsedUrl  = new URL(process.env.NEXT_PUBLIC_BACKEND_MEDIA_URL  ?? 'http://localhost:8000');

const nextConfig = {
  images: {
    // https://nextjs.org/docs/app/api-reference/components/image#remotepatterns
    remotePatterns: [
      {
        protocol: staticParsedUrl.protocol.replace(':', ''), 
        hostname: staticParsedUrl.hostname,
        port:     staticParsedUrl.port || '',
        pathname: '**',
        search:   '',
      }, {
        protocol: backendStaticParsedUrl.protocol.replace(':', ''), 
        hostname: backendStaticParsedUrl.hostname,
        port:     backendStaticParsedUrl.port || '',
        pathname: backendStaticParsedUrl.pathname.replace(/\/$/, '')+'/**',
        search:   '',
      }, {
        protocol: backendMediaParsedUrl.protocol.replace(':', ''), 
        hostname: backendMediaParsedUrl.hostname,
        port:     backendMediaParsedUrl.port || '',
        pathname: backendMediaParsedUrl.pathname.replace(/\/$/, '')+'/**',
        search:   '',
      },
    ],
  },
  poweredByHeader: false, // 'x-powered-by ヘッダーを無効化
  devIndicators: {
    appIsrStatus: false,  // Static Route インジケーター(非表示は非推奨)
  },
  reactStrictMode: false, // true: 冪等性を確認. 2回 Effect が動く(本番は自動で false )
  trailingSlash:   false,
};

module.exports = {
  ...nextConfig,
  async rewrites() {
    return [
      {
        // /backendapi はバックエンドへ
        // Django側 APPEND_SLASH=True に注意
        source:      '/backendapi/:path*',
        destination: `${BACKEND_API_URL}/backendapi/:path*/`,
      },
    ]
  },
};