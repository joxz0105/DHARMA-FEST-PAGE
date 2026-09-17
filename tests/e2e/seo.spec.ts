import { expect, test } from "@playwright/test";

test("cada página declara su alternativa en el otro idioma", async ({ page }) => {
  await page.goto("/patrocinios");
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1);
  const en = page.locator('link[rel="alternate"][hreflang="en"]');
  await expect(en).toHaveCount(1);
  await expect(en).toHaveAttribute("href", /\/en\/patrocinios$/);
});

test("la canónica apunta a la propia página, no a la del otro idioma", async ({ page }) => {
  await page.goto("/en/patrocinios");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  await expect(canonical).toHaveAttribute("href", /\/en\/patrocinios$/);

  await page.goto("/patrocinios");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /dharmafestcr\.com\/patrocinios$/,
  );
});

test("la home tiene descripción y no la hereda vacía", async ({ page }) => {
  await page.goto("/");
  const desc = await page.locator('meta[name="description"]').getAttribute("content");
  expect(desc?.length ?? 0).toBeGreaterThan(50);
  expect(desc).toContain("Costa Rica");
});

test("el sitemap lista las rutas en ambos idiomas", async ({ request }) => {
  const respuesta = await request.get("/sitemap.xml");
  expect(respuesta.status()).toBe(200);
  const xml = await respuesta.text();
  for (const ruta of [
    "/patrocinios",
    "/en/patrocinios",
    "/road-to-dharma",
    "/2027",
    "/beneficios",
    "/en/beneficios",
    "/beneficios/movimiento",
    "/en/beneficios/movimiento",
  ]) {
    // Con el <loc> completo: como subcadena, "/beneficios" aparecia dentro de
    // las URL de categoria y el test pasaba aunque faltara la pagina indice.
    expect(xml, `falta ${ruta} en el sitemap`).toContain(
      `<loc>https://dharmafestcr.com${ruta}</loc>`,
    );
  }
});

test("robots.txt existe y apunta al sitemap", async ({ request }) => {
  const respuesta = await request.get("/robots.txt");
  expect(respuesta.status()).toBe(200);
  expect((await respuesta.text()).toLowerCase()).toContain("sitemap");
});

test("cada página tiene un título distinto", async ({ page }) => {
  const titulos = new Set<string>();
  const rutas = [
    "/",
    "/2027",
    "/beneficios",
    "/beneficios/movimiento",
    "/road-to-dharma",
    "/patrocinios",
    "/nosotros",
    "/privacidad",
  ];
  for (const ruta of rutas) {
    await page.goto(ruta);
    titulos.add(await page.title());
  }
  expect(titulos.size).toBe(rutas.length);
});
