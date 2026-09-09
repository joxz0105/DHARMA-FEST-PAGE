import { expect, test } from '@playwright/test';

const rutas = ['/2027', '/marcas', '/nosotros'];

for (const ruta of rutas) {
  test(`${ruta} carga con un solo h1`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test(`${ruta} existe también en inglés`, async ({ page }) => {
    const respuesta = await page.goto(`/en${ruta}`);
    expect(respuesta?.status()).toBe(200);
  });
}

test('el formulario de marcas está anclado en #aplicar', async ({ page }) => {
  await page.goto('/marcas#aplicar');
  await expect(page.locator('#aplicar')).toBeInViewport();
});

test('el 404 ofrece volver al inicio', async ({ page }) => {
  const respuesta = await page.goto('/ruta-que-no-existe');
  expect(respuesta?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /volver al inicio/i })).toBeVisible();
});

test('todas las páginas comparten cabecera y pie', async ({ page }) => {
  for (const ruta of rutas) {
    await page.goto(ruta);
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
  }
});
