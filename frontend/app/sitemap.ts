import { MetadataRoute } from 'next';

// // 一覧を取得できる関数
// import { getDynamic } from '@/lib/dynamic';
// interface Dynamic {
//   slug:         string;
//   title:        string;
//   description?: string;
//   createdAt:    string;
// }
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL       = process.env.NEXT_PUBLIC_SITE_URL as string;
  const _lastModified = new Date();
  // staticPaths
  const staticPaths: MetadataRoute.Sitemap = [
    {
      url:             `${baseURL}`,
      lastModified:    _lastModified,
			changeFrequency: 'yearly', // always, hourly, daily, weekly, monthly, yearly, never
			priority:         1.0,
    },
    {
      url:             `${baseURL}/login`,
      lastModified:    _lastModified,
			changeFrequency: 'yearly',
			priority:         0.5,
    },
  ];
  // 他にあれば追加
 
  // // 動的ページ
  // dynamic = await getDynamic();
  // const dynamicPaths = dynamic.map((item: Dynamic) => {
  //   return {
  //       url:             `${baseURL}/dynamic/${item.slug}`,
  //       lastModified:    new Date(item.createdAt),
  //       changeFrequency: 'daily' as const,
  //       priority:         0.5,
  //   };
  // });
	// return [...staticPaths, ...dynamicPaths];

  return [...staticPaths];
};