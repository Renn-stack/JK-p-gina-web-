import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = ({ site: astroSite }) => {
  const sitemap = new URL('/sitemap.xml', astroSite ?? site.url).href;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /pago/confirmacion/\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
