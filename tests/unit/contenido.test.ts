import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  claveDelRango,
  getActividades,
  getAsociaciones,
  getBeneficios,
  getCategoriaBeneficio,
  getCifras,
  getEspacios,
  getFotosGaleria,
  getFotosSede,
  getMarcas,
  getMedios,
  getPaquetes,
  getRangoDescuento,
  getTemas,
  getTexturaFondo,
} from "@/lib/contenido";
import { esquemaBeneficios } from "@/lib/esquemas";

describe("cifras", () => {
  it("son las del deck", () => {
    const cifras = getCifras();
    expect(cifras.personas).toBe(4000);
    expect(cifras.experienciasAnuales).toBe(8);
    expect(cifras.crecimiento).toBe(67);
    expect(cifras.baseDeDatos).toBe(26000);
    expect(cifras.profesionales).toBe(100);
  });

  it("los porcentajes de género suman 100", () => {
    const { mujeres, hombres } = getCifras().genero;
    expect(mujeres + hombres).toBeCloseTo(100, 1);
  });

  it("las edades vienen ordenadas de mayor a menor", () => {
    const porcentajes = getCifras().edades.map((e) => e.porcentaje);
    expect([...porcentajes].sort((a, b) => b - a)).toEqual(porcentajes);
  });
});

