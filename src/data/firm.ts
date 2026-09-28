/**
 * Contenido institucional del despacho.
 * Solo afirmaciones generales sobre la forma de trabajo.
 * No incluir años de experiencia, premios, certificaciones, casos ni cifras sin confirmar.
 */
import type { Name } from '../components/icon-names';

export const principles: { icon: Name; title: string; text: string }[] = [
  {
    icon: 'user',
    title: 'Atención personalizada',
    text: 'Cada asunto se analiza de forma individual, considerando tus circunstancias y objetivos.',
  },
  {
    icon: 'compass',
    title: 'Estrategia jurídica',
    text: 'Definimos un plan de acción claro antes de actuar, con alternativas explicadas en lenguaje sencillo.',
  },
  {
    icon: 'eye-off',
    title: 'Confidencialidad',
    text: 'La información que compartes con el despacho se trata con absoluta reserva.',
  },
  {
    icon: 'chat',
    title: 'Cercanía con el cliente',
    text: 'Te mantenemos informado sobre el avance de tu asunto y respondemos tus dudas.',
  },
  {
    icon: 'doc',
    title: 'Profesionalismo',
    text: 'Trabajo riguroso, ordenado y apegado a la ética profesional en cada etapa.',
  },
];

export const process: { title: string; text: string }[] = [
  {
    title: 'Solicita asesoría',
    text: 'Cuéntanos tu caso a través del formulario, WhatsApp o en nuestra oficina.',
  },
  {
    title: 'Analizamos tu situación',
    text: 'Revisamos los hechos y la documentación disponible para entender tu asunto.',
  },
  {
    title: 'Te proponemos una estrategia',
    text: 'Te explicamos las alternativas, el alcance del servicio y los honorarios.',
  },
  {
    title: 'Te acompañamos',
    text: 'Llevamos tu asunto y te mantenemos informado en cada etapa.',
  },
];
