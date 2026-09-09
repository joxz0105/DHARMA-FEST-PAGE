import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type Lead = {
  tipo: "comunidad" | "propuesta";
  correo: string;
  nombre?: string;
  marca?: string;
  mensaje?: string;
  idioma: string;
  consentimiento: true;
  recibidoEn: string;
};

export function validarCorreo(valor: string): boolean {
  // Deliberadamente simple: algo, un solo arroba, y un dominio con punto.
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(valor);
}

function carpetaDatos(): string {
  return process.env.DHARMA_DIR_DATOS ?? path.join(process.cwd(), "data");
}

/**
 * Unico punto de escritura de datos personales del sitio.
 *
 * Hoy hace append a un .jsonl local. El dia que el cliente elija proveedor de
 * correo (Mailchimp, Brevo, el que sea), se cambia SOLO esta funcion. Ningun
 * otro archivo debe escribir leads.
 *
 * La carpeta data/ esta en .gitignore: son datos de personas.
 */
export async function guardarLead(lead: Lead): Promise<void> {
  const carpeta = carpetaDatos();
  await mkdir(carpeta, { recursive: true });
  await appendFile(path.join(carpeta, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");
}
