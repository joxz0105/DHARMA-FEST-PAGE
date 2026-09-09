"use server";

import { guardarLead, validarCorreo, type Lead } from "./leads";

export type EstadoFormulario = { ok: boolean; errores?: Record<string, string> };

function texto(datos: FormData, campo: string): string {
  return String(datos.get(campo) ?? "").trim();
}

/** La casilla es un acto explicito: sin marcar, no hay consentimiento. */
function hayConsentimiento(datos: FormData): boolean {
  return datos.get("consentimiento") === "on";
}

export async function suscribirComunidad(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const correo = texto(datos, "correo");
  const errores: Record<string, string> = {};

  if (!validarCorreo(correo)) errores.correo = "correoInvalido";
  if (!hayConsentimiento(datos)) errores.consentimiento = "consentimientoRequerido";
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const lead: Lead = {
    tipo: "comunidad",
    correo,
    nombre: texto(datos, "nombre") || undefined,
    idioma: texto(datos, "idioma") || "es",
    consentimiento: true,
    recibidoEn: new Date().toISOString(),
  };
  await guardarLead(lead);
  return { ok: true };
}

export async function solicitarPropuesta(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const correo = texto(datos, "correo");
  const marca = texto(datos, "marca");
  const errores: Record<string, string> = {};

  if (!validarCorreo(correo)) errores.correo = "correoInvalido";
  if (marca.length === 0) errores.marca = "marcaRequerida";
  if (!hayConsentimiento(datos)) errores.consentimiento = "consentimientoRequerido";
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const lead: Lead = {
    tipo: "propuesta",
    correo,
    marca,
    nombre: texto(datos, "nombre") || undefined,
    mensaje: texto(datos, "mensaje") || undefined,
    idioma: texto(datos, "idioma") || "es",
    consentimiento: true,
    recibidoEn: new Date().toISOString(),
  };
  await guardarLead(lead);
  return { ok: true };
}
