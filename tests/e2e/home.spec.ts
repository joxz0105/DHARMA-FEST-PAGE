import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("el hero lleva el nombre y el dato del festival", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dharma");
    await expect(page.getByText("3ra edición · 2 días · Campo Lago")).toBeVisible();
  });

  test("la foto del hero tiene un alt con sentido", async ({ page }) => {
    const alt = await page.locator("section img").first().getAttribute("alt");
    expect(alt?.length ?? 0).toBeGreaterThan(15);
  });

  test("el copy de quiénes somos es el del deck, literal", async ({ page }) => {
    await expect(
      page.getByText("Producimos las mejores experiencias de bienestar de Costa Rica"),
    ).toBeVisible();
  });

  test("hay cinco actividades y ocho temas", async ({ page }) => {
    await expect(page.locator("#actividades li")).toHaveCount(5);
    await expect(page.locator("#temas li")).toHaveCount(8);
  });

  test("las cifras del deck salen en pantalla", async ({ page }) => {
    await expect(page.locator("#cifras")).toContainText("+4000");
    await expect(page.locator("#cifras")).toContainText("67%");
    await expect(page.locator("#cifras")).toContainText("26K");
  });

  test("el muro muestra las marcas y cada logo lleva su nombre", async ({ page }) => {
    const logos = page.locator("#marcas li img");
    expect(await logos.count()).toBeGreaterThanOrEqual(55);
    for (const alt of await logos.evaluateAll((n) => n.map((i) => i.getAttribute("alt")))) {
      expect(alt?.trim()).toBeTruthy();
    }
  });

  test("hay cuatro asociaciones aliadas", async ({ page }) => {
    await expect(page.locator("#impacto li")).toHaveCount(4);
  });

  test("los tres salones aparecen con su nombre", async ({ page }) => {
    const sede = page.locator("#sede");
    await expect(sede).toContainText("Salón La Casita");
    await expect(sede).toContainText("Salón Terraza 360");
    await expect(sede).toContainText("Salón Higuerón");
  });

  test("las fotos decorativas no se anuncian al lector de pantalla", async ({ page }) => {
    // Galeria y sede: personas reales que no conocemos, alt vacio a proposito.
    const galeria = page.locator("#galeria img");
    expect(await galeria.count()).toBeGreaterThan(0);
    for (const alt of await galeria.evaluateAll((n) => n.map((i) => i.getAttribute("alt")))) {
      expect(alt).toBe("");
    }
  });

  test("hay un solo h1 y los encabezados no saltan niveles", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    const niveles = await page
      .locator("h1, h2, h3, h4")
      .evaluateAll((nodos) => nodos.map((n) => Number(n.tagName[1])));
    expect(niveles[0]).toBe(1);
    for (let i = 1; i < niveles.length; i++) {
      expect(niveles[i] - niveles[i - 1], `salto en el encabezado ${i}`).toBeLessThanOrEqual(1);
    }
  });

  test("no tiene violaciones de accesibilidad", async ({ page }) => {
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test("el cuerpo no se desborda a lo ancho", async ({ page }) => {
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desborde).toBe(false);
  });
});

test("la home en inglés traduce el hero y mantiene las cifras", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("3rd edition · 2 days · Campo Lago")).toBeVisible();
  await expect(page.locator("#cifras")).toContainText("+4000");
});
