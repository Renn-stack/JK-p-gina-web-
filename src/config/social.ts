import { site } from './site';
import type { Name } from '../components/icon-names';

const defs: { key: keyof typeof site.social; label: string; icon: Name }[] = [
  { key: 'facebook', label: 'Facebook', icon: 'facebook' },
  { key: 'instagram', label: 'Instagram', icon: 'instagram' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
  { key: 'x', label: 'X', icon: 'x' },
];

/** Solo las redes que tienen URL configurada. */
export const socialLinks = defs
  .filter((d) => site.social[d.key])
  .map((d) => ({ ...d, href: site.social[d.key] as string }));
