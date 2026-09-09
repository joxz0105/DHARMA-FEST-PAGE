import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifiesto from "@/content/manifiesto-imagenes.json";

describe("manifiesto de imágenes", () => {
  it("tiene los logos de las marcas aliadas", () => {
    const marcas = manifiesto.filter((m) => m.grupo === "logo-marca");
    expect(marcas.length).toBeGreaterThanOrEqual(60);
  });

  it("tiene los cuatro logos de asociaciones", () => {
    const asociaciones = manifiesto.filter((m) => m.grupo === "logo-asociacion");
    expect(asociaciones).toHaveLength(4);
  });

  it("guarda una sola copia de la textura de fondo", () => {
    expect(manifiesto.filter((m) => m.grupo === "fondo")).toHaveLength(1);
  });

  it("cada entrada apunta a un archivo que existe", () => {
    for (const entrada of manifiesto) {
      const ruta = path.join(process.cwd(), "public/img", entrada.archivo);
      expect(existsSync(ruta), `falta ${entrada.archivo}`).toBe(true);
    }
  });

  it("ninguna imagen supera los 2000px de ancho", () => {
    for (const entrada of manifiesto) {
      expect(entrada.ancho).toBeLessThanOrEqual(2000);
    }
  });

  it("los logos conservan su transparencia, es decir son PNG", () => {
    // Si un logo sale como JPEG, perdio el alfa y se ve con un rectangulo de
    // fondo sobre el verde de marca. Paso de verdad al escribir el script.
    const logos = manifiesto.filter((m) => m.grupo.startsWith("logo-"));
    const sinAlfa = logos.filter((m) => !m.archivo.endsWith(".png"));
    expect(sinAlfa.map((m) => m.archivo)).toEqual([]);
  });
});
