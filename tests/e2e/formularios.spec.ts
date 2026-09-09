import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("captura de comunidad", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#sumate").scrollIntoViewIfNeeded();
  });

  test("la casilla de consentimiento nunca viene premarcada", async ({ page }) => {
    await expect(page.locator('#sumate input[name="consentimiento"]')).not.toBeChecked();
  });

  test("la finalidad del tratamiento está junto al formulario", async ({ page }) => {
    await expect(page.locator("#finalidad")).toBeVisible();
    await expect(page.locator('#sumate input[name="consentimiento"]')).toHaveAttribute(
      "aria-describedby",
      "finalidad",
    );
  });

  test("sin consentimiento el navegador no deja enviar", async ({ page }) => {
    await page.fill('#sumate input[name="correo"]', "persona@ejemplo.com");
    await page.click('#sumate button[type="submit"]');
    // La casilla es required: el envio se bloquea y el formulario sigue ahi.
    await expect(page.locator('#sumate input[name="correo"]')).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("un correo válido con consentimiento da acuse de recibo", async ({ page }) => {
    await page.fill('#sumate input[name="correo"]', `prueba+${Date.now()}@ejemplo.com`);
    await page.check('#sumate input[name="consentimiento"]');
    await page.click('#sumate button[type="submit"]');
    await expect(page.getByRole("status")).toBeVisible({ timeout: 15_000 });
  });

  test("un correo inválido con consentimiento devuelve el error del servidor", async ({ page }) => {
    // type=email bloquearia la validacion nativa, asi que se quita para
    // comprobar que el servidor tambien valida y no confia en el navegador.
    await page.locator('#sumate input[name="correo"]').evaluate((e) => e.setAttribute("type", "text"));
    await page.fill('#sumate input[name="correo"]', "esto-no-es-un-correo");
    await page.check('#sumate input[name="consentimiento"]');
    await page.click('#sumate button[type="submit"]');
    await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
  });

  test("se recorre con el teclado en orden", async ({ page }) => {
    await page.locator('#sumate input[name="nombre"]').focus();
    await page.keyboard.press("Tab");
    await expect(page.locator('#sumate input[name="correo"]')).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator('#sumate input[name="consentimiento"]')).toBeFocused();
  });
});

test("la página de privacidad dice que el texto legal está pendiente", async ({ page }) => {
  await page.goto("/privacidad");
  await expect(page.locator("h1")).toContainText("Privacidad");
  await expect(page.getByText("Ley 8968")).toBeVisible();
  await expect(page.getByText("info@dharmafestcr.com").first()).toBeVisible();
});

test("privacidad no tiene violaciones de accesibilidad", async ({ page }) => {
  await page.goto("/privacidad");
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});
