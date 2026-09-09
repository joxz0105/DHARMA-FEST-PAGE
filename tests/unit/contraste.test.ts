import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ratio } from "@/lib/contraste";

const NOCHE = "#111211";
const LIMA = "#C6D03F";
const PALIDO = "#E4E8AD";
const HUESO = "#FFFFFF";
const ORO = "#B59F15";
const LIMA_HUMO = "#98A138";
const LIMA_HONDO = "#80872D";

describe("contraste de la paleta", () => {
  it("todo tono de la rampa pasa AA como texto sobre noche", () => {
    for (const tono of [LIMA, PALIDO, HUESO, ORO, LIMA_HUMO, LIMA_HONDO]) {
      expect(ratio(tono, NOCHE), `${tono} sobre noche`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("el lima sobre blanco falla, y por eso no se usa así", () => {
    expect(ratio(LIMA, HUESO)).toBeLessThan(3);
  });

  it("calcula el ratio conocido de lima sobre noche", () => {
    expect(ratio(LIMA, NOCHE)).toBeCloseTo(11.17, 1);
  });

  it("es simétrico", () => {
    expect(ratio(LIMA, NOCHE)).toBeCloseTo(ratio(NOCHE, LIMA), 5);
  });
});

describe("los tokens del CSS son los del deck", () => {
  const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

  // Si alguien repinta la marca a ojo, esto lo caza. Los hex estan muestreados
  // pixel a pixel del PDF del cliente; no son una propuesta de diseno.
  const ESPERADOS: Record<string, string> = {
    "--color-noche": "#111211",
    "--color-lima": "#c6d03f",
    "--color-lima-humo": "#98a138",
    "--color-lima-hondo": "#80872d",
    "--color-palido": "#e4e8ad",
    "--color-oro": "#b59f15",
  };

  for (const [token, hex] of Object.entries(ESPERADOS)) {
    it(`${token} vale ${hex}`, () => {
      expect(css).toContain(`${token}: ${hex}`);
    });
  }

  it("palido no es un beige: comparte tono con el lima", () => {
    // Ambos viven en 64-65 grados. Un beige neutro rondaria los 35-45.
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
      return ((h * 60) + 360) % 360;
    };
    expect(Math.abs(tono(PALIDO) - tono(LIMA))).toBeLessThan(4);
  });
});
