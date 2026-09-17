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

/** Categoria del catalogo de Beneficios Dharma. El slug es el segmento de la URL. */
export const esquemaCategoriaBeneficio = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug: minusculas, numeros y guiones"),
  nombre: textoBilingue,
  descripcion: textoBilingue,
  foto: z.string(),
  /** Oscurecido de la foto del encabezado. Lo vigila tests/e2e/legibilidad. */
  scrim: z.number().int().min(0).max(90),
  posicion: z.string().optional(),
});

/**
 * Un beneficio de una marca aliada.
 *
 * `confirmado` no se renderiza. Existe para que se vea de un vistazo cuales
 * marcas ya dieron el si por escrito y cuales siguen siendo ejemplo.
 */
export const esquemaBeneficio = z.object({
  marca: z.string().min(1),
  logo: z.string(),
  categoria: z.string(),
  descuento: z.number().int().min(1).max(100),
  /** Sobre que aplica: "en todos sus productos" / "all products". */
  sobre: textoBilingue,
  confirmado: z.boolean(),
});

/**
 * Catalogo de Beneficios Dharma, organizado por categorias como el mall de
 * Davivienda que el cliente puso de referencia.
 *
 * La referencia cruzada se valida aca y no solo en los tests: una categoria
 * mal escrita tumba el build con un mensaje que dice cual, en vez de dejar un
 * beneficio huerfano que no aparece en ninguna pagina de categoria.
 */
export const esquemaBeneficios = z
  .object({
    _nota: z.string().optional(),
    categorias: z.array(esquemaCategoriaBeneficio).min(1),
    beneficios: z.array(esquemaBeneficio).min(1),
  })
  .superRefine((datos, ctx) => {
    const slugs = new Set(datos.categorias.map((c) => c.slug));
    if (slugs.size !== datos.categorias.length) {
      ctx.addIssue({ code: "custom", path: ["categorias"], message: "hay slugs repetidos" });
    }
    datos.beneficios.forEach((b, i) => {
      if (!slugs.has(b.categoria)) {
        ctx.addIssue({
          code: "custom",
          path: ["beneficios", i, "categoria"],
          message: `${b.marca}: la categoria "${b.categoria}" no existe`,
        });
      }
    });
    for (const slug of slugs) {
      if (!datos.beneficios.some((b) => b.categoria === slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["categorias"],
          message: `la categoria "${slug}" no tiene beneficios: su pagina saldria vacia`,
        });
      }
    }
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
export type Beneficio = z.infer<typeof esquemaBeneficio>;
export type CategoriaBeneficio = z.infer<typeof esquemaCategoriaBeneficio>;
export type Asociacion = z.infer<typeof esquemaAsociacion>;
export type Espacio = z.infer<typeof esquemaEspacio>;
export type Medio = z.infer<typeof esquemaMedio>;
