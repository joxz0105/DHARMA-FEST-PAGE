import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

type Bilingue = { es: string; en: string };
type Datos = {
  categorias: { slug: string; nombre: Bilingue }[];
  beneficios: { marca: string; categoria: string; descuento: number; sobre: Bilingue }[];
};

// Los conteos salen del JSON: si el cliente suma una marca, el test no se
// rompe por un numero escrito a mano.
const datos: Datos = JSON.parse(
  readFileSync(path.join(process.cwd(), "content/beneficios.json"), "utf8"),
);
const total = datos.beneficios.length;
const deCategoria = (slug: string) => datos.beneficios.filter((b) => b.categoria === slug);

const tarjetas = '[data-tarjeta-beneficio]';

/** Lo que ve el usuario: "Marca: X% de descuento en ...". El uppercase es solo CSS. */
async function titulosDeTarjetas(page: import("@playwright/test").Page) {
  const titulos = await page.locator(`${tarjetas} h3`).allTextContents();
  // Sin esta guarda, una lista vacia "esta ordenada" y el test pasaria igual.
  expect(titulos).toHaveLength(total);
  return titulos;
}

test.describe("Beneficios Dharma", () => {
  test("lista todos los beneficios y dice cuántos son", async ({ page }) => {
    await page.goto("/beneficios");
    await expect(page.locator(tarjetas)).toHaveCount(total);
    await expect(page.locator("#catalogo")).toContainText(`${total} resultados`);
    // Control del selector que usa el test de /2027 para decir "aca no hay
    // logos": si aca no encontrara ninguno, aquel cero no probaria nada.
    await expect(page.locator('#catalogo img[src*="marcas-"]')).toHaveCount(total);
  });

  test("cada categoría filtra a su propia página", async ({ page }) => {
    await page.goto("/beneficios");
    const categorias = page.getByRole("navigation", { name: "Categorías de beneficios" });

    for (const categoria of datos.categorias) {
      await categorias.getByRole("link", { name: new RegExp(`^${categoria.nombre.es}`) }).click();
      await expect(page).toHaveURL(new RegExp(`/beneficios/${categoria.slug}$`));
      await expect(page.locator("h1")).toHaveText(categoria.nombre.es);

      const esperadas = deCategoria(categoria.slug);
      await expect(page.locator(tarjetas)).toHaveCount(esperadas.length);
      for (const b of esperadas) {
        await expect(page.locator(tarjetas).filter({ hasText: b.marca })).toHaveCount(1);
      }
      // La categoria activa se anuncia como pagina actual, no solo con color.
      await expect(categorias.locator('[aria-current="page"]')).toContainText(categoria.nombre.es);
    }
  });

  test("cada tarjeta dice marca, porcentaje y sobre qué aplica", async ({ page }) => {
    await page.goto("/beneficios");
    for (const b of datos.beneficios) {
      const tarjeta = page.locator(tarjetas).filter({ hasText: `${b.marca}:` });
      await expect(tarjeta.getByRole("heading", { level: 3 })).toHaveText(
        `${b.marca}: ${b.descuento}% de descuento ${b.sobre.es}`,
      );
    }
  });

  test("ordenar por mayor descuento pone primero el porcentaje más alto", async ({ page }) => {
    await page.goto("/beneficios");
    await page.getByLabel("Ordenar").selectOption("descuento");

    const porcentajes = (await titulosDeTarjetas(page)).map((t) => Number(t.match(/(\d+)%/)?.[1]));
    expect(porcentajes.every(Number.isFinite), "algún título no trae porcentaje").toBe(true);
    expect(porcentajes).toEqual([...porcentajes].sort((a, b) => b - a));
  });

  test("ordenar por marca las deja en orden alfabético", async ({ page }) => {
    await page.goto("/beneficios");
    await page.getByLabel("Ordenar").selectOption("marca");

    const marcas = (await titulosDeTarjetas(page)).map((t) => t.split(":")[0].trim());
    expect(marcas.every((m) => m.length > 0)).toBe(true);
    const esperado = [...marcas].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
    expect(marcas).toEqual(esperado);
    expect(new Set(marcas)).toEqual(new Set(datos.beneficios.map((b) => b.marca)));
  });

  test("una categoría que no existe da 404 con página propia", async ({ page }) => {
    const respuesta = await page.goto("/beneficios/no-existe");
    expect(respuesta?.status()).toBe(404);
    await expect(page.getByRole("link", { name: /volver al inicio/i })).toBeVisible();
  });

  test("en inglés las categorías y las tarjetas están traducidas", async ({ page }) => {
    const movimiento = datos.categorias.find((c) => c.slug === "movimiento")!;
    await page.goto("/en/beneficios/movimiento");
    await expect(page.locator("h1")).toHaveText(movimiento.nombre.en);
    await expect(page.locator("#catalogo")).toContainText(
      `${deCategoria("movimiento").length} results`,
    );
    for (const b of deCategoria("movimiento")) {
      const tarjeta = page.locator(tarjetas).filter({ hasText: `${b.marca}:` });
      await expect(tarjeta.getByRole("heading", { level: 3 })).toHaveText(
        `${b.marca}: ${b.descuento}% off ${b.sobre.en}`,
      );
      await expect(tarjeta).toContainText(movimiento.nombre.en);
    }
  });

  test("a 320px ningún título de categoría se corta", async ({ page }) => {
    // El hero tiene overflow-hidden: un titular mas ancho que su caja no
    // genera scroll, se recorta en silencio. Por eso no alcanza con mirar el
    // documento; hay que medir el h1.
    await page.setViewportSize({ width: 320, height: 700 });
    for (const idioma of ["", "/en"]) {
      for (const ruta of ["/beneficios", ...datos.categorias.map((c) => `/beneficios/${c.slug}`)]) {
        await page.goto(`${idioma}${ruta}`);
        const h1 = page.locator("h1");
        const { ancho, contenido } = await h1.evaluate((el) => ({
          ancho: el.clientWidth,
          contenido: el.scrollWidth,
        }));
        expect(contenido, `${idioma}${ruta}`).toBeLessThanOrEqual(ancho);
      }
    }
  });

  test("el cuerpo no se desborda a lo ancho", async ({ page }) => {
    await page.goto("/beneficios");
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborde).toBe(false);
  });
});

