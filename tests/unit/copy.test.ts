import { describe, expect, it } from "vitest";
import en from "@/content/copy/en.json";
import es from "@/content/copy/es.json";

function claves(objeto: unknown, prefijo = ""): string[] {
  if (typeof objeto !== "object" || objeto === null) return [prefijo];
  return Object.entries(objeto).flatMap(([clave, valor]) =>
    claves(valor, prefijo ? `${prefijo}.${clave}` : clave),
  );
}

function valorEn(dicc: unknown, ruta: string): unknown {
  return ruta.split(".").reduce<unknown>(
    (o, k) => (typeof o === "object" && o !== null ? (o as Record<string, unknown>)[k] : undefined),
    dicc,
  );
}

describe("diccionarios de copy", () => {
  it("español e inglés tienen exactamente las mismas claves", () => {
    expect(claves(en).sort()).toEqual(claves(es).sort());
  });

  it("ninguna cadena está vacía", () => {
    for (const [nombre, dicc] of [
      ["es", es],
      ["en", en],
    ] as const) {
      const vacias = claves(dicc).filter((ruta) => {
        const valor = valorEn(dicc, ruta);
        return typeof valor === "string" && valor.trim() === "";
      });
      expect(vacias, `cadenas vacías en ${nombre}`).toEqual([]);
    }
  });

  it("ninguna cadena en inglés quedó igual a la española por descuido", () => {
    // Nombres propios y siglas pueden repetirse; el resto no deberia.
    const PERMITIDAS = new Set([
      "nav.festival",
      "nav.road",
      "pie.derechos",
      // Nombres propios de la marca: no se traducen en ningun idioma.
      "home.roadTitulo",
      "patrocinios.mercaditoTitulo",
      "borrador.roadTitulo",
      "borrador.festivalTitulo",
    ]);
    const iguales = claves(es).filter((ruta) => {
      if (PERMITIDAS.has(ruta)) return false;
      const a = valorEn(es, ruta);
      const b = valorEn(en, ruta);
      return typeof a === "string" && a === b;
    });
    expect(iguales).toEqual([]);
  });
});