describe("taxonomía", () => {
  it("hay cinco actividades y ocho temas", () => {
    expect(getActividades()).toHaveLength(5);
    expect(getTemas()).toHaveLength(8);
  });

  it("no se repite ningún slug", () => {
    for (const lista of [getActividades(), getTemas(), getEspacios()]) {
      const slugs = lista.map((i) => i.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("no se repite ninguna imagen entre actividades ni entre temas", () => {
    for (const lista of [getActividades(), getTemas()]) {
      const imgs = lista.map((i) => i.imagen);
      expect(new Set(imgs).size).toBe(imgs.length);
    }
  });
});

describe("paquetes", () => {
  it("son tres, cada uno con sus tres grupos de beneficios", () => {
    const paquetes = getPaquetes();
    expect(paquetes).toHaveLength(3);
    for (const paquete of paquetes) {
      expect(paquete.presencia.length).toBeGreaterThan(0);
      expect(paquete.visibilidad.length).toBeGreaterThan(0);
      expect(paquete.captacion.length).toBeGreaterThan(0);
    }
  });

  it("guardan el precio aunque no se muestre", () => {
    const porSlug = Object.fromEntries(getPaquetes().map((p) => [p.slug, p]));
    expect(porSlug.oficial.inversionUSD).toBe(7000);
    expect(porSlug.oro.inversionUSD).toBe(4000);
    expect(porSlug.plata.inversionUSD).toBe(2000);
  });
});

describe("logos", () => {
  it("hay al menos 55 marcas y cada una tiene nombre propio", () => {
    const marcas = getMarcas();
    expect(marcas.length).toBeGreaterThanOrEqual(55);
    for (const marca of marcas) {
      expect(marca.nombre.trim().length).toBeGreaterThan(1);
    }
  });

  it("no incluye a Camp Lago, que es la sede y no un patrocinador", () => {
    const nombres = getMarcas().map((m) => m.nombre.toLowerCase());
    expect(nombres.some((n) => n.includes("camp") && n.includes("lago"))).toBe(false);
  });

  it("hay cuatro asociaciones aliadas", () => {
    expect(getAsociaciones()).toHaveLength(4);
  });

  it("todos los logos son PNG, para que conserven la transparencia", () => {
    for (const logo of [...getMarcas(), ...getAsociaciones()]) {
      expect(logo.logo, logo.nombre).toMatch(/\.png$/);
    }
  });
});

describe("Beneficios Dharma", () => {
  it("no inventa marcas: todas están en marcas.json, con el mismo logo", () => {
    const catalogo = new Map(getMarcas().map((m) => [m.nombre, m.logo]));
    for (const b of getBeneficios().beneficios) {
      expect(catalogo.get(b.marca), `${b.marca} no está en marcas.json`).toBe(b.logo);
    }
  });

  it("ninguna marca aparece dos veces", () => {
    const marcas = getBeneficios().beneficios.map((b) => b.marca);
    expect(new Set(marcas).size).toBe(marcas.length);
  });

  it("cada beneficio cae en una categoría que existe, y ninguna categoría queda vacía", () => {
    const { categorias, beneficios } = getBeneficios();
    const slugs = categorias.map((c) => c.slug);
    for (const b of beneficios) expect(slugs, b.marca).toContain(b.categoria);
    for (const slug of slugs) {
      expect(beneficios.some((b) => b.categoria === slug), `${slug} sin beneficios`).toBe(true);
    }
  });

  it("una categoría mal escrita tumba la validación, no deja una tarjeta huérfana", () => {
    const datos = structuredClone(getBeneficios());
    datos.beneficios[0].categoria = "no-existe";
    const resultado = esquemaBeneficios.safeParse(datos);
    expect(resultado.success).toBe(false);
  });

  it("el rango que se anuncia en /2027 es el del catálogo, no uno escrito a mano", () => {
    const porcentajes = getBeneficios().beneficios.map((b) => b.descuento);
    expect(getRangoDescuento()).toEqual({
      min: Math.min(...porcentajes),
      max: Math.max(...porcentajes),
    });
  });

  it("si todas las marcas dan lo mismo, no anuncia 'entre 10% y 10%'", () => {
    expect(claveDelRango({ min: 10, max: 10 })).toBe("descuentoUnico");
    expect(claveDelRango({ min: 5, max: 10 })).toBe("descuento");
  });

  it("encuentra una categoría por su slug y no inventa una que no existe", () => {
    expect(getCategoriaBeneficio("movimiento")?.nombre.es).toBe("Movimiento");
    expect(getCategoriaBeneficio("no-existe")).toBeUndefined();
  });

  it("cada marca tiene su logo recortado, para que una nueva no salga diminuta", () => {
    // Las tarjetas usan public/img/logos-recortados/. Si falla, correr
    // python scripts/recortar_logos.py
    const faltan = getMarcas()
      .map((m) => m.logo)
      .filter((logo) => !existsSync(path.join(process.cwd(), "public/img/logos-recortados", logo)));
    expect(faltan).toEqual([]);
  });

  it("mientras sea una maqueta, ninguna marca figura como confirmada", () => {
    // Si alguna pasa a true es porque la marca confirmo por escrito. Este
    // test esta para que ese cambio se haga a proposito y se vea en el diff,
    // no para impedirlo: cuando llegue la primera confirmacion, se actualiza.
    expect(getBeneficios().beneficios.filter((b) => b.confirmado)).toEqual([]);
  });
});

describe("las imágenes referenciadas existen de verdad", () => {
  const referencias = [
    ...getActividades().map((i) => i.imagen),
    ...getTemas().map((i) => i.imagen),
    ...getMarcas().map((i) => i.logo),
    ...getAsociaciones().map((i) => i.logo),
    ...getBeneficios().beneficios.map((i) => i.logo),
    ...getBeneficios().categorias.map((i) => i.foto),
    ...getFotosGaleria().map((i) => i.archivo),
    ...getFotosSede().map((i) => i.archivo),
  ];

  it.each(referencias)("existe %s", (archivo) => {
    expect(existsSync(path.join(process.cwd(), "public/img", archivo))).toBe(true);
  });
});

describe("resto del contenido", () => {
  it("hay tres salones, y sin foto pareada", () => {
    const espacios = getEspacios();
    expect(espacios).toHaveLength(3);
    // El deck no dice cual foto es cual salon: parearlas seria inventar.
    for (const espacio of espacios) {
      expect(espacio).not.toHaveProperty("imagen");
    }
  });

  it("la galería tiene fotos y la sede también", () => {
    expect(getFotosGaleria().length).toBeGreaterThanOrEqual(6);
    expect(getFotosSede().length).toBeGreaterThanOrEqual(3);
  });

  it("existe una única textura de fondo", () => {
    expect(getTexturaFondo()).toBeDefined();
  });

  it("el plan de medios trae los seis canales del deck", () => {
    expect(getMedios()).toHaveLength(6);
  });
});
