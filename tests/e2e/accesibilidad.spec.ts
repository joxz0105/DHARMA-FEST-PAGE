import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const rutas = ['/', '/experiencias', '/marcas', '/nosotros', '/2027', '/en/'];

for (const ruta of rutas) {
  test(`${ruta} no tiene violaciones críticas de accesibilidad`, async ({ page }) => {
    // <Reveal> anima con opacity/transform durante ~600ms al entrar en
    // viewport (ver src/components/ui/Reveal.astro). Si axe escanea a
    // mitad de esa transición, mide un color a medio camino entre el texto
    // y el fondo y reporta contrastes que nunca existen en reposo. Con
    // reduced-motion, Reveal salta directo al estado final (mismo camino
    // que ya usan las personas que piden menos movimiento), así que axe
    // mide los colores reales del diseño en vez de un cuadro de animación.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(ruta);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const graves = violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(
      graves.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodos)`),
    ).toEqual([]);
  });
}

test('el sitio declara sitemap y robots', async ({ page }) => {
  const sitemap = await page.goto('/sitemap-index.xml');
  expect(sitemap?.status()).toBe(200);

  const robots = await page.goto('/robots.txt');
  expect(robots?.status()).toBe(200);
  expect(await robots?.text()).toContain('Sitemap:');
});
