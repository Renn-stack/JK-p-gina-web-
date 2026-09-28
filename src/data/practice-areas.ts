/**
 * ÁREAS DE PRÁCTICA Y SERVICIOS
 *
 * Lista oficial de áreas y servicios de LJ Jurídico.
 * No agregues servicios que el despacho no haya confirmado.
 * Los `slug` se usan en URLs (/servicios#slug, /asesoria?area=slug), no los cambies sin revisar enlaces.
 */

export type IconName =
  | 'administrative'
  | 'corporate'
  | 'ip'
  | 'family'
  | 'civil'
  | 'criminal'
  | 'medical';

export interface Service {
  slug: string;
  name: string;
}

export interface PracticeArea {
  slug: string;
  number: string;
  name: string;
  summary: string;
  icon: IconName;
  services: Service[];
}

const s = (slug: string, name: string): Service => ({ slug, name });

export const practiceAreas: PracticeArea[] = [
  {
    slug: 'administrativo-regulatorio',
    number: '01',
    name: 'Administrativo y Regulatorio',
    summary:
      'Defensa frente a multas, sanciones y resoluciones de autoridades, y acompañamiento en trámites, permisos y concesiones.',
    icon: 'administrative',
    services: [
      s('fotoinfracciones', 'Cancelación de fotoinfracciones'),
      s('multas-sat', 'Impugnación y cancelación de multas del SAT'),
      s('multas-imss', 'Impugnación y cancelación de multas del IMSS'),
      s('multas-guardia-nacional', 'Impugnación y cancelación de multas de la Guardia Nacional'),
      s('multas-profeco', 'Impugnación y cancelación de multas de PROFECO'),
      s('multas-cofepris', 'Impugnación y cancelación de multas de COFEPRIS'),
      s('asuntos-sict', 'Asuntos ante la SICT'),
      s('permisos-concesiones', 'Permisos y concesiones'),
      s('transporte-federal', 'Transporte federal'),
      s('recursos-revisiones', 'Recursos y revisiones'),
      s('impugnacion-resoluciones', 'Impugnación de resoluciones'),
      s('defensa-derechos', 'Defensa de derechos'),
    ],
  },
  {
    slug: 'corporativo-empresarial',
    number: '02',
    name: 'Corporativo y Empresarial',
    summary:
      'Estructura jurídica para tu empresa, atención de conflictos entre socios o terceros y recuperación de adeudos.',
    icon: 'corporate',
    services: [
      s('constitucion-sociedades', 'Constitución y estructuración de sociedades'),
      s('conflictos-empresariales', 'Conflictos empresariales'),
      s('recuperacion-cartera', 'Recuperación de cartera'),
      s('cobranza-extrajudicial', 'Cobranza extrajudicial'),
      s('cobranza-judicial', 'Cobranza judicial'),
    ],
  },
  {
    slug: 'propiedad-intelectual',
    number: '03',
    name: 'Propiedad Intelectual',
    summary: 'Protección del nombre y la identidad de tu negocio mediante el registro de marca.',
    icon: 'ip',
    services: [s('registro-marca', 'Registro de marca')],
  },
  {
    slug: 'familiar',
    number: '04',
    name: 'Familiar',
    summary: 'Acompañamiento cercano y discreto en procesos que involucran a tu familia.',
    icon: 'family',
    services: [s('divorcio', 'Divorcio'), s('guarda-custodia', 'Guarda y custodia')],
  },
  {
    slug: 'civil',
    number: '05',
    name: 'Civil',
    summary: 'Regularización de la propiedad de inmuebles a través del juicio de usucapión.',
    icon: 'civil',
    services: [s('usucapion', 'Usucapión')],
  },
  {
    slug: 'penal',
    number: '06',
    name: 'Penal',
    summary: 'Defensa con estrategia desde el primer momento, con atención personal y confidencial.',
    icon: 'criminal',
    services: [s('defensa-penal', 'Defensa penal estratégica')],
  },
  {
    slug: 'sector-medico',
    number: '07',
    name: 'Sector Médico',
    summary: 'Revisión preventiva del cumplimiento normativo de consultorios médicos.',
    icon: 'medical',
    services: [s('auditoria-consultorios', 'Auditoría preventiva de consultorios médicos')],
  },
];

export function findArea(slug: string | null | undefined) {
  return practiceAreas.find((a) => a.slug === slug);
}

export function findService(areaSlug: string | null | undefined, serviceSlug: string | null | undefined) {
  return findArea(areaSlug)?.services.find((sv) => sv.slug === serviceSlug);
}

export const totalServices = practiceAreas.reduce((n, a) => n + a.services.length, 0);
