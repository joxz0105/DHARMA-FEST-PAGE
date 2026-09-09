import type { Lang } from './i18n';

export type ResultadoSuscripcion =
  | { ok: true }
  | { ok: false; error: 'correo-invalido' | 'error-proveedor' };

/**
 * Validación deliberadamente laxa. El único juez real de un correo es enviarlo;
 * acá solo se atrapan los errores de dedo evidentes.
 */
const FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esCorreoValido(correo: string): boolean {
  return FORMATO.test(correo.trim());
}

/** Contrato que debe cumplir cualquier proveedor de correo. */
export interface Proveedor {
  (correo: string, lang: Lang): Promise<ResultadoSuscripcion>;
}

/**
 * Adaptador por defecto: no persiste nada.
 *
 * El cliente todavía no eligió proveedor (spec §12, riesgo 6), así que el
 * formulario funciona de punta a punta pero los correos no se guardan.
 * Para conectar Mailchimp, Brevo o Supabase, escribir un Proveedor nuevo y
 * cambiar la constante PROVEEDOR de abajo. Ningún componente se entera.
 */
const proveedorConsola: Proveedor = async (correo, lang) => {
  console.info('[dharma] suscripción simulada', { correo, lang });
  return { ok: true };
};

const PROVEEDOR: Proveedor = proveedorConsola;

export async function subscribe(correo: string, lang: Lang): Promise<ResultadoSuscripcion> {
  if (!esCorreoValido(correo)) {
    return { ok: false, error: 'correo-invalido' };
  }

  try {
    return await PROVEEDOR(correo.trim().toLowerCase(), lang);
  } catch {
    return { ok: false, error: 'error-proveedor' };
  }
}
