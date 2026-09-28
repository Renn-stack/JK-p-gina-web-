/**
 * ============================================================
 *  LJ JURÍDICO — CONFIGURACIÓN CENTRAL DEL SITIO
 * ============================================================
 *
 *  Este es el ÚNICO lugar donde deben capturarse los datos de
 *  contacto, dirección, horarios, redes sociales y equipo.
 *
 *  Regla: cualquier dato que todavía no esté confirmado se deja
 *  en `null`. El sitio mostrará automáticamente "[PENDIENTE]"
 *  en su lugar. NUNCA escribas datos inventados aquí.
 *
 *  Para actualizar un dato basta con reemplazar `null` por el
 *  valor real (entre comillas) y volver a compilar el sitio.
 * ============================================================
 */

/** Texto que se muestra en el sitio cuando un dato no está disponible. */
export const PENDING = '[PENDIENTE]';

export interface TeamMember {
  name: string;
  role: string;
  /** Cédula profesional u otra información verificable. */
  credentials?: string;
  /** Ruta a la fotografía dentro de /public (ej. '/equipo/nombre.webp'). */
  photo?: string;
  bio?: string;
}

export const site = {
  name: 'LJ Jurídico',
  fullName: 'LJ Jurídico Abogados',
  descriptor: 'Abogados',
  tagline: 'Asesoría y representación legal',
  description:
    'Despacho jurídico en Puebla, México. Asesoría y representación legal para personas y empresas en materia administrativa, corporativa, propiedad intelectual, familiar, civil, penal y sector médico.',

  /**
   * Dominio definitivo del sitio. [PENDIENTE]
   * Se usa para el sitemap, URLs canónicas y Open Graph.
   * El dominio `.example` es un marcador reservado; reemplázalo por el real.
   */
  url: 'https://dominio-pendiente.example',

  locale: 'es_MX',
  lang: 'es-MX',

  location: {
    city: 'Puebla',
    state: 'Puebla',
    country: 'México',
  },

  /** Oficina física. El despacho SÍ cuenta con oficina; la dirección está pendiente. */
  address: {
    street: null as string | null, // Calle y número
    neighborhood: null as string | null, // Colonia
    postalCode: null as string | null,
    references: null as string | null, // Ej. "Planta alta, oficina 3"
    /**
     * URL de Google Maps para el botón "Cómo llegar"
     * (ej. https://maps.app.goo.gl/...).
     */
    mapsLink: null as string | null,
    /**
     * URL del iframe de Google Maps (Compartir → Insertar un mapa → copiar el `src`).
     * Al capturarla, el mapa aparece automáticamente en Contacto.
     */
    mapsEmbedUrl: null as string | null,
  },

  contact: {
    /** Número de WhatsApp en formato internacional SIN signos ni espacios, ej. '5212221234567'. */
    whatsapp: null as string | null,
    /** Cómo se muestra el WhatsApp en pantalla, ej. '222 123 4567'. */
    whatsappDisplay: null as string | null,
    /** Teléfono en formato internacional para enlaces tel:, ej. '+522221234567'. */
    phone: null as string | null,
    phoneDisplay: null as string | null,
    email: null as string | null,
    /** Horario de atención, una línea por renglón. Ej. ['Lunes a viernes: 9:00 – 18:00']. */
    hours: null as string[] | null,
    /** Mensaje prellenado al abrir WhatsApp. */
    whatsappMessage: 'Hola, me gustaría solicitar una asesoría con LJ Jurídico.',
  },

  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    linkedin: null as string | null,
    tiktok: null as string | null,
    x: null as string | null,
  },

  forms: {
    /**
     * Endpoint que recibe las solicitudes de asesoría (POST JSON).
     * Puede ser un servicio como Formspree, un Worker/Función propia o un CRM.
     * Mientras sea `null`, el formulario funciona en MODO DE PRUEBA:
     * valida los datos pero NO envía la solicitud y lo indica claramente.
     */
    advisoryEndpoint: null as string | null,
  },

  /**
   * Equipo de abogados. [PENDIENTE]
   * Agrega aquí a cada integrante con datos reales y verificables.
   */
  team: [] as TeamMember[],

  legal: {
    /** Aviso de privacidad (obligatorio en México - LFPDPPP). URL o ruta interna. */
    privacyNoticeUrl: null as string | null,
  },
};

/** Devuelve el valor o el marcador [PENDIENTE]. */
export function orPending(value: string | null | undefined): string {
  return value && value.trim() ? value : PENDING;
}

export function isPending(value: unknown): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

export function whatsappUrl(message = site.contact.whatsappMessage): string | null {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const cityLine = `${site.location.city}, ${site.location.country}`;
