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

/**
 * Programa de beneficios. El descuento se declara como RANGO del programa
 * ("entre 5% y 10% en las marcas aliadas") y no como porcentaje por marca,
 * que es la forma legalmente expuesta: un numero pegado a un logo es una
 * oferta concreta de un tercero. El porcentaje por marca llega con el
 * catalogo de /beneficios, donde cada linea carga sus condiciones y vigencia.
 *
 * `confirmado` no se renderiza. Existe para que se vea de un vistazo cuales
 * marcas ya dieron el si por escrito y cuales siguen siendo ejemplo.
 */
export const esquemaBeneficios = z.object({
  _nota: z.string().optional(),
  rangoDescuento: z
    .object({
      min: z.number().int().positive().max(100),
      max: z.number().int().positive().max(100),
    })
    .refine((r) => r.min < r.max, "rangoDescuento: el minimo tiene que ser menor que el maximo"),
  marcas: z
    .array(
      z.object({ nombre: z.string().min(1), logo: z.string(), confirmado: z.boolean() }),
    )
    .min(1),
});

export const esquemaAsociacion = esquemaMarca;

/** Los salones no llevan imagen: el deck no dice cual foto es cual. Ver spec §10. */
export const esquemaEspacio = z.object({ slug: z.string(), nombre: z.string().min(1) });

export const esquemaMedio = textoBilingue;

export type Cifras = z.infer<typeof esquemaCifras>;
export type Actividad = z.infer<typeof esquemaActividad>;
export type Tema = z.infer<typeof esquemaTema>;
export type Paquete = z.infer<typeof esquemaPaquete>;
export type Marca = z.infer<typeof esquemaMarca>;
export type Beneficios = z.infer<typeof esquemaBeneficios>;
export type Asociacion = z.infer<typeof esquemaAsociacion>;
export type Espacio = z.infer<typeof esquemaEspacio>;
export type Medio = z.infer<typeof esquemaMedio>;
