import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getActividades,
  getAsociaciones,
  getBeneficios,
  getCifras,
  getEspacios,
  getFotosGaleria,
  getFotosSede,
  getMarcas,
  getMedios,
  getPaquetes,
  getTemas,
  getTexturaFondo,
} from "@/lib/contenido";

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

describe("programa de beneficios", () => {
  it("el rango de descuento es coherente", () => {
    const { min, max } = getBeneficios().rangoDescuento;
    expect(min).toBeLessThan(max);
    expect(max).toBeLessThanOrEqual(100);
  });

  it("no inventa marcas: todas están en marcas.json, con el mismo logo", () => {
    const catalogo = new Map(getMarcas().map((m) => [m.nombre, m.logo]));
    for (const marca of getBeneficios().marcas) {
      expect(catalogo.get(marca.nombre), `${marca.nombre} no está en marcas.json`).toBe(
        marca.logo,
      );
    }
  });

  it("el porcentaje va como rango del programa, nunca pegado a una marca", () => {
    // Un numero junto a un logo es la oferta concreta de un tercero y la
    // vuelve exigible (art. 113). El desglose por marca vive en /beneficios,
    // donde cada linea carga sus condiciones y su vigencia.
    for (const marca of getBeneficios().marcas) {
      expect(Object.keys(marca).sort()).toEqual(["confirmado", "logo", "nombre"]);
    }
  });
});

describe("las imágenes referenciadas existen de verdad", () => {
  const referencias = [
    ...getActividades().map((i) => i.imagen),
    ...getTemas().map((i) => i.imagen),
    ...getMarcas().map((i) => i.logo),
    ...getAsociaciones().map((i) => i.logo),
    ...getBeneficios().marcas.map((i) => i.logo),
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
