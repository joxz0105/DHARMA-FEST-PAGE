import { z } from "zod";
import actividades from "@/content/actividades.json";
import asociaciones from "@/content/asociaciones.json";
import cifras from "@/content/cifras.json";
import espacios from "@/content/espacios.json";
import beneficios from "@/content/beneficios.json";
import marcas from "@/content/marcas.json";
import medios from "@/content/medios.json";
import paquetes from "@/content/paquetes.json";
import temas from "@/content/temas.json";
import galeria from "@/content/galeria.json";
import sitio from "@/content/sitio.json";
import manifiesto from "@/content/manifiesto-imagenes.json";
import {
  esquemaActividad,
  esquemaAsociacion,
  esquemaBeneficios,
  esquemaCifras,
  esquemaEspacio,
  esquemaMarca,
  esquemaMedio,
  esquemaPaquete,
  esquemaTema,
} from "./esquemas";

/** Valida y da un error que dice que archivo esta mal, no solo que campo. */
function validar<T>(esquema: z.ZodType<T>, datos: unknown, archivo: string): T {
  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new Error(`content/${archivo} no valida:\n${z.prettifyError(resultado.error)}`);
  }
  return resultado.data;
}

export const getCifras = () => validar(esquemaCifras, cifras, "cifras.json");
export const getActividades = () =>
  validar(z.array(esquemaActividad).length(5), actividades, "actividades.json");
export const getTemas = () => validar(z.array(esquemaTema).length(8), temas, "temas.json");
export const getPaquetes = () =>
  validar(z.array(esquemaPaquete).length(3), paquetes, "paquetes.json");
export const getMarcas = () => validar(z.array(esquemaMarca).min(55), marcas, "marcas.json");
export const getAsociaciones = () =>
  validar(z.array(esquemaAsociacion).length(4), asociaciones, "asociaciones.json");
export const getEspacios = () =>
  validar(z.array(esquemaEspacio).length(3), espacios, "espacios.json");
export const getMedios = () => validar(z.array(esquemaMedio).min(1), medios, "medios.json");

/**
 * Programa de beneficios. Va `.min(1)` y NO cantidad exacta como los de
 * arriba: la lista crece cada vez que una marca confirma, y con `.length(n)`
 * cada marca que sumara el cliente romperia el build.
 */
export const getBeneficios = () => validar(esquemaBeneficios, beneficios, "beneficios.json");

export const getCategoriaBeneficio = (slug: string) =>
  getBeneficios().categorias.find((c) => c.slug === slug);

/**
 * El "entre X% y Y%" que se anuncia en /2027 sale del catalogo, no se
 * escribe a mano: si alguien cambia un porcentaje, el anuncio no puede
 * quedarse prometiendo otro numero.
 */
export function getRangoDescuento() {
  const porcentajes = getBeneficios().beneficios.map((b) => b.descuento);
  return { min: Math.min(...porcentajes), max: Math.max(...porcentajes) };
}

/**
 * Que clave de copy anuncia el rango. Si todas las marcas dan lo mismo (por
 * ejemplo, cuando confirma la primera), "entre 10% y 10%" no se puede decir.
 */
export function claveDelRango({ min, max }: { min: number; max: number }) {
  return min === max ? "descuentoUnico" : "descuento";
}

/**
 * Fotos de la galeria: seleccion a mano de las 63 que el cliente entrego del
 * Dharma Fest 2025. Antes salian recortadas del deck, que eran peores.
 */
export const getFotosGaleria = () => galeria;

/**
 * Ajustes que el cliente cambia sin tocar componentes. `entradasUrl` es null
 * hasta que pase el link de la tiquetera; `whatsapp` hasta que pase el numero.
 */
export const getSitio = () =>
  validar(
    z.object({
      _nota: z.string().optional(),
      entradasUrl: z.string().url().nullable(),
      whatsapp: z.string().nullable(),
    }),
    sitio,
    "sitio.json",
  );

/**
 * Fotos de la sede. NO van pareadas con los nombres de los salones: el deck
 * pone las cuatro fotos y los tres nombres sin relacion posicional, asi que
 * atribuir una foto a un salon seria inventar. Ver spec §10.3.
 */
export const getFotosSede = () =>
  manifiesto.filter((i) => i.pagina === 13 && i.grupo === "foto" && i.archivo.endsWith(".jpg"));

/** La textura de selva que el deck repite como fondo. */
export const getTexturaFondo = () => manifiesto.find((i) => i.grupo === "fondo");

export type * from "./esquemas";
