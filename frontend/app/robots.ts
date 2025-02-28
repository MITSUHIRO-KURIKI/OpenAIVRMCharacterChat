import { MetadataRoute } from 'next';

const baseURL = process.env.NEXT_PUBLIC_SITE_URL as string;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow:  '/api/',
    },
    sitemap: `${baseURL}/sitemap.xml`
  };
};