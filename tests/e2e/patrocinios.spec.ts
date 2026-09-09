import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("patrocinios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/patrocinios");
  });

  test("no se publica ningún precio", async ({ page }) => {
    // El precio de cada paquete vive en content/paquetes.json pero no se
    // renderiza: se negocia y se ajusta por edicion. Ver spec §3.
    const todo = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    for (const senal of ["US$", "+IVA", "USD"]) {
      expect(todo, `aparece "${senal}"`).not.toContain(senal);
    }

    // Las cifras se buscan solo dentro de los paquetes: "2.000 asistentes"
    // es publico proyectado, no plata, y vive en otra seccion.
    const paquetes = (await page.locator("#paquetes").innerText()).replace(/\s+/g, " ");
    for (const monto of ["7000", "7.000", "4000", "4.000", "2000", "2.000"]) {
      expect(paquetes, `aparece el monto ${monto}`).not.toContain(monto);
    }
  });

  test("están los tres paquetes con sus tres grupos de beneficios", async ({ page }) => {
    const paquetes = page.locator("#paquetes article");
    await expect(paquetes).toHaveCount(3);
    await expect(page.locator("#paquetes")).toContainText("Oficial");
    await expect(page.locator("#paquetes")).toContainText("Oro");
    await expect(page.locator("#paquetes")).toContainText("Plata");
    // Tres grupos por paquete.
    await expect(page.locator("#paquetes article h4")).toHaveCount(9);
  });

  test("el argumento de venta del deck abre la página", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Comprá presencia");
    await expect(page.getByText("No comprés segundos")).toBeVisible();
  });

  test("los datos de audiencia salen del deck", async ({ page }) => {
    const publico = page.locator("#publico");
    await expect(publico).toContainText("68,2");
    await expect(publico).toContainText("31,8");
    await expect(publico).toContainText("43,1");
  });

  test("cada barra de edad lleva su porcentaje como texto", async ({ page }) => {
    const filas = page.locator("#publico ul li").filter({ hasText: "%" });
    expect(await filas.count()).toBeGreaterThanOrEqual(4);
  });

  test("lo que viene anuncia los dos días y los 2.000 asistentes", async ({ page }) => {
    const loQueViene = page.locator("#lo-que-viene");
    await expect(loQueViene).toContainText("2.000");
    await expect(loQueViene).toContainText("dos días completos");
  });

  test("el formulario de propuesta pide la marca y el consentimiento", async ({ page }) => {
    await expect(page.locator('#propuesta input[name="marca"]')).toBeVisible();
    await expect(page.locator('#propuesta input[name="consentimiento"]')).not.toBeChecked();
  });

  test("hay un solo h1 y los encabezados no saltan niveles", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    const niveles = await page
      .locator("h1, h2, h3, h4")
      .evaluateAll((nodos) => nodos.map((n) => Number(n.tagName[1])));
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
});

test("en inglés el argumento se transcrea, no se traduce literal", async ({ page }) => {
  await page.goto("/en/patrocinios");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Buy presence");
  const todo = await page.locator("body").innerText();
  expect(todo).not.toContain("US$");
});
