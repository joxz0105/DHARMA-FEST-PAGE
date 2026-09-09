import { expect, test } from '@playwright/test';

test('la sección de experiencias muestra la próxima primero', async ({ page }) => {
  await page.goto('/');
  const tarjetas = page.locator('[data-experiencia]');
  await expect(tarjetas).toHaveCount(3);
  await expect(tarjetas.first()).toContainText(/próxima/i);
});

test('cada tarjeta de experiencia enlaza a su detalle', async ({ page }) => {
  await page.goto('/');
  const primera = page.locator('[data-experiencia] a').first();
  await expect(primera).toHaveAttribute('href', /\/experiencias\//);
});

test('el bloque 2027 se renderiza sin contador mientras no haya fecha', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#fest-2027')).toBeVisible();
  await expect(page.locator('#fest-2027')).toContainText('2027');
  await expect(page.locator('[data-cuenta]')).toHaveCount(0);
});

test('las cifras del 2025 se muestran completas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-cifra]')).toHaveCount(4);
});

test('la sección de marcas se oculta si ninguna tiene permiso', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#marcas')).toHaveCount(0);
});
