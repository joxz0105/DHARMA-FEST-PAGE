import { z } from "zod";

const textoBilingue = z.object({ es: z.string().min(1), en: z.string().min(1) });

export const esquemaCifras = z.object({
  personas: z.number().int().positive(),
  experienciasAnuales: z.number().int().positive(),
  crecimiento: z.number().positive(),
  baseDeDatos: z.number().int().positive(),
  profesionales: z.number().int().positive(),
  genero: z.object({ mujeres: z.number(), hombres: z.number() }),
  edades: z.array(z.object({ rango: z.string(), porcentaje: z.number() })).min(1),
  alcanceOrganico: z.array(z.number()).min(1),
});

export const esquemaActividad = z.object({
  slug: z.string(),
  nombre: textoBilingue,
  imagen: z.string(),
});

export const esquemaTema = esquemaActividad;

export const esquemaPaquete = z.object({
  slug: z.enum(["oficial", "oro", "plata"]),
  nombre: z.string(),
  lema: textoBilingue,
  /** Se guarda para tenerlo a mano. NO se renderiza: ver spec §3. */
  inversionUSD: z.number().int().positive(),
  presencia: z.array(textoBilingue).min(1),
  visibilidad: z.array(textoBilingue).min(1),
  captacion: z.array(textoBilingue).min(1),
});

export const esquemaMarca = z.object({ nombre: z.string().min(1), logo: z.string() });

export const esquemaAsociacion = esquemaMarca;

/** Los salones no llevan imagen: el deck no dice cual foto es cual. Ver spec §10. */
export const esquemaEspacio = z.object({ slug: z.string(), nombre: z.string().min(1) });

export const esquemaMedio = textoBilingue;

export type Cifras = z.infer<typeof esquemaCifras>;
export type Actividad = z.infer<typeof esquemaActividad>;
export type Tema = z.infer<typeof esquemaTema>;
export type Paquete = z.infer<typeof esquemaPaquete>;
export type Marca = z.infer<typeof esquemaMarca>;
export type Asociacion = z.infer<typeof esquemaAsociacion>;
export type Espacio = z.infer<typeof esquemaEspacio>;
export type Medio = z.infer<typeof esquemaMedio>;
