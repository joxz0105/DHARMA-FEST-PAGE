import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { expect, test } from "@playwright/test";

/**
 * Legibilidad real del texto sobre las fotos.
 *
 * axe NO cubre esto: cuando el fondo es una imagen no puede calcular el
 * contraste y se salta el nodo. Ya paso dos veces — primero el titular del
 * hero quedo en tinta sobre verde, despues el cuerpo blanco cayo sobre la
 * pared clara de una foto. Las pruebas seguian en verde y la pagina no se leia.
 *
 * Aca no se mira el color declarado sino lo que hay DETRAS: se esconde el
 * texto de la seccion, se fotografia el area donde estaba y se mide la
 * luminancia real de ese fondo, ya con foto, scrim y degradados aplicados.
 *
 * Este test tuvo dos agujeros que lo hacian aprobar sin medir, y los dos se
 * encontraron al sumar Beneficios Dharma:
 *
 * 1. En movil la captura salia a la densidad del dispositivo (2.625 en el
 *    Pixel 7) y se recorria con coordenadas CSS: medía en otro lugar.
 * 2. Tailwind 4 escribe los colores con opacidad (text-hueso/80) como
 *    oklab(...), y el color se leia con una expresion regular pensada para
 *    rgb(): salia una luminancia de millones y el texto aprobaba siempre.
 *    Ademas el alfa se ignoraba, como si el texto al 80% fuera opaco.
 *
 * Ahora el color se normaliza pintandolo en un canvas, y el texto se mezcla
 * con su fondo real segun su alfa antes de medir.
 */
const categorias: { slug: string }[] = JSON.parse(
  readFileSync(path.join(process.cwd(), "content/beneficios.json"), "utf8"),
).categorias;

// Las categorias salen del JSON: cada una trae su propia foto y su propio
// oscurecido, y una categoria nueva no puede quedar sin medir.
const RUTAS = [
  "/",
  "/patrocinios",
  "/road-to-dharma",
  "/2027",
  "/beneficios",
  ...categorias.map((c) => `/beneficios/${c.slug}`),
  "/nosotros",
  "/privacidad",
];

// WCAG: 4.5 para texto normal, 3 para texto grande (>=24px, o >=18.7px negrita).
const MINIMO_NORMAL = 4.5;
const MINIMO_GRANDE = 3;

