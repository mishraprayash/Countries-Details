import { MetadataRoute } from 'next';
import { getAllCountries } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://world-insights.vercel.app';
  
  // Get all countries for dynamic routes
  const countries = await getAllCountries().catch(() => []);
  
  // Create static routes
  const routes = [
    '',
    '/countries',
    '/compare',
    '/quiz',
    '/favorites',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Create dynamic routes for countries
  const countryRoutes = countries.map((country) => ({
    url: `${baseUrl}/country/${encodeURIComponent(country.name.common.toLowerCase())}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...countryRoutes];
}