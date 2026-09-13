import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const RUTAS = ["/road-to-dharma", "/2027", "/nosotros", "/patrocinios", "/privacidad"];

for (const ruta of RUTAS) {
  test.describe(ruta, () => {
    test("responde y tiene un solo h1", async ({ page }) => {
      const respuesta = await page.goto(ruta);
      expect(respuesta?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test("tiene título de página propio", async ({ page }) => {
      await page.goto(ruta);
      const titulo = await page.title();
      expect(titulo).toContain("Dharma Fest");
      expect(titulo, "el título no puede ser el genérico").not.toBe("Dharma Fest");
    });

    test("no tiene violaciones de accesibilidad", async ({ page }) => {
      await page.goto(ruta);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });

    test("existe también en inglés", async ({ page }) => {
      const respuesta = await page.goto(`/en${ruta}`);
      expect(respuesta?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });
}

test("el 2027 anuncia la fecha que confirmó el cliente", async ({ page }) => {
  await page.goto("/2027");
  await expect(page.getByText("Febrero 2027")).toBeVisible();
});

test("las entradas dicen que van por tiquetera, sin botón que no lleve a nada", async ({ page }) => {
  await page.goto("/");
  const entradas = page.locator("#entradas");
  await expect(entradas).toContainText("tiquetera");
  // Mientras entradasUrl sea null no debe haber enlace de compra.
  await expect(entradas.getByRole("link")).toHaveCount(0);
});

test("una ruta inexistente da 404 con página propia", async ({ page }) => {
  const respuesta = await page.goto("/no-existe-esta-pagina");
  expect(respuesta?.status()).toBe(404);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByRole("link", { name: /volver al inicio/i })).toBeVisible();
});

const DESTINOS = [
  ["Dharma Fest 2027", "/2027"],
  ["Road to Dharma", "/road-to-dharma"],
  ["Patrocinios", "/patrocinios"],
  ["Nosotros", "/nosotros"],
] as const;

test("se puede llegar a todas las páginas desde la cabecera", async ({ page, isMobile }) => {
  await page.goto("/");

  // En movil la navegacion vive detras del boton de menu: sin abrirlo, los
  // enlaces no estan en el arbol de accesibilidad.
  if (isMobile) {
    await page.getByRole("button", { name: /abrir el menú/i }).click();
  }

  for (const [nombre, destino] of DESTINOS) {
    const enlace = page.getByRole("link", { name: nombre, exact: true }).first();
    await expect(enlace).toHaveAttribute("href", destino);
  }
});

test("el menú móvil se abre, navega y se cierra con Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "solo aplica al menú de pantallas chicas");
  await page.goto("/");

  const boton = page.getByRole("button", { name: /abrir el menú/i });
  await expect(boton).toHaveAttribute("aria-expanded", "false");
  await boton.click();
  await expect(page.getByRole("button", { name: /cerrar el menú/i }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: "Patrocinios", exact: true })).toHaveCount(0);

  await boton.click();
  await page.getByRole("link", { name: "Patrocinios", exact: true }).click();
  await expect(page).toHaveURL(/patrocinios/);
});