function canal(v: number): number {
  const x = v / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

function luminancia(r: number, g: number, b: number): number {
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function contraste(a: number, b: number): number {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

for (const ruta of RUTAS) {
  test(`el texto se lee sobre la foto en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(900);

    // Texto que vive dentro de una seccion con foto de fondo.
    const piezas = await page.evaluate(() => {
      // Cualquier sintaxis de color (rgb, oklab, color-mix...) pasa a RGBA
      // pintandola en un pixel. El centinela delata un color que el canvas
      // no pudo leer: en vez de aprobar a ciegas, el test lo reporta.
      const lienzo = document.createElement("canvas");
      lienzo.width = lienzo.height = 1;
      const ctx = lienzo.getContext("2d", { willReadFrequently: true })!;
      const CENTINELA = "rgb(1, 2, 3)";
      const aRgba = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = CENTINELA;
        ctx.fillStyle = css;
        const leido = css.trim() !== "" && ctx.fillStyle !== CENTINELA && ctx.fillStyle !== "#010203";
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return { rgb: [r, g, b], alfa: a / 255, leido };
      };

      const salida: {
        x: number; y: number; w: number; h: number;
        color: number[]; alfa: number; leido: boolean; grande: boolean; texto: string;
      }[] = [];
      for (const fondo of document.querySelectorAll('[data-fondo="verde"]')) {
        const seccion = fondo.parentElement;
        if (!seccion) continue;
        // Tambien enlaces, etiquetas y texto en linea: la etiqueta de la casilla
        // de consentimiento vive en un span, y quedaba sin medir.
        const selector = "h1, h2, h3, h4, p, li, figcaption, dd, a, label, span, strong, em";
        for (const el of seccion.querySelectorAll(selector)) {
          const tieneTexto = [...el.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 2,
          );
          if (!tieneTexto) continue;

          // Lo que trae relleno propio se juzga contra su relleno, no la foto.
          let conFondo = false;
          for (let n: Element | null = el; n && n !== seccion; n = n.parentElement) {
            if (aRgba(getComputedStyle(n).backgroundColor).alfa > 0.5) conFondo = true;
          }
          if (conFondo) continue;

          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > document.body.scrollHeight) continue;
          const estilo = getComputedStyle(el);
          const { rgb, alfa, leido } = aRgba(estilo.color);
          const tam = Number.parseFloat(estilo.fontSize);
          const negrita = Number(estilo.fontWeight) >= 700;
          const grande = tam >= 24 || (negrita && tam >= 18.7);
          salida.push({
            x: Math.round(r.left + window.scrollX),
            y: Math.round(r.top + window.scrollY),
            w: Math.round(r.width),
            h: Math.round(r.height),
            color: rgb,
            alfa,
            leido,
            grande,
            texto: (el.textContent ?? "").trim().slice(0, 40),
          });
        }
      }
      return salida;
    });

    expect(piezas.length, `no se encontro texto sobre foto en ${ruta}`).toBeGreaterThan(0);
    const sinLeer = piezas.filter((p) => !p.leido).map((p) => p.texto);
    expect(sinLeer, "colores de texto que el test no supo leer").toEqual([]);

    // Se esconde el texto para fotografiar solo el fondo.
    await page.addStyleTag({
      content: '[data-fondo="verde"] ~ * { visibility: hidden !important; }',
    });
    await page.waitForTimeout(250);
    // scale "css": las coordenadas de arriba son pixeles CSS, y la captura
    // tiene que estar en la misma escala (ver el punto 1 de arriba).
    const captura = await page.screenshot({ fullPage: true, scale: "css" });
    const { data, info } = await sharp(captura).raw().toBuffer({ resolveWithObject: true });
    const anchoCss = await page.evaluate(() => window.innerWidth);
    expect(info.width, "la captura tiene que estar en la misma escala que las coordenadas").toBe(
      anchoCss,
    );

    const fallos: string[] = [];
    for (const p of piezas) {
      let sumaLum = 0;
      const sumaRgb = [0, 0, 0];
      let n = 0;
      for (let y = p.y; y < Math.min(p.y + p.h, info.height); y += 2) {
        for (let x = p.x; x < Math.min(p.x + p.w, info.width); x += 2) {
          const i = (y * info.width + x) * info.channels;
          sumaLum += luminancia(data[i], data[i + 1], data[i + 2]);
          sumaRgb[0] += data[i];
          sumaRgb[1] += data[i + 1];
          sumaRgb[2] += data[i + 2];
          n++;
        }
      }
      if (!n) continue;
      const fondo = sumaLum / n;
      // El texto con opacidad se ve mezclado con lo que tiene detras: text-hueso/80
      // sobre una foto oscura es mas gris que el hueso puro.
      const mezclado = p.color.map((c, k) => p.alfa * c + (1 - p.alfa) * (sumaRgb[k] / n));
      const texto = luminancia(mezclado[0], mezclado[1], mezclado[2]);
      const razon = contraste(texto, fondo);
      const minimo = p.grande ? MINIMO_GRANDE : MINIMO_NORMAL;
      if (razon < minimo) {
        fallos.push(
          `"${p.texto}" -> ${razon.toFixed(2)}:1 (pide ${minimo}, fondo ${fondo.toFixed(2)}, alfa ${p.alfa.toFixed(2)})`,
        );
      }
    }

    expect(fallos, `texto ilegible sobre la foto en ${ruta}`).toEqual([]);
  });
}
