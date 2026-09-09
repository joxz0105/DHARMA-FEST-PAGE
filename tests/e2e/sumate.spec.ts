import { expect, test } from '@playwright/test';

test('el campo de correo tiene etiqueta accesible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel(/tu correo electrónico/i)).toBeVisible();
});

test('un correo inválido muestra error y no navega', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel(/tu correo electrónico/i).fill('no-es-correo');
  await page.getByRole('button', { name: /sumarme/i }).click();

  await expect(page.getByRole('alert')).toContainText(/revisá el correo/i);
  await expect(page).not.toHaveURL(/gracias/);
});

test('un correo válido lleva a la página de gracias', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel(/tu correo electrónico/i).fill('hola@dharmafest.cr');
  await page.getByRole('button', { name: /sumarme/i }).click();

  await expect(page).toHaveURL(/\/gracias\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/ya sos parte/i);
});

test('el CTA del hero baja hasta el formulario', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /sumate a la comunidad/i }).first().click();
  await expect(page.locator('#sumate')).toBeInViewport();
});

test('la sección de voces se oculta si ningún testimonio tiene permiso', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#voces')).toHaveCount(0);
});

test('la versión inglesa del formulario también valida', async ({ page }) => {
  await page.goto('/en/');
  await page.getByLabel(/your email/i).fill('mal');
  await page.getByRole('button', { name: /join/i }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});

// <Sumate> antes solo vivía en /, /2027 y /nosotros: el listado de
// experiencias, el detalle de una experiencia y /marcas dejaban al
// visitante sin ningún camino hacia el único mecanismo de conversión del
// sitio. Una página por grupo, en los dos idiomas, alcanza para blindarlo
// sin volver la suite interminable.
const paginasConSumate = [
  '/experiencias',
  '/en/experiencias',
  '/experiencias/conecta-con-tu-piel',
  '/en/experiencias/conecta-con-tu-piel',
  '/marcas',
  '/en/marcas',
];

for (const ruta of paginasConSumate) {
  test(`${ruta} incluye el formulario de suscripción`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.locator('#sumate')).toBeVisible();
  });
}
