import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Páginas públicas indexables. Agrega aquí nuevas páginas. */
const pages = [
  { path: '/', priority: '1.0' },
  { path: '/servicios/', priority: '0.9' },
  { path: '/asesoria/', priority: '0.9' },
  { path: '/nosotros/', priority: '0.7' },
  { path: '/contacto/', priority: '0.8' },
  { path: '/pago/', priority: '0.5' },
];

export const GET: APIRoute = ({ site: astroSite }) => {
  const base = astroSite ?? new URL(site.url);
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map(
      (p) =>
        `  <url>\n    <loc>${new URL(p.path, base).href}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${p.priority}</priority>\n  </url>`,
    )
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
