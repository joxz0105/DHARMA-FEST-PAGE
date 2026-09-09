import { expect, test } from '@playwright/test';

test('el listado separa próximas de pasadas', async ({ page }) => {
  await page.goto('/experiencias');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-grupo="proximas"] [data-experiencia]')).toHaveCount(1);
  await expect(page.locator('[data-grupo="pasadas"] [data-experiencia]')).toHaveCount(2);
});

test('el listado inglés solo muestra contenido en inglés', async ({ page }) => {
  await page.goto('/en/experiencias');
  await expect(page.locator('[data-experiencia]')).toHaveCount(3);
  await expect(page.locator('body')).not.toContainText('Conectá con tu piel');
});

test('el detalle renderiza el cuerpo del Markdown', async ({ page }) => {
  await page.goto('/experiencias/conecta-con-tu-piel');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Conectá con tu piel');
  await expect(page.locator('main')).toContainText('Fue movernos, aprender, descubrir');
});

test('el detalle declara hreflang hacia su par en inglés', async ({ page }) => {
  await page.goto('/experiencias/conecta-con-tu-piel');
  const alterno = page.locator('link[rel="alternate"][hreflang="en"]');
  await expect(alterno).toHaveAttribute('href', /\/en\/experiencias\/conecta-con-tu-piel/);
});

test('una experiencia inexistente devuelve 404', async ({ page }) => {
  const respuesta = await page.goto('/experiencias/no-existe');
  expect(respuesta?.status()).toBe(404);
});
