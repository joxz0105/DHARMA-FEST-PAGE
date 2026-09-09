import { expect, test } from "@playwright/test";

test("el servidor responde", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBeLessThan(400);
});
