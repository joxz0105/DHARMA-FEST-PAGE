import { expect, test } from '@playwright/test';

test('el hero muestra el titular de la marca', async ({ page }) => {
  await page.goto('/');
  const h1 = page.getByRole('heading', { level: 1 });
  await expect(h1).toContainText('El bienestar no tiene');
  await expect(h1).toContainText('una sola forma');
});

test('el hero tiene un llamado a la acción que lleva al registro', async ({ page }) => {
  await page.goto('/');
  const cta = page.getByRole('link', { name: /sumate a la comunidad/i }).first();
  await expect(cta).toHaveAttribute('href', '#sumate');
});

test('el marquee es decorativo y no lo lee el lector de pantalla', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-marquee]')).toHaveAttribute('aria-hidden', 'true');
});

test('los siete ejes existen como texto real, no solo en el marquee', async ({ page }) => {
  await page.goto('/');
  const ejes = page.locator('[data-eje]');
  await expect(ejes).toHaveCount(7);
  await expect(ejes.first()).toContainText('Charlas');
});

test('toda imagen de contenido en las secciones superiores tiene alt', async ({ page }) => {
  await page.goto('/');
  // La imagen de fondo del hero es la única excepción deliberada: es
  // decoración y lleva alt="" a propósito (ver test siguiente), así que
  // se excluye aquí para no confundir "decorativa" con "le falta el alt".
  const imagenes = page.locator('main img:not([alt=""])');
  const total = await imagenes.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    const alt = await imagenes.nth(i).getAttribute('alt');
    expect(alt, `imagen ${i} sin alt`).toBeTruthy();
  }
});

test('la imagen de fondo del hero es decorativa', async ({ page }) => {
  await page.goto('/');
  // Es el LCP: decoración de fondo, el h1 ya comunica el mensaje.
  await expect(page.locator('main img').first()).toHaveAttribute('alt', '');
});

test('la home inglesa traduce el hero', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('more than one shape');
});
