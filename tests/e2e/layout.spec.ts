import { expect, test, type Page } from '@playwright/test';

/**
 * Debajo del breakpoint md el conmutador de idioma vive dentro del menú
 * móvil, que arranca cerrado. Si el botón de la hamburguesa es visible
 * (viewport móvil), lo abre antes de buscar el enlace de idioma.
 *
 * Se busca por nombre accesible dentro del <header>: en modo dev, la
 * barra de herramientas de Astro inyecta su propio botón "Menu" fuera
 * del header y colisionaría con una búsqueda global por rol.
 */
const localizarBotonMenu = (page: Page) =>
  page.getByRole('banner').getByRole('button', { name: /^men[uú]$/i });

const abrirMenuSiHaceFalta = async (page: Page) => {
  const hamburguesa = localizarBotonMenu(page);
  if (!(await hamburguesa.isVisible())) return;

  // Tras una navegación de página completa (MPA), el script que engancha
  // el listener del botón puede no haberse ejecutado aún si se hace clic
  // de inmediato; se espera a que la carga termine para evitar esa carrera.
  await page.waitForLoadState('load');
  await hamburguesa.click();
};

test('la home española carga con lang correcto', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('la home inglesa carga con lang correcto', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('hay exactamente un h1 por página', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
});

test('el enlace de salto lleva al contenido principal', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const salto = page.getByRole('link', { name: /saltar al contenido/i });
  await expect(salto).toBeFocused();

  await salto.press('Enter');
  await expect(page).toHaveURL(/#contenido$/);
  await expect(page.locator('#contenido')).toBeVisible();
  // El propósito del enlace de salto es mover el foco, no solo cambiar la URL:
  // <main> lleva tabindex="-1" precisamente para poder recibir el foco aquí.
  await expect(page.locator('#contenido')).toBeFocused();
});

test('el conmutador de idioma preserva la página', async ({ page }) => {
  await page.goto('/');

  await abrirMenuSiHaceFalta(page);
  await page.getByRole('link', { name: /english/i }).click();
  await expect(page).toHaveURL(/\/en\/$/);

  // Página recién cargada: el menú móvil vuelve a arrancar cerrado.
  await abrirMenuSiHaceFalta(page);
  await page.getByRole('link', { name: /español/i }).click();
  await expect(page).toHaveURL(/localhost:4321\/$/);
});

test('cada página declara hreflang para ambos idiomas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
});

test.describe('menú móvil', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('abre, navega por teclado y cierra con Escape', async ({ page }) => {
    await page.goto('/');

    const abrir = localizarBotonMenu(page);
    await expect(abrir).toHaveAttribute('aria-expanded', 'false');

    await abrir.click();
    await expect(abrir).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: /navegación principal/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(abrir).toHaveAttribute('aria-expanded', 'false');
    await expect(abrir).toBeFocused();
  });
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('el contenido dentro de Reveal sigue siendo visible', async ({ page }) => {
    await page.goto('/');
    // El h1 de la home está envuelto en <Reveal>: sin JS, el <noscript> debe
    // forzar opacity/transform a su estado final para que siga siendo visible.
    //
    // OJO: toBeVisible() de Playwright NO basta como aserción aquí, porque su
    // chequeo de visibilidad ignora `opacity` (solo mira display, visibility
    // y el bounding box). Un elemento con opacity: 0 reporta isVisible() ===
    // true, así que si la red del <noscript> se rompe (p. ej. se pierde el
    // !important), este test seguiría en verde aunque el contenido fuera
    // invisible para una persona real. Por eso se afirma sobre el estilo
    // computado: el test debe fallar si opacity no es exactamente '1'.
    const envoltorio = page.locator('.dh-reveal').first();
    await expect(envoltorio).toBeVisible();

    const opacidad = await envoltorio.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacidad).toBe('1');
  });
});
