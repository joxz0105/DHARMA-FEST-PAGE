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
 */
const RUTAS = ["/", "/patrocinios", "/road-to-dharma", "/2027", "/nosotros", "/privacidad"];

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
      const salida: {
        x: number; y: number; w: number; h: number;
        color: number[]; grande: boolean; texto: string;
      }[] = [];
      for (const fondo of document.querySelectorAll('[data-fondo="verde"]')) {
        const seccion = fondo.parentElement;
        if (!seccion) continue;
        for (const el of seccion.querySelectorAll("h1, h2, h3, h4, p, li, figcaption, dd")) {
          const tieneTexto = [...el.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 2,
          );
          if (!tieneTexto) continue;

          // Lo que trae relleno propio se juzga contra su relleno, no la foto.
          let conFondo = false;
          for (let n: Element | null = el; n && n !== seccion; n = n.parentElement) {
            const c = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
            if (c && (c.length < 4 || Number(c[3]) > 0.5)) conFondo = true;
          }
          if (conFondo) continue;

          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8 || r.bottom < 0 || r.top > document.body.scrollHeight) continue;
          const estilo = getComputedStyle(el);
          const col = estilo.color.match(/\d+/g)?.map(Number);
          if (!col) continue;
          const tam = Number.parseFloat(estilo.fontSize);
          const negrita = Number(estilo.fontWeight) >= 700;
          const grande = tam >= 24 || (negrita && tam >= 18.7);
          salida.push({
            x: Math.round(r.left + window.scrollX),
            y: Math.round(r.top + window.scrollY),
            w: Math.round(r.width),
            h: Math.round(r.height),
            color: col,
            grande,
            texto: (el.textContent ?? "").trim().slice(0, 40),
          });
        }
      }
      return salida;
    });

    expect(piezas.length, `no se encontro texto sobre foto en ${ruta}`).toBeGreaterThan(0);

    // Se esconde el texto para fotografiar solo el fondo.
    await page.addStyleTag({
      content: '[data-fondo="verde"] ~ * { visibility: hidden !important; }',
    });
    await page.waitForTimeout(250);
    const captura = await page.screenshot({ fullPage: true });
    const { data, info } = await sharp(captura).raw().toBuffer({ resolveWithObject: true });

    const fallos: string[] = [];
    for (const p of piezas) {
      let suma = 0;
      let n = 0;
      for (let y = p.y; y < Math.min(p.y + p.h, info.height); y += 2) {
        for (let x = p.x; x < Math.min(p.x + p.w, info.width); x += 2) {
          const i = (y * info.width + x) * info.channels;
          suma += luminancia(data[i], data[i + 1], data[i + 2]);
          n++;
        }
      }
      if (!n) continue;
      const fondo = suma / n;
      const texto = luminancia(p.color[0], p.color[1], p.color[2]);
      const razon = contraste(texto, fondo);
      const minimo = p.grande ? MINIMO_GRANDE : MINIMO_NORMAL;
      if (razon < minimo) {
        fallos.push(
          `"${p.texto}" -> ${razon.toFixed(2)}:1 (pide ${minimo}, fondo ${fondo.toFixed(2)})`,
        );
      }
    }

    expect(fallos, `texto ilegible sobre la foto en ${ruta}`).toEqual([]);
  });
}
