import { z } from "zod";
import actividades from "@/content/actividades.json";
import asociaciones from "@/content/asociaciones.json";
import cifras from "@/content/cifras.json";
import espacios from "@/content/espacios.json";
import marcas from "@/content/marcas.json";
import medios from "@/content/medios.json";
import paquetes from "@/content/paquetes.json";
import temas from "@/content/temas.json";
import manifiesto from "@/content/manifiesto-imagenes.json";
import {
  esquemaActividad,
  esquemaAsociacion,
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

/** Fotos de la galeria: laminas 7, 8 y 9 del deck. */
export const getFotosGaleria = () =>
  manifiesto.filter((i) => i.grupo === "foto" && [7, 8, 9].includes(i.pagina));

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
