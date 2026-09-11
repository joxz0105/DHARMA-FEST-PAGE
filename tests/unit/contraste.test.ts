import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ratio } from "@/lib/contraste";

const PAPEL = "#FFFFFF";
const HUESO = "#FBFCF7";
const PALIDO = "#E1F6B6";
const VERDE = "#71B725";
const VERDE_TEXTO = "#4A7D18";
const VERDE_HONDO = "#3C6411";
const TINTA = "#1C2A14";
const ORO = "#8A6F00";

describe("contraste de la paleta clara", () => {
  it("el texto principal se lee sobre cualquier superficie clara", () => {
    for (const fondo of [PAPEL, HUESO, PALIDO]) {
      expect(ratio(TINTA, fondo), `tinta sobre ${fondo}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("el verde de texto pasa AA sobre papel y sobre pálido", () => {
    expect(ratio(VERDE_TEXTO, PAPEL)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(VERDE_TEXTO, PALIDO)).toBeGreaterThanOrEqual(3);
  });

  it("el verde hondo aguanta display grande sobre papel", () => {
    expect(ratio(VERDE_HONDO, PAPEL)).toBeGreaterThanOrEqual(4.5);
  });

  it("el oro pasa AA sobre papel", () => {
    expect(ratio(ORO, PAPEL)).toBeGreaterThanOrEqual(4.5);
  });

  it("el verde de marca NO sirve como texto, y por eso solo se usa de relleno", () => {
    // Es el verde del manual (#71B725). Da 2.47:1 sobre blanco. Si alguna vez
    // pasa este umbral sera porque lo cambiaron, y hay que revisar la regla.
    expect(ratio(VERDE, PAPEL)).toBeLessThan(3);
  });

  it("sobre el verde de marca el texto va en tinta, no en blanco", () => {
    expect(ratio(PAPEL, VERDE), "blanco sobre verde").toBeLessThan(3);
    expect(ratio(TINTA, VERDE), "tinta sobre verde").toBeGreaterThanOrEqual(4.5);
  });

  it("es simétrico", () => {
    expect(ratio(VERDE_TEXTO, PAPEL)).toBeCloseTo(ratio(PAPEL, VERDE_TEXTO), 5);
  });
});

describe("los tokens del CSS son los del manual de marca", () => {
  const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

  const ESPERADOS: Record<string, string> = {
    "--color-papel": "#ffffff",
    "--color-hueso": "#fbfcf7",
    "--color-palido": "#e1f6b6",
    "--color-verde": "#71b725",
    "--color-verde-texto": "#4a7d18",
    "--color-verde-hondo": "#3c6411",
    "--color-tinta": "#1c2a14",
    "--color-oro": "#8a6f00",
  };

  for (const [token, hex] of Object.entries(ESPERADOS)) {
    it(`${token} vale ${hex}`, () => {
      expect(css).toContain(`${token}: ${hex}`);
    });
  }

  it("el tema es claro y no queda ningún fondo oscuro declarado", () => {
    expect(css).toContain("color-scheme: light");
    expect(css).not.toContain("#111211");
  });

  it("los tres verdes comparten familia de tono", () => {
    const tono = (hex: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max === min) return 0;
      const d = max - min;
      let h: number;
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      return (h * 60 + 360) % 360;
    };
    const tonos = [VERDE, VERDE_TEXTO, VERDE_HONDO].map(tono);
    const max = Math.max(...tonos);
    const min = Math.min(...tonos);
    expect(max - min, `tonos: ${tonos.map((t) => t.toFixed(0)).join(", ")}`).toBeLessThan(12);
  });
});
