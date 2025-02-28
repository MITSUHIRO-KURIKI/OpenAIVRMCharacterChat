// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata, Viewport } from 'next';

// metadata ▽
export const metadataConfig: Metadata = {
    // base
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL as string),
    title: {
      default:  process.env.NEXT_PUBLIC_SITE_NAME as string,
      template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME as string}`,
    },
    description: '*****',
    keywords:    ['*****'],
    // alternates
    alternates: {
      canonical: '/',
      languages: {
        'ja-JP': '/',
        'en-US': '/en',
      },
    },
    // icons
    icons: {
      icon: [
        { url: '/icon.png' },
        { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
        new URL('/icon.png', process.env.NEXT_PUBLIC_SITE_URL as string),
      ],
      shortcut: ['/shortcut-icon.png'],
      apple: [
        { url: '/apple-icon.png' },
        { url: '/apple-icon-x3.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'apple-touch-icon-precomposed', url: '/apple-touch-icon-precomposed.png',},
      ],
    },
    // OGP
    openGraph: {
      siteName:    process.env.NEXT_PUBLIC_SITE_NAME as string,
      type:        'website',
      locale:      'ja_JP',
      title:       process.env.NEXT_PUBLIC_SITE_NAME as string,
      description: '*****',
      images:      '/ogp-default.png',
    },
    twitter: {
      card:        'summary_large_image',
      title:       process.env.NEXT_PUBLIC_SITE_NAME as string,
      description: '*****',
      images:      '/ogp-default.png',
    },
    // formatDetection
    formatDetection: {
      email:     false,
      address:   false,
      telephone: false,
    },
    // authors
    creator:   'K.Mitsuhiro',
    publisher: 'K.Mitsuhiro',
    authors:   [{ name: 'K.Mitsuhiro', url: 'https://github.com/MITSUHIRO-KURIKI' },],
    // other
    other: {
      // safari
      'mobile-web-app-capable':                ['yes'],
      'apple-mobile-web-app-status-bar-style': ['black-translucent'],
      // Skype
      'SKYPE_TOOLBAR': ['SKYPE_TOOLBAR_PARSER_COMPATIBLE'],
    },
  }; 
  export const viewportConfig: Viewport = {
    width:        'device-width, shrink-to-fit=no, minimal-ui',
    initialScale: 1,
    viewportFit:  'cover',
    maximumScale: 1,
    userScalable: false,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#001E28' },
      { media: '(prefers-color-scheme: dark)',  color: '#001E28' },
    ],
  }
  // metadata △