test("el 2027 anuncia el rango del catálogo y manda a Beneficios Dharma", async ({ page }) => {
  const porcentajes = datos.beneficios.map((b) => b.descuento);
  await page.goto("/2027");
  const seccion = page.locator("#que-incluye");
  await expect(seccion).toContainText(
    `Entre ${Math.min(...porcentajes)}% y ${Math.max(...porcentajes)}% de descuento`,
  );
  // Los logos ya no viven aca: el cliente pidio que el catalogo fuera aparte.
  // La unica imagen que queda es la foto de fondo de la seccion.
  await expect(seccion.locator('img[src*="marcas-"]')).toHaveCount(0);

  await seccion.getByRole("link", { name: "Ver Beneficios Dharma" }).click();
  await expect(page).toHaveURL(/\/beneficios$/);
});

test("en la cabecera, Beneficios Dharma va justo después de Dharma Fest 2027", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: /abrir el menú/i }).click();
  const nav = isMobile
    ? page.locator("#menu-movil")
    : page.getByRole("navigation", { name: "Inicio" });
  const textos = await nav.getByRole("link").allTextContents();
  const i = textos.indexOf("Dharma Fest 2027");
  expect(i).toBeGreaterThanOrEqual(0);
  expect(textos[i + 1]).toBe("Beneficios Dharma");
});

test("la cabecera no se desborda en el ancho donde aparece el menú completo", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "en movil los enlaces viven en el menu");
  // lg arranca en 1024: es el ancho mas apretado con cinco enlaces a la vista.
  // El test de desborde de la home corre a 1280, justo salteandose este.
  for (const ancho of [1024, 1100, 1180]) {
    await page.setViewportSize({ width: ancho, height: 800 });
    for (const ruta of ["/", "/en"]) {
      await page.goto(ruta);
      const medida = await page.locator("header").evaluate((h) => {
        const nav = h.querySelector("nav");
        const enlaces = [...(nav?.querySelectorAll("a") ?? [])].map((a) =>
          a.getBoundingClientRect(),
        );
        const navCaja = nav?.getBoundingClientRect();
        const idioma = h.querySelector("nav + div")?.getBoundingClientRect();
        return {
          desborda: h.scrollWidth > h.clientWidth,
          // Todos en la misma fila y ninguno partido en dos lineas. La altura
          // de la cabecera no sirve para esto: la manda el logo, que es mas
          // alto que dos lineas de enlaces.
          filas: new Set(enlaces.map((r) => Math.round(r.top))).size,
          masAlto: Math.max(...enlaces.map((r) => r.height)),
          // Y la navegacion no se monta sobre el selector de idioma.
          pisa: navCaja && idioma ? navCaja.right > idioma.left : false,
        };
      });
      const donde = `${ruta} a ${ancho}px`;
      expect(medida.desborda, donde).toBe(false);
      expect(medida.filas, donde).toBe(1);
      expect(medida.masAlto, donde).toBeLessThan(30);
      expect(medida.pisa, donde).toBe(false);
    }
  }
});
