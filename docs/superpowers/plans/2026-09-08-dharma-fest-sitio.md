# Sitio Dharma Fest CR — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la casa de marca de Dharma Fest Costa Rica: un sitio estático bilingüe cuya conversión principal es el registro a la comunidad.

**Architecture:** Astro 5 con salida estática y cero framework de UI. El contenido editable vive en `src/content/` (Markdown y JSON validados con Zod) y en `src/content/sitio/{es,en}.json`; los componentes solo reciben props. La home es una composición de trece componentes de sección independientes entre sí, de modo que reordenarla es mover líneas en `index.astro`. La interactividad se resuelve con JavaScript nativo en islas pequeñas.

**Tech Stack:** Astro 5, Tailwind CSS 4 (vía `@tailwindcss/vite`), TypeScript estricto, Vitest para unidades, Playwright + `@axe-core/playwright` para humo y accesibilidad, `sharp` para placeholders, `@fontsource` para fuentes auto-hospedadas.

**Spec:** `docs/superpowers/specs/2026-09-08-dharma-fest-sitio-design.md`

---

## Global Constraints

Cada tarea hereda implícitamente estas reglas.

- **Paleta exacta.** `--dh-bosque #1E3527` · `--dh-bosque-deep #16281D` · `--dh-salvia #4A5B4F` · `--dh-lino #F6F2E9` · `--dh-arena #D9CFBB` · `--dh-piedra #61563E` · `--dh-copal #E38B4A` · `--dh-copal-ink #854417`. No inventar tonos intermedios.
- **Regla de contraste.** Sobre fondo claro (`lino` o `arena`), `--dh-copal` **nunca es texto, a ningún tamaño** — da 2.33:1 y 1.69:1, ni siquiera llega al 3:1 de texto grande. Sobre claro solo vale como relleno de botón con texto `--dh-bosque` encima, o como decoración. Todo texto de acento sobre claro usa `--dh-copal-ink`. Sobre fondo oscuro, `--dh-copal` vale en cualquier tamaño.
- **Fondos claros son dos, no uno.** Varias secciones usan `arena`, que es más oscuro que `lino`. Todo color de texto debe cumplir 4.5:1 sobre **ambos**. Es lo que obligó a oscurecer `piedra` y `copal-ink`.
- **Tipografía.** Display: Cormorant Garamond 300/400 + itálica. Interfaz: Jost 300/400/500. Auto-hospedadas con los paquetes **variables** de Fontsource, ya instalados. Las familias CSS se llaman **`'Cormorant Garamond Variable'`** y **`'Jost Variable'`** — con el nombre sin sufijo la fuente no carga y cae al respaldo del sistema sin avisar. Prohibido pedir fuentes a Google en runtime.
- **Movimiento.** Toda animación se desactiva bajo `prefers-reduced-motion: reduce`, incluido el marquee.
- **Alt obligatorio.** Toda imagen de contenido lleva `alt` no vacío, forzado por esquema Zod. El build debe fallar si falta.
- **Idiomas.** Español en la raíz (`/`), inglés en `/en`. Los segmentos de ruta son idénticos en ambos idiomas (`/en/experiencias`, no `/en/experiences`).
- **Contenido con permiso.** Testimonios y logos de marcas solo se renderizan con `permiso: true`. Por defecto `false`.
- **Sin despliegue.** Nunca ejecutar herramientas de despliegue de Vercel ni de ningún host. Todo es local.
- **Sin persistencia de correos** hasta que el cliente elija proveedor. El adaptador por defecto registra en consola.
- **Presupuesto.** < 150 KB de JS y < 100 KB de CSS comprimidos.
- **Idioma del código.** Nombres de archivos, componentes y variables de dominio en español (`Experiencias`, `marcas`, `esProxima`). Los términos de la herramienta quedan en inglés.
- **Commits** en español, imperativo, sin prefijos tipo `feat:`.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `astro.config.mjs` | Integraciones, i18n, Tailwind vía Vite |
| `src/styles/tokens.css` | `@theme` de Tailwind 4. Única fuente de tokens CSS |
| `src/styles/global.css` | Reset, tipografía base, `prefers-reduced-motion` |
| `src/lib/color.ts` | `contrastRatio`, `cumpleAA`. Sin dependencias |
| `src/lib/palette.ts` | Paleta como datos. Fuente de verdad de los tests de contraste |
| `src/lib/i18n.ts` | `Lang`, detección de idioma, localización de rutas, alternates |
| `src/lib/copy.ts` | Carga y tipa `sitio/{es,en}.json` |
| `src/lib/countdown.ts` | `countdownParts`. Puro, sin DOM |
| `src/lib/subscribe.ts` | `isValidEmail`, `subscribe`. Adaptador intercambiable |
| `src/lib/contenido.ts` | Consultas a colecciones: experiencias por idioma, testimonios publicables, marcas publicables |
| `src/content.config.ts` | Esquemas Zod de `experiencias`, `marcas`, `testimonios` |
| `src/components/ui/*` | Primitivas sin lógica de dominio |
| `src/components/layout/*` | Header, Footer, SkipLink, LanguageSwitcher |
| `src/components/sections/*` | Trece secciones de la home, una por archivo |
| `src/layouts/Base.astro` | `<head>`, hreflang, skip link, header, footer |
| `src/pages/**` | Rutas en español; `src/pages/en/**` en inglés |
| `scripts/generar-placeholders.mjs` | Genera los JPG marcadores listados en el manifiesto |
| `public/img/MANIFEST.md` | Inventario de imágenes que debe entregar el cliente |

Regla de decomposición: una sección de la home es un componente que no conoce a los demás y recibe todo por props. Ninguna sección importa de `src/content/` directamente; los datos entran desde `index.astro`.

---

### Task 1: Andamiaje, paleta y verificación de contraste

Arranca el proyecto y cierra de entrada el riesgo de accesibilidad más probable: que el naranja acento se use donde no contrasta.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`
- Create: `src/lib/color.ts`, `src/lib/palette.ts`
- Create: `src/styles/tokens.css`, `src/styles/global.css`
- Create: `src/layouts/Base.astro`, `src/pages/index.astro`
- Test: `tests/unit/color.test.ts`, `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `contrastRatio(hexA: string, hexB: string): number`
  - `cumpleAA(hexTexto: string, hexFondo: string, textoGrande?: boolean): boolean`
  - `PALETA: Record<NombreToken, string>` donde `NombreToken = 'bosque' | 'bosqueDeep' | 'salvia' | 'lino' | 'arena' | 'piedra' | 'copal' | 'copalInk'`

- [ ] **Step 1: Crear el proyecto e instalar dependencias**

```bash
cd "C:/Users/jovag/OneDrive/Escritorio/PROYECTOS/dharma_festcr"
npm init -y
npm install astro
npm install -D typescript @astrojs/check vitest @tailwindcss/vite tailwindcss sharp
npm install @fontsource-variable/jost @fontsource/cormorant-garamond
```

Nota sobre fuentes: `@fontsource-variable/jost` existe. Para Cormorant Garamond se usa el paquete estático con los pesos 300 y 400 más itálica, que es lo único que necesita el diseño. Si `npm install @fontsource-variable/cormorant-garamond` resuelve, se puede usar la variable en su lugar; verificarlo con `npm view @fontsource-variable/cormorant-garamond version` antes de decidir.

- [ ] **Step 2: Escribir el test de contraste que falla**

Crear `tests/unit/color.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio, cumpleAA } from '../../src/lib/color';
import { PALETA } from '../../src/lib/palette';

describe('contrastRatio', () => {
  it('da 21 entre blanco y negro', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });

  it('da 1 entre un color y sí mismo', () => {
    expect(contrastRatio('#1E3527', '#1E3527')).toBeCloseTo(1, 5);
  });

  it('es simétrico', () => {
    expect(contrastRatio('#E38B4A', '#F6F2E9')).toBeCloseTo(
      contrastRatio('#F6F2E9', '#E38B4A'),
      5,
    );
  });

  it('acepta hex de tres dígitos', () => {
    expect(contrastRatio('#FFF', '#000')).toBeCloseTo(21, 1);
  });
});

describe('texto sobre los dos fondos claros', () => {
  // El sitio tiene DOS fondos claros: lino y el más oscuro arena.
  // Todo color de texto debe cumplir sobre ambos, no solo sobre lino.
  const fondosClaros = [
    ['lino', PALETA.lino],
    ['arena', PALETA.arena],
  ] as const;

  const textosSobreClaro = [
    ['bosque', PALETA.bosque],
    ['salvia', PALETA.salvia],
    ['piedra', PALETA.piedra],
    ['copalInk', PALETA.copalInk],
  ] as const;

  for (const [nombreFondo, fondo] of fondosClaros) {
    for (const [nombreTexto, texto] of textosSobreClaro) {
      it(`${nombreTexto} sobre ${nombreFondo} cumple AA`, () => {
        expect(cumpleAA(texto, fondo)).toBe(true);
      });
    }
  }
});

describe('texto sobre los fondos oscuros', () => {
  it.each([
    ['lino', PALETA.lino, 'bosque', PALETA.bosque],
    ['arena', PALETA.arena, 'bosque', PALETA.bosque],
    ['copal', PALETA.copal, 'bosque', PALETA.bosque],
    ['lino', PALETA.lino, 'bosqueDeep', PALETA.bosqueDeep],
    ['arena', PALETA.arena, 'bosqueDeep', PALETA.bosqueDeep],
    ['copal', PALETA.copal, 'bosqueDeep', PALETA.bosqueDeep],
  ])('%s sobre %s cumple AA', (_t, texto, _f, fondo) => {
    expect(cumpleAA(texto, fondo)).toBe(true);
  });
});

describe('botones', () => {
  it('bosque sobre relleno copal cumple AA', () => {
    expect(cumpleAA(PALETA.bosque, PALETA.copal)).toBe(true);
  });

  it('lino sobre relleno copalInk cumple AA', () => {
    expect(cumpleAA(PALETA.lino, PALETA.copalInk)).toBe(true);
  });
});

describe('la regla que motiva copalInk', () => {
  // copal es inservible como TEXTO sobre claro. No es que falle solo en
  // tamaño pequeño: no llega ni al 3:1 que pide el texto grande.
  it.each([
    ['lino', PALETA.lino],
    ['arena', PALETA.arena],
  ])('copal sobre %s no cumple AA ni en texto pequeño', (_n, fondo) => {
    expect(cumpleAA(PALETA.copal, fondo)).toBe(false);
  });

  it.each([
    ['lino', PALETA.lino],
    ['arena', PALETA.arena],
  ])('copal sobre %s tampoco cumple AA en texto grande', (_n, fondo) => {
    expect(cumpleAA(PALETA.copal, fondo, true)).toBe(false);
  });
});
```

Ese último bloque es el corazón del test: documenta ejecutablemente por qué existe `copalInk`. Si alguien luego "simplifica" la paleta borrando `copalInk`, el test explica el daño.

- [ ] **Step 3: Correr el test y verificar que falla**

Crear `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
```

Agregar a `package.json` en `scripts`: `"test": "vitest run"`.

Run: `npm run test`
Expected: FAIL — `Failed to resolve import "../../src/lib/color"`.

- [ ] **Step 4: Implementar color y paleta**

Crear `src/lib/palette.ts`:

```ts
export type NombreToken =
  | 'bosque'
  | 'bosqueDeep'
  | 'salvia'
  | 'lino'
  | 'arena'
  | 'piedra'
  | 'copal'
  | 'copalInk';

/** Fuente de verdad de la paleta. `src/styles/tokens.css` debe reflejarla. */
export const PALETA: Record<NombreToken, string> = {
  bosque: '#1E3527',
  bosqueDeep: '#16281D',
  salvia: '#4A5B4F',
  lino: '#F6F2E9',
  arena: '#D9CFBB',
  piedra: '#61563E',
  copal: '#E38B4A',
  copalInk: '#854417',
};

/** Nombre del token tal como aparece en tokens.css, p. ej. `--color-bosque-deep`. */
export const TOKEN_CSS: Record<NombreToken, string> = {
  bosque: '--color-bosque',
  bosqueDeep: '--color-bosque-deep',
  salvia: '--color-salvia',
  lino: '--color-lino',
  arena: '--color-arena',
  piedra: '--color-piedra',
  copal: '--color-copal',
  copalInk: '--color-copal-ink',
};
```

Crear `src/lib/color.ts`:

```ts
/** Convierte `#RGB` o `#RRGGBB` a sus tres canales 0-255. */
function canales(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '').trim();
  const expandido =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;

  if (!/^[0-9a-fA-F]{6}$/.test(expandido)) {
    throw new Error(`Hex inválido: ${hex}`);
  }

  return [
    parseInt(expandido.slice(0, 2), 16),
    parseInt(expandido.slice(2, 4), 16),
    parseInt(expandido.slice(4, 6), 16),
  ];
}

/** Luminancia relativa según WCAG 2.1. */
function luminancia(hex: string): number {
  const [r, g, b] = canales(hex).map((canal) => {
    const s = canal / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste WCAG entre dos colores. Va de 1 a 21. */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = luminancia(hexA);
  const b = luminancia(hexB);
  const claro = Math.max(a, b);
  const oscuro = Math.min(a, b);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * ¿El par cumple WCAG AA?
 * Texto normal necesita 4.5:1. Texto grande (≥24 px, o ≥18.66 px en negrita) necesita 3:1.
 */
export function cumpleAA(hexTexto: string, hexFondo: string, textoGrande = false): boolean {
  const minimo = textoGrande ? 3 : 4.5;
  return contrastRatio(hexTexto, hexFondo) >= minimo;
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm run test`
Expected: PASS — 24 tests.

Si alguno de los tests de `la regla que motiva copalInk` falla porque el par sí alcanza el mínimo, no ajustar el test: significa que la paleta cambió y hay que rehacer la matriz de contraste completa de la spec §5.

- [ ] **Step 6: Escribir el test de consistencia entre paleta y tokens CSS**

Crear `tests/unit/tokens.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PALETA, TOKEN_CSS, type NombreToken } from '../../src/lib/palette';

const tokensCss = readFileSync(resolve('src/styles/tokens.css'), 'utf8');

describe('tokens.css refleja la paleta', () => {
  const nombres = Object.keys(PALETA) as NombreToken[];

  it.each(nombres)('define %s con el hex de PALETA', (nombre) => {
    const declaracion = `${TOKEN_CSS[nombre]}: ${PALETA[nombre]};`;
    expect(tokensCss).toContain(declaracion);
  });

  it('declara las dos familias tipográficas', () => {
    expect(tokensCss).toContain('--font-display:');
    expect(tokensCss).toContain('--font-ui:');
  });
});
```

- [ ] **Step 7: Correr el test y verificar que falla**

Run: `npm run test`
Expected: FAIL — `ENOENT: no such file or directory, open 'src/styles/tokens.css'`.

- [ ] **Step 8: Escribir tokens.css y global.css**

Crear `src/styles/tokens.css`. Los hex deben coincidir carácter por carácter con `PALETA`, incluidas las mayúsculas:

```css
@import 'tailwindcss';

@theme {
  --color-bosque: #1E3527;
  --color-bosque-deep: #16281D;
  --color-salvia: #4A5B4F;
  --color-lino: #F6F2E9;
  --color-arena: #D9CFBB;
  --color-piedra: #61563E;
  --color-copal: #E38B4A;
  --color-copal-ink: #854417;

  --font-display: 'Cormorant Garamond Variable', Georgia, serif;
  --font-ui: 'Jost Variable', system-ui, sans-serif;

  --text-hero: clamp(2.75rem, 7vw, 6rem);
  --text-seccion: clamp(2rem, 4.5vw, 3.5rem);
  --text-subtitulo: 1.5rem;
  --text-kicker: 0.6875rem;

  --spacing-seccion: clamp(5rem, 12vh, 10rem);
  --ease-dharma: cubic-bezier(0.22, 1, 0.36, 1);
}
```

Crear `src/styles/global.css`:

```css
@import './tokens.css';

@font-face { font-display: swap; }

:root {
  color-scheme: light;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-lino);
  color: var(--color-bosque);
  font-family: var(--font-ui);
  font-weight: 300;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 300;
  line-height: 1.08;
  margin: 0;
}

p { max-width: 60ch; }

:focus-visible {
  outline: 2px solid var(--color-copal);
  outline-offset: 3px;
}

/* Restricción global: nada se mueve si la persona pidió menos movimiento. */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }

  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 9: Correr el test y verificar que pasa**

Run: `npm run test`
Expected: PASS — 33 tests (24 de color + 9 de tokens).

- [ ] **Step 10: Configurar Astro y crear la página mínima**

Crear `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dharmafest.cr',
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
});
```

Nota: `site` es un valor provisional. El cliente todavía no confirmó dominio (spec §13, pregunta 7). Se usa solo para generar URLs canónicas y sitemap; corregirlo cuando haya dominio real.

Crear `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

Crear `src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/jost';

interface Props {
  titulo: string;
  descripcion: string;
}

const { titulo, descripcion } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo}</title>
    <meta name="description" content={descripcion} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

Crear `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---

<Base titulo="Dharma Fest Costa Rica" descripcion="Experiencias de bienestar en Costa Rica.">
  <main>
    <p class="font-display text-hero text-bosque">El bienestar no tiene una sola forma</p>
  </main>
</Base>
```

Agregar a `package.json` en `scripts`: `"dev": "astro dev"`, `"build": "astro build"`, `"check": "astro check"`.

- [ ] **Step 11: Verificar que el sitio levanta y compila**

Run: `npm run build`
Expected: build exitoso, sin advertencias, con `dist/index.html` generado.

Run: `npm run dev` y abrir `http://localhost:4321`
Expected: el titular se ve en Cormorant Garamond, verde bosque sobre lino, a tamaño grande. Si se ve en una serif del sistema, la fuente no cargó: revisar los imports de `@fontsource`.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts src tests
git commit -m "Levanta el proyecto Astro con la paleta y la regla de contraste

La paleta vive en src/lib/palette.ts como fuente de verdad y tokens.css la
refleja; un test falla si se desincronizan.

Los tests de contraste documentan por que existe copal-ink: el naranja acento
no alcanza AA sobre lino en texto pequeno.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Internacionalización

Resuelve el ruteo bilingüe antes de que existan páginas, para que ninguna se escriba con rutas cableadas.

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/components/layout/LanguageSwitcher.astro`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Consumes: nada de tareas previas.
- Produces:
  - `LANGS: readonly ['es', 'en']`
  - `type Lang = 'es' | 'en'`
  - `DEFAULT_LANG: Lang`
  - `langFromUrl(url: URL): Lang`
  - `stripLangPrefix(pathname: string): string`
  - `localizePath(pathCanonico: string, lang: Lang): string`
  - `alternates(pathCanonico: string): { lang: Lang; href: string }[]`

Vocabulario: **ruta canónica** es la ruta sin prefijo de idioma, siempre con barra inicial (`/experiencias`, `/`). Todo el código interno pasa rutas canónicas; `localizePath` es el único lugar que agrega `/en`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/unit/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LANG,
  LANGS,
  alternates,
  langFromUrl,
  localizePath,
  stripLangPrefix,
} from '../../src/lib/i18n';

describe('constantes', () => {
  it('el idioma por defecto es español', () => {
    expect(DEFAULT_LANG).toBe('es');
  });

  it('soporta exactamente dos idiomas', () => {
    expect(LANGS).toEqual(['es', 'en']);
  });
});

describe('langFromUrl', () => {
  it('detecta inglés por el prefijo', () => {
    expect(langFromUrl(new URL('https://d.cr/en/marcas'))).toBe('en');
  });

  it('detecta inglés en la home inglesa', () => {
    expect(langFromUrl(new URL('https://d.cr/en'))).toBe('en');
    expect(langFromUrl(new URL('https://d.cr/en/'))).toBe('en');
  });

  it('cae a español sin prefijo', () => {
    expect(langFromUrl(new URL('https://d.cr/experiencias'))).toBe('es');
    expect(langFromUrl(new URL('https://d.cr/'))).toBe('es');
  });

  it('no confunde una ruta que empieza con las letras en', () => {
    expect(langFromUrl(new URL('https://d.cr/encuentros'))).toBe('es');
  });
});

describe('stripLangPrefix', () => {
  it('quita el prefijo inglés', () => {
    expect(stripLangPrefix('/en/experiencias')).toBe('/experiencias');
  });

  it('deja la ruta española intacta', () => {
    expect(stripLangPrefix('/experiencias')).toBe('/experiencias');
  });

  it('normaliza la home inglesa a la raíz', () => {
    expect(stripLangPrefix('/en')).toBe('/');
    expect(stripLangPrefix('/en/')).toBe('/');
  });

  it('no toca una ruta que empieza con las letras en', () => {
    expect(stripLangPrefix('/encuentros')).toBe('/encuentros');
  });
});

describe('localizePath', () => {
  it('deja el español en la raíz', () => {
    expect(localizePath('/experiencias', 'es')).toBe('/experiencias');
    expect(localizePath('/', 'es')).toBe('/');
  });

  it('prefija el inglés', () => {
    expect(localizePath('/experiencias', 'en')).toBe('/en/experiencias');
  });

  it('la home inglesa lleva barra final', () => {
    expect(localizePath('/', 'en')).toBe('/en/');
  });

  it('es idempotente si le pasan una ruta ya localizada', () => {
    expect(localizePath('/en/marcas', 'en')).toBe('/en/marcas');
    expect(localizePath('/en/marcas', 'es')).toBe('/marcas');
  });
});

describe('alternates', () => {
  it('devuelve una entrada por idioma', () => {
    expect(alternates('/marcas')).toEqual([
      { lang: 'es', href: '/marcas' },
      { lang: 'en', href: '/en/marcas' },
    ]);
  });

  it('funciona en la raíz', () => {
    expect(alternates('/')).toEqual([
      { lang: 'es', href: '/' },
      { lang: 'en', href: '/en/' },
    ]);
  });
});
```

El test del prefijo falso (`/encuentros`) es el que importa: la implementación ingenua con `startsWith('/en')` lo rompe.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test -- i18n`
Expected: FAIL — `Failed to resolve import "../../src/lib/i18n"`.

- [ ] **Step 3: Implementar i18n**

Crear `src/lib/i18n.ts`:

```ts
export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'es';

/** Idiomas que llevan prefijo en la URL. El idioma por defecto vive en la raíz. */
const PREFIJADOS = LANGS.filter((l) => l !== DEFAULT_LANG);

function prefijoDe(pathname: string): Lang | null {
  for (const lang of PREFIJADOS) {
    // El segmento debe estar completo: /en y /en/... sí, /encuentros no.
    if (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)) {
      return lang;
    }
  }
  return null;
}

export function langFromUrl(url: URL): Lang {
  return prefijoDe(url.pathname) ?? DEFAULT_LANG;
}

/** Devuelve la ruta canónica: sin prefijo de idioma, siempre con barra inicial. */
export function stripLangPrefix(pathname: string): string {
  const lang = prefijoDe(pathname);
  if (!lang) return pathname;

  const resto = pathname.slice(`/${lang}`.length);
  return resto === '' || resto === '/' ? '/' : resto;
}

/** Convierte una ruta (canónica o ya localizada) a su forma en `lang`. */
export function localizePath(path: string, lang: Lang): string {
  const canonica = stripLangPrefix(path);

  if (lang === DEFAULT_LANG) return canonica;
  return canonica === '/' ? `/${lang}/` : `/${lang}${canonica}`;
}

/** Las dos versiones de una misma página, para hreflang y el conmutador. */
export function alternates(path: string): { lang: Lang; href: string }[] {
  const canonica = stripLangPrefix(path);
  return LANGS.map((lang) => ({ lang, href: localizePath(canonica, lang) }));
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm run test`
Expected: PASS — todos en verde. Los conteos exactos crecen tarea a tarea; no los tomes como cifra a alcanzar.

- [ ] **Step 5: Crear el conmutador de idioma**

Crear `src/components/layout/LanguageSwitcher.astro`:

```astro
---
import { alternates, langFromUrl, type Lang } from '../../lib/i18n';

const actual: Lang = langFromUrl(Astro.url);
const opciones = alternates(Astro.url.pathname);

const etiqueta: Record<Lang, string> = { es: 'ES', en: 'EN' };
const nombreCompleto: Record<Lang, string> = { es: 'Español', en: 'English' };
---

<nav class="flex items-center gap-2" aria-label="Idioma">
  {
    opciones.map(({ lang, href }) =>
      lang === actual ? (
        <span
          class="text-kicker uppercase tracking-[0.2em] text-copal"
          aria-current="true"
        >
          <span class="sr-only">{nombreCompleto[lang]}, idioma actual</span>
          <span aria-hidden="true">{etiqueta[lang]}</span>
        </span>
      ) : (
        <a
          href={href}
          hreflang={lang}
          class="text-kicker uppercase tracking-[0.2em] opacity-70 transition-opacity hover:opacity-100"
        >
          <span class="sr-only">Ver esta página en {nombreCompleto[lang]}</span>
          <span aria-hidden="true">{etiqueta[lang]}</span>
        </a>
      ),
    )
  }
</nav>
```

`alternates` recibe la ruta actual, así que el conmutador **preserva la página**: desde `/marcas` lleva a `/en/marcas`, no a la home. Eso lo verifica un test de humo en la Tarea 5.

- [ ] **Step 6: Verificar que compila**

Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 7: Commit**

```bash
git add src/lib/i18n.ts src/components/layout/LanguageSwitcher.astro tests/unit/i18n.test.ts
git commit -m "Agrega el nucleo de internacionalizacion

Las rutas canonicas no llevan prefijo; localizePath es el unico lugar que
agrega /en. El conmutador preserva la pagina actual en vez de mandar a la home.

Un test cubre el caso /encuentros, que una comparacion ingenua con startsWith
clasificaria como ingles.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Contenido, esquemas y placeholders

Deja el contenido editable fuera de los componentes y genera las imágenes marcadoras, para que las tareas de secciones no se bloqueen esperando material del cliente.

**Files:**
- Create: `src/content.config.ts`, `src/lib/copy.ts`, `src/lib/contenido.ts`
- Create: `src/content/sitio/es.json`, `src/content/sitio/en.json`
- Create: `src/content/marcas/marcas.json`, `src/content/testimonios/testimonios.json`
- Create: `src/content/experiencias/es/*.md`, `src/content/experiencias/en/*.md`
- Create: `scripts/generar-placeholders.mjs`, `public/img/MANIFEST.md`
- Test: `tests/unit/copy.test.ts`, `tests/unit/contenido.test.ts`

**Interfaces:**
- Consumes: `Lang` de `src/lib/i18n.ts`.
- Produces:
  - `getCopy(lang: Lang): Copy` y `type Copy = typeof es` (claves listadas en el Step 3)
  - `experienciasDe<T>(todas: T[], lang: Lang): T[]` — ordenadas por fecha descendente
  - `proximaExperiencia<T>(todas: T[], lang: Lang): T | null`
  - `publicables<T extends { permiso: boolean }>(items: T[]): T[]`
  - `interface ExperienciaLike { slug: string; lang: Lang; fecha: Date; estado: 'proxima' | 'pasada' }`

- [ ] **Step 1: Escribir el test de paridad de textos que falla**

Crear `tests/unit/copy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getCopy } from '../../src/lib/copy';

/** Recorre un objeto anidado y devuelve todas las rutas de sus hojas. */
function rutasDeHoja(valor: unknown, prefijo = ''): string[] {
  if (Array.isArray(valor)) {
    return valor.flatMap((item, i) => rutasDeHoja(item, `${prefijo}[${i}]`));
  }
  if (valor !== null && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([clave, v]) =>
      rutasDeHoja(v, prefijo ? `${prefijo}.${clave}` : clave),
    );
  }
  return [prefijo];
}

function hojas(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.flatMap(hojas);
  if (valor !== null && typeof valor === 'object') return Object.values(valor).flatMap(hojas);
  return [String(valor)];
}

describe('paridad entre idiomas', () => {
  it('español e inglés tienen exactamente las mismas claves', () => {
    expect(rutasDeHoja(getCopy('en')).sort()).toEqual(rutasDeHoja(getCopy('es')).sort());
  });

  it('ningún texto quedó vacío', () => {
    for (const lang of ['es', 'en'] as const) {
      expect(hojas(getCopy(lang)).filter((t) => t.trim() === '')).toEqual([]);
    }
  });

  it('los siete ejes están completos en ambos idiomas', () => {
    expect(getCopy('es').ejes).toHaveLength(7);
    expect(getCopy('en').ejes).toHaveLength(7);
  });
});
```

Este test es la red que evita el bug clásico de i18n: agregar una sección en español y olvidar el inglés.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test -- copy`
Expected: FAIL — `Failed to resolve import "../../src/lib/copy"`.

- [ ] **Step 3: Escribir los textos en español**

Crear `src/content/sitio/es.json`. Todo el copy sale del Instagram del cliente, no está inventado:

```json
{
  "meta": {
    "titulo": "Dharma Fest · Experiencias de bienestar en Costa Rica",
    "descripcion": "Movimiento, conexión y comunidad. El festival de bienestar de Costa Rica y sus experiencias durante todo el año."
  },
  "nav": {
    "nosotros": "Nosotros",
    "experiencias": "Experiencias",
    "fest": "2027",
    "marcas": "Marcas",
    "cta": "Sumate"
  },
  "hero": {
    "kicker": "Festival de bienestar · Costa Rica",
    "titulo": "El bienestar no tiene",
    "tituloEnfasis": "una sola forma",
    "subtitulo": "Movimiento · Comunidad · Campo Lago",
    "cta": "Sumate a la comunidad"
  },
  "ejes": [
    { "nombre": "Charlas", "descripcion": "Conocimiento que se comparte." },
    { "nombre": "Artistas", "descripcion": "Música en vivo todo el día." },
    { "nombre": "Mercadito", "descripcion": "Marcas locales, hechas acá." },
    { "nombre": "Actividades", "descripcion": "Respiración, movimiento, cuerpo." },
    { "nombre": "Gastronomía", "descripcion": "Comida real, gente real." },
    { "nombre": "Asociaciones", "descripcion": "Causas que nos importan." },
    { "nombre": "Entretenimiento", "descripcion": "Arte, fuego y sorpresa." }
  ],
  "filosofia": {
    "kicker": "Qué significa Dharma",
    "titulo": "Mucho más",
    "tituloEnfasis": "que bienestar",
    "cuerpo": "Es movimiento, conexión, comunidad, conciencia y espacios para volver a nosotros mismos. Es compartir, aprender, apoyar lo local, cuidar nuestro entorno y descubrir nuevas formas de sentirnos bien."
  },
  "ejesSeccion": {
    "kicker": "Qué vas a encontrar",
    "titulo": "Siete formas de",
    "tituloEnfasis": "estar bien"
  },
  "campoLago": {
    "kicker": "Campo Lago",
    "titulo": "Nuestra casa, donde",
    "tituloEnfasis": "sucede la magia",
    "cuerpo": "El lugar al que volvemos edición tras edición. Naturaleza, lago y espacio para que la comunidad se encuentre."
  },
  "experiencias": {
    "kicker": "Todo el año",
    "titulo": "Experiencias",
    "tituloEnfasis": "Dharma",
    "verTodas": "Ver todas",
    "etiquetaProxima": "Próxima",
    "etiquetaPasada": "Edición pasada",
    "vacio": "Estamos preparando la próxima. Sumate a la comunidad para enterarte primero."
  },
  "fest2027": {
    "kicker": "La próxima gran edición",
    "titulo": "Dharma Fest",
    "tituloEnfasis": "2027",
    "cuerpo": "El encuentro grande vuelve. Sé de los primeros en enterarte de fechas, line-up y preventa.",
    "cta": "Quiero enterarme primero",
    "dias": "Días",
    "horas": "Horas",
    "minutos": "Min"
  },
  "numeros2025": {
    "kicker": "Dharma Fest 2025",
    "titulo": "Lo que",
    "tituloEnfasis": "ya pasó",
    "cifras": [
      { "valor": "40+", "etiqueta": "Marcas locales" },
      { "valor": "9", "etiqueta": "Charlas" },
      { "valor": "6", "etiqueta": "Artistas" },
      { "valor": "3", "etiqueta": "Asociaciones" }
    ]
  },
  "marcas": {
    "kicker": "Lo construimos entre todos",
    "titulo": "Las marcas que",
    "tituloEnfasis": "lo hacen posible",
    "cta": "Quiero ser parte"
  },
  "voces": { "kicker": "La comunidad" },
  "nosotros": {
    "kicker": "Detrás de Dharma",
    "cita": "Creemos que el bienestar no tiene una sola forma. Se vive, se comparte y se construye en comunidad.",
    "autor": "Equipo Dharma Fest"
  },
  "sumate": {
    "kicker": "Comenzá tu camino",
    "titulo": "Sumate a la",
    "tituloEnfasis": "comunidad",
    "cuerpo": "Enterate primero de cada experiencia, del Dharma Fest 2027 y de lo que estamos creando.",
    "etiquetaCorreo": "Tu correo electrónico",
    "placeholder": "tu@correo.com",
    "boton": "Sumarme",
    "errorCorreo": "Revisá el correo, parece que tiene un error.",
    "errorGeneral": "Algo falló de nuestro lado. Probá de nuevo en un momento."
  },
  "gracias": {
    "titulo": "Ya sos parte",
    "cuerpo": "Te vamos a escribir cuando haya algo que valga la pena. Nada más.",
    "volver": "Volver al inicio"
  },
  "error404": {
    "titulo": "Esta página no existe",
    "cuerpo": "Puede que la hayamos movido, o que el enlace esté viejo.",
    "volver": "Volver al inicio"
  },
  "footer": {
    "tagline": "Experiencias de bienestar en Costa Rica",
    "sitio": "Sitio",
    "marcas": "Marcas",
    "contacto": "Contacto",
    "aplicar": "Aplicar",
    "prensa": "Prensa",
    "derechos": "Todos los derechos reservados."
  },
  "a11y": {
    "saltarContenido": "Saltar al contenido",
    "menuAbrir": "Abrir menú",
    "menuCerrar": "Cerrar menú",
    "navPrincipal": "Navegación principal",
    "idioma": "Idioma"
  }
}
```

- [ ] **Step 4: Escribir los textos en inglés y el módulo de copy**

Crear `src/content/sitio/en.json` con **exactamente las mismas claves**, traducidas. Traducir el sentido, no las palabras: `hero.titulo` = `"Wellness has"`, `hero.tituloEnfasis` = `"more than one shape"`, `campoLago.tituloEnfasis` = `"the magic happens"`, `nosotros.cita` = `"We believe wellness has more than one shape. You live it, you share it, and you build it together."`

Estos cuatro valores ingleses están **fijados por tests posteriores** y no se pueden traducir libre:

| Clave | Valor exacto | Test que lo afirma |
|---|---|---|
| `hero.tituloEnfasis` | `more than one shape` | Task 6, `home-superior.spec.ts` |
| `sumate.etiquetaCorreo` | `Your email address` | Task 8, `sumate.spec.ts` |
| `sumate.boton` | `Join` | Task 8, `sumate.spec.ts` |
| `a11y.saltarContenido` | `Skip to content` | Ningún test lo afirma; se fija acá para que ambos idiomas usen el mismo término |

Si se cambia alguno, actualizar el test en la misma tarea.

Crear `src/lib/copy.ts`:

```ts
import type { Lang } from './i18n';
import es from '../content/sitio/es.json';
import en from '../content/sitio/en.json';

/** El español es la referencia estructural; el inglés debe calzar. */
export type Copy = typeof es;

const COPY: Record<Lang, Copy> = { es, en: en as Copy };

export function getCopy(lang: Lang): Copy {
  return COPY[lang];
}
```

Tipar `en` contra `typeof es` hace que TypeScript marque una clave faltante en tiempo de compilación, además del test en tiempo de ejecución. Dos redes para el mismo error.

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `npm run test -- copy`
Expected: PASS — 3 tests. Si falla por claves desparejas, la salida nombra la ruta exacta. Arreglar el JSON, no el test.

- [ ] **Step 6: Definir los esquemas de contenido**

Crear `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const experiencias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiencias' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      lang: z.enum(['es', 'en']),
      fecha: z.date(),
      estado: z.enum(['proxima', 'pasada']),
      lugar: z.string().default('Campo Lago'),
      resumen: z.string().max(200),
      portada: image(),
      // Sin alt no hay build. Restricción global, aplicada por esquema.
      portadaAlt: z.string().min(1, 'Toda portada necesita texto alternativo'),
      galeria: z.array(z.object({ src: image(), alt: z.string().min(1) })).default([]),
      aliados: z.array(z.string()).default([]),
      ctaUrl: z.string().url().optional(),
      destacada: z.boolean().default(false),
    }),
});

const marcas = defineCollection({
  loader: file('./src/content/marcas/marcas.json'),
  schema: z.object({
    nombre: z.string(),
    instagram: z.string(),
    url: z.string().url().optional(),
    logo: z.string().optional(),
    categoria: z.enum([
      'charlas', 'artistas', 'mercadito', 'actividades',
      'gastronomia', 'asociaciones', 'entretenimiento',
    ]),
    ediciones: z.array(z.number().int()),
    // Restricción global: nada de terceros se publica sin permiso explícito.
    permiso: z.boolean().default(false),
  }),
});

const testimonios = defineCollection({
  loader: file('./src/content/testimonios/testimonios.json'),
  schema: z.object({
    cita: z.string(),
    autor: z.string(),
    handle: z.string(),
    lang: z.enum(['es', 'en']),
    permiso: z.boolean().default(false),
  }),
});

export const collections = { experiencias, marcas, testimonios };
```

- [ ] **Step 7: Escribir el test de consultas de contenido que falla**

Crear `tests/unit/contenido.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { experienciasDe, proximaExperiencia, publicables } from '../../src/lib/contenido';

const muestras = [
  { slug: 'es/uno', lang: 'es' as const, fecha: new Date('2026-03-01'), estado: 'pasada' as const },
  { slug: 'es/dos', lang: 'es' as const, fecha: new Date('2026-08-01'), estado: 'pasada' as const },
  { slug: 'es/tres', lang: 'es' as const, fecha: new Date('2026-12-01'), estado: 'proxima' as const },
  { slug: 'en/one', lang: 'en' as const, fecha: new Date('2026-08-01'), estado: 'pasada' as const },
];

describe('experienciasDe', () => {
  it('filtra por idioma', () => {
    expect(experienciasDe(muestras, 'en').map((e) => e.slug)).toEqual(['en/one']);
  });

  it('ordena de más reciente a más antigua', () => {
    expect(experienciasDe(muestras, 'es').map((e) => e.slug)).toEqual([
      'es/tres', 'es/dos', 'es/uno',
    ]);
  });

  it('devuelve lista vacía para un idioma sin contenido', () => {
    expect(experienciasDe([], 'es')).toEqual([]);
  });
});

describe('proximaExperiencia', () => {
  it('devuelve la próxima del idioma pedido', () => {
    expect(proximaExperiencia(muestras, 'es')?.slug).toBe('es/tres');
  });

  it('devuelve null si no hay ninguna próxima', () => {
    expect(proximaExperiencia(muestras, 'en')).toBeNull();
  });
});

describe('publicables', () => {
  it('deja fuera lo que no tiene permiso', () => {
    const items = [{ id: 'a', permiso: true }, { id: 'b', permiso: false }];
    expect(publicables(items).map((i) => i.id)).toEqual(['a']);
  });

  it('devuelve lista vacía si nada tiene permiso', () => {
    expect(publicables([{ id: 'a', permiso: false }])).toEqual([]);
  });
});
```

- [ ] **Step 8: Correr el test y verificar que falla**

Run: `npm run test -- contenido`
Expected: FAIL — `Failed to resolve import "../../src/lib/contenido"`.

- [ ] **Step 9: Implementar las consultas de contenido**

Crear `src/lib/contenido.ts`:

```ts
import type { Lang } from './i18n';

/** Forma mínima que necesitan estas consultas. Evita acoplarlas a astro:content. */
export interface ExperienciaLike {
  slug: string;
  lang: Lang;
  fecha: Date;
  estado: 'proxima' | 'pasada';
}

/** Experiencias de un idioma, de la más reciente a la más antigua. */
export function experienciasDe<T extends ExperienciaLike>(todas: T[], lang: Lang): T[] {
  return todas
    .filter((e) => e.lang === lang)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
}

/**
 * La próxima experiencia del idioma, o null si no hay ninguna anunciada.
 * Si hay varias marcadas como próximas, devuelve la MÁS CERCANA en el tiempo:
 * `experienciasDe` ordena de más reciente a más antigua, así que hay que tomar
 * la última de las próximas, no la primera.
 */
export function proximaExperiencia<T extends ExperienciaLike>(todas: T[], lang: Lang): T | null {
  const proximas = experienciasDe(todas, lang).filter((e) => e.estado === 'proxima');
  return proximas.at(-1) ?? null;
}

/**
 * Filtra contenido de terceros sin permiso explícito.
 * Testimonios y logos de marcas pasan siempre por acá.
 */
export function publicables<T extends { permiso: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.permiso);
}
```

- [ ] **Step 10: Correr el test y verificar que pasa**

Run: `npm run test`
Expected: PASS — todos en verde. Los conteos exactos crecen tarea a tarea; no los tomes como cifra a alcanzar.

- [ ] **Step 11: Escribir el generador de placeholders y el manifiesto**

Crear `scripts/generar-placeholders.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const LINO = '#F6F2E9';
const BOSQUE = '#1E3527';

/** Cada entrada es una imagen que el cliente debe reemplazar. */
const IMAGENES = [
  { ruta: 'hero.jpg', w: 2400, h: 1350, etiqueta: 'HERO' },
  { ruta: 'filosofia.jpg', w: 1400, h: 1600, etiqueta: 'FILOSOFIA' },
  { ruta: 'campo-lago.jpg', w: 1600, h: 1400, etiqueta: 'CAMPO LAGO' },
  { ruta: 'equipo.jpg', w: 1400, h: 1400, etiqueta: 'EQUIPO' },
  { ruta: 'ejes/charlas.jpg', w: 1200, h: 1200, etiqueta: 'CHARLAS' },
  { ruta: 'ejes/artistas.jpg', w: 900, h: 900, etiqueta: 'ARTISTAS' },
  { ruta: 'ejes/mercadito.jpg', w: 900, h: 900, etiqueta: 'MERCADITO' },
  { ruta: 'ejes/actividades.jpg', w: 900, h: 900, etiqueta: 'ACTIVIDADES' },
  { ruta: 'ejes/gastronomia.jpg', w: 900, h: 900, etiqueta: 'GASTRONOMIA' },
  { ruta: 'ejes/asociaciones.jpg', w: 1200, h: 700, etiqueta: 'ASOCIACIONES' },
  { ruta: 'ejes/entretenimiento.jpg', w: 1200, h: 700, etiqueta: 'ENTRETENIMIENTO' },
  { ruta: 'experiencias/conecta-con-tu-piel.jpg', w: 1200, h: 900, etiqueta: 'EXPERIENCIA 1' },
  { ruta: 'experiencias/sesion-respiracion.jpg', w: 1200, h: 900, etiqueta: 'EXPERIENCIA 2' },
  { ruta: 'experiencias/proxima.jpg', w: 1200, h: 900, etiqueta: 'PROXIMA' },
];

const DESTINO = 'src/assets/img';

function svgEtiqueta(w, h, texto) {
  const tam = Math.round(Math.min(w, h) / 14);
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
       <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
             font-family="Georgia, serif" font-size="${tam}" fill="${LINO}"
             letter-spacing="${Math.round(tam / 5)}">${texto}</text>
       <text x="50%" y="${h / 2 + tam * 1.6}" text-anchor="middle"
             font-family="Georgia, serif" font-size="${Math.round(tam / 2.4)}"
             fill="${LINO}" opacity="0.55">${w} x ${h} · reemplazar</text>
     </svg>`,
  );
}

for (const { ruta, w, h, etiqueta } of IMAGENES) {
  const salida = resolve(DESTINO, ruta);
  await mkdir(dirname(salida), { recursive: true });

  await sharp({ create: { width: w, height: h, channels: 3, background: BOSQUE } })
    .composite([{ input: svgEtiqueta(w, h, etiqueta), top: 0, left: 0 }])
    .jpeg({ quality: 80 })
    .toFile(salida);

  console.log(`generado ${ruta} (${w}x${h})`);
}

const manifiesto = [
  '# Imágenes que debe entregar el cliente',
  '',
  'Cada archivo de esta lista es hoy un marcador generado por `npm run placeholders`.',
  'Reemplazar conservando **la misma ruta y la misma proporción**; el sitio se encarga',
  'del recorte, los formatos AVIF/WebP y los tamaños.',
  '',
  'Formato: JPG o PNG, a la resolución indicada o mayor. Sin texto quemado en la imagen.',
  '',
  '| Ruta en el repo | Tamaño mínimo | Dónde aparece |',
  '| --- | --- | --- |',
  ...IMAGENES.map(({ ruta, w, h, etiqueta }) =>
    `| \`src/assets/img/${ruta}\` | ${w} × ${h} | ${etiqueta} |`),
  '',
  '## Además hace falta',
  '',
  '- Logo de Dharma Fest en **SVG**, versión clara y versión oscura.',
  '- Logos de las marcas aliadas, en SVG o PNG con fondo transparente.',
  '- Galería del recap 2025: entre 8 y 12 fotos horizontales.',
  '- Opcional: video del hero, 10-15 s, sin audio, en MP4 (H.264) y WebM.',
].join('\n');

await mkdir('public/img', { recursive: true });
await writeFile('public/img/MANIFEST.md', manifiesto + '\n', 'utf8');
console.log('escrito public/img/MANIFEST.md');
```

Agregar a `package.json` en `scripts`: `"placeholders": "node scripts/generar-placeholders.mjs"`.

- [ ] **Step 12: Generar los placeholders y sembrar el contenido**

Run: `npm run placeholders`
Expected: 14 líneas `generado ...` más `escrito public/img/MANIFEST.md`. Abrir `src/assets/img/hero.jpg` y confirmar un rectángulo verde bosque con la palabra HERO en color lino.

Crear `src/content/experiencias/es/conecta-con-tu-piel.md`:

```markdown
---
titulo: Conectá con tu piel
lang: es
fecha: 2026-08-28
estado: pasada
lugar: Campo Lago
resumen: Un día para movernos, aprender y regalarnos tiempo. Mucho más que hablar de skincare.
portada: ../../../assets/img/experiencias/conecta-con-tu-piel.jpg
portadaAlt: Grupo de personas en una actividad al aire libre en Campo Lago
destacada: false
---

Fue movernos, aprender, descubrir, compartir y regalarnos un día para nosotras.

Seguimos creando espacios para conectar con nuestro bienestar, con otros y con nosotros mismos.
```

Crear de la misma forma `src/content/experiencias/es/sesion-respiracion.md` (fecha `2026-05-16`, estado `pasada`, portada `sesion-respiracion.jpg`, alt `Sesión de respiración guiada al aire libre`) y `src/content/experiencias/es/proxima-edicion.md` (fecha `2026-11-14`, estado `proxima`, portada `proxima.jpg`, alt `Personas reunidas al atardecer en Campo Lago`, `destacada: true`). Duplicar las tres en `src/content/experiencias/en/` con `lang: en` y el texto traducido.

Crear `src/content/testimonios/testimonios.json`. **Los tres arrancan con `permiso: false`**, así que la sección Voces no se renderiza hasta que el cliente confirme:

```json
[
  { "id": "laparcecr", "cita": "Ya quiero vivirme otra experiencia Dharma.", "autor": "La Parce", "handle": "@laparcecr", "lang": "es", "permiso": false },
  { "id": "jessteinspira", "cita": "Qué lindo todo lo que se vivió y se sintió ese día.", "autor": "Jess", "handle": "@jessteinspira", "lang": "es", "permiso": false },
  { "id": "naturezasaladbar", "cita": "Súper evento. Sin duda volveremos.", "autor": "Natureza Salad Bar", "handle": "@naturezasaladbar", "lang": "es", "permiso": false }
]
```

Crear `src/content/marcas/marcas.json` sembrando los handles del post de agradecimiento del 2025 (spec §1), todos con `"permiso": false`. Las primeras tres, como patrón a repetir:

```json
[
  { "id": "pranayamacostarica", "nombre": "Pranayama Costa Rica", "instagram": "@pranayamacostarica", "categoria": "actividades", "ediciones": [2025], "permiso": false },
  { "id": "jawara", "nombre": "Jawara", "instagram": "@jawara.cr", "categoria": "artistas", "ediciones": [2025], "permiso": false },
  { "id": "naturezasaladbar", "nombre": "Natureza Salad Bar", "instagram": "@naturezasaladbar", "categoria": "gastronomia", "ediciones": [2025], "permiso": false }
]
```

- [ ] **Step 13: Verificar que el esquema muerde**

Run: `npm run build`
Expected: build exitoso, con las tres colecciones cargadas.

Prueba de que la restricción de `alt` funciona: borrar temporalmente la línea `portadaAlt` de `conecta-con-tu-piel.md` y correr `npm run build`.
Expected: FAIL con `portadaAlt: Toda portada necesita texto alternativo`. Restaurar la línea y volver a construir.

- [ ] **Step 14: Commit**

```bash
git add src/content.config.ts src/content src/assets src/lib/copy.ts src/lib/contenido.ts scripts public/img tests package.json
git commit -m "Agrega contenido, esquemas y generador de placeholders

El copy sale del Instagram del cliente y vive en JSON por idioma. Un test
compara las claves de es y en, para que no se agregue una seccion en un solo
idioma.

Testimonios y marcas arrancan con permiso false y publicables() los filtra:
nada de terceros se publica sin autorizacion del cliente.

El esquema exige texto alternativo en toda imagen, asi que el build falla si
falta.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Primitivas de interfaz y animación de entrada

**Files:**
- Create: `src/components/ui/Kicker.astro`, `TituloSeccion.astro`, `Boton.astro`, `Seccion.astro`, `Reveal.astro`
- Create: `src/lib/motion.ts`
- Test: `tests/unit/motion.test.ts`

**Interfaces:**
- Consumes: tokens de `src/styles/tokens.css`.
- Produces:
  - `debeAnimar(reduceMotion: boolean): boolean`
  - `retrasoEscalonado(indice: number): number`
  - `<Kicker tono?: 'claro' | 'oscuro' class?>` — texto en mayúsculas espaciadas
  - `<TituloSeccion texto enfasis? nivel?: 1|2|3 tono?: 'claro'|'oscuro' class?>` — `enfasis` sale en itálica en una segunda línea
  - `<Boton href variante?: 'solido' | 'contorno' class?>`
  - `<Seccion fondo?: 'lino'|'arena'|'bosque'|'bosqueDeep' id? class?>`
  - `<Reveal indice?: number class?>`

`tono` significa el tono del **fondo** sobre el que va el componente: `claro` = sobre lino o arena, `oscuro` = sobre bosque.

- [ ] **Step 1: Escribir el test de movimiento que falla**

Crear `tests/unit/motion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { debeAnimar, retrasoEscalonado } from '../../src/lib/motion';

describe('debeAnimar', () => {
  it('no anima si la persona pidió menos movimiento', () => {
    expect(debeAnimar(true)).toBe(false);
  });

  it('anima en el caso normal', () => {
    expect(debeAnimar(false)).toBe(true);
  });
});

describe('retrasoEscalonado', () => {
  it('el primer elemento no espera', () => {
    expect(retrasoEscalonado(0)).toBe(0);
  });

  it('escalona de 80 en 80 milisegundos', () => {
    expect(retrasoEscalonado(1)).toBe(80);
    expect(retrasoEscalonado(3)).toBe(240);
  });

  it('topa a 400 ms para que una lista larga no se sienta lenta', () => {
    expect(retrasoEscalonado(20)).toBe(400);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test -- motion`
Expected: FAIL — `Failed to resolve import "../../src/lib/motion"`.

- [ ] **Step 3: Implementar el módulo de movimiento**

Crear `src/lib/motion.ts`:

```ts
const PASO_MS = 80;
const TOPE_MS = 400;

/** Restricción global: `prefers-reduced-motion` manda sobre cualquier animación. */
export function debeAnimar(reduceMotion: boolean): boolean {
  return !reduceMotion;
}

/** Retraso de entrada del elemento `indice`, con tope para listas largas. */
export function retrasoEscalonado(indice: number): number {
  return Math.min(indice * PASO_MS, TOPE_MS);
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm run test -- motion`
Expected: PASS — 5 tests.

- [ ] **Step 5: Escribir Kicker, TituloSeccion y Boton**

Crear `src/components/ui/Kicker.astro`:

```astro
---
interface Props {
  tono?: 'claro' | 'oscuro';
  class?: string;
}

const { tono = 'claro', class: clase = '' } = Astro.props;

// Sobre fondo claro el acento no alcanza AA en texto pequeño: se usa piedra.
const color = tono === 'claro' ? 'text-piedra' : 'text-copal';
---

<p class={`font-ui text-kicker uppercase tracking-[0.30em] ${color} ${clase}`}>
  <slot />
</p>
```

Crear `src/components/ui/TituloSeccion.astro`:

```astro
---
interface Props {
  texto: string;
  enfasis?: string;
  nivel?: 1 | 2 | 3;
  tono?: 'claro' | 'oscuro';
  class?: string;
}

const { texto, enfasis, nivel = 2, tono = 'claro', class: clase = '' } = Astro.props;

const Etiqueta = `h${nivel}` as 'h1' | 'h2' | 'h3';
const tamano = nivel === 1 ? 'text-hero' : 'text-seccion';
const color = tono === 'claro' ? 'text-bosque' : 'text-lino';
---

<Etiqueta class={`font-display ${tamano} ${color} ${clase}`}>
  {texto}
  {enfasis && <><br /><em class="italic">{enfasis}</em></>}
</Etiqueta>
```

Crear `src/components/ui/Boton.astro`:

```astro
---
interface Props {
  href: string;
  variante?: 'solido' | 'contorno';
  class?: string;
}

const { href, variante = 'solido', class: clase = '' } = Astro.props;

// Sólido: relleno copal con texto bosque, que sí cumple AA en cualquier tamaño.
// Contorno: pensado para fondos oscuros, con texto lino.
const estilo =
  variante === 'solido'
    ? 'bg-copal text-bosque hover:bg-copal-ink hover:text-lino'
    : 'border border-copal text-lino hover:bg-copal hover:text-bosque';
---

<a
  href={href}
  class={`inline-block font-ui text-kicker uppercase tracking-[0.24em] px-7 py-3 transition-colors ${estilo} ${clase}`}
>
  <slot />
</a>
```

- [ ] **Step 6: Escribir Seccion y Reveal**

Crear `src/components/ui/Seccion.astro`:

```astro
---
interface Props {
  fondo?: 'lino' | 'arena' | 'bosque' | 'bosqueDeep';
  id?: string;
  class?: string;
}

const { fondo = 'lino', id, class: clase = '' } = Astro.props;

const fondos = {
  lino: 'bg-lino',
  arena: 'bg-arena',
  bosque: 'bg-bosque',
  bosqueDeep: 'bg-bosque-deep',
} as const;
---

<section id={id} class={`${fondos[fondo]} py-[var(--spacing-seccion)] ${clase}`}>
  <div class="mx-auto w-full max-w-[1280px] px-6 md:px-10">
    <slot />
  </div>
</section>
```

Crear `src/components/ui/Reveal.astro`:

```astro
---
import { retrasoEscalonado } from '../../lib/motion';

interface Props {
  indice?: number;
  class?: string;
}

const { indice = 0, class: clase = '' } = Astro.props;
const retraso = retrasoEscalonado(indice);
---

<div class={`dh-reveal ${clase}`} style={`--dh-retraso: ${retraso}ms`}>
  <slot />
</div>

<style>
  .dh-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 600ms var(--ease-dharma) var(--dh-retraso),
      transform 600ms var(--ease-dharma) var(--dh-retraso);
  }

  .dh-reveal.dh-visible {
    opacity: 1;
    transform: none;
  }

  /* Restricción global: sin movimiento, el contenido nace visible. */
  @media (prefers-reduced-motion: reduce) {
    .dh-reveal {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>

<noscript>
  <style is:inline>
    /* Regla sin scope para vencer la regla base scoped por Astro (especificidad 0-2-0).
       Sin !important, la base rule gana y el contenido queda invisible. */
    .dh-reveal { opacity: 1 !important; transform: none !important; }
  </style>
</noscript>

<script>
  import { debeAnimar } from '../../lib/motion';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const objetivos = document.querySelectorAll<HTMLElement>('.dh-reveal');

  if (!debeAnimar(reduce)) {
    objetivos.forEach((el) => el.classList.add('dh-visible'));
  } else {
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('dh-visible');
            observador.unobserve(entrada.target);
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    objetivos.forEach((el) => observador.observe(el));
  }
</script>
```

El `<style>` deja el contenido invisible antes de que corra el script, así que un fallo del JS lo escondería. El `<noscript>` cubre el caso de JavaScript deshabilitado y la media query cubre el de movimiento reducido. Nunca envolver el `<h1>` del hero en `Reveal`: debe pintarse de inmediato para no castigar el LCP.

**Por qué el `<noscript>` lleva `is:inline` y `!important`** (verificado contra la salida real del build): Astro **no** sube ese bloque al CSS — lo deja en el HTML. Pero mientras la regla base sale con scope (`.dh-reveal[data-astro-cid-…]`, especificidad 0-2-0), la del `noscript` sale sin scope (`.dh-reveal`, 0-1-0). La base gana, y sin `!important` el seguro no sirve de nada: quien navegue sin JavaScript no ve el contenido, nunca. No quitar ninguna de las dos cosas.

**Cómo comprobarlo si alguien lo toca:** `grep -o '<noscript>.*</noscript>'` **no** cruza saltos de línea y hace creer que el bloque desapareció. Usar una búsqueda multilínea:

```bash
node -e "const h=require('fs').readFileSync('dist/index.html','utf8'); const i=h.indexOf('noscript'); console.log(i>=0 ? JSON.stringify(h.slice(i-40, i+220)) : 'AUSENTE')"
```

- [ ] **Step 7: Verificar que compila**

Run: `npm run build`
Expected: build exitoso.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui src/lib/motion.ts tests/unit/motion.test.ts
git commit -m "Agrega las primitivas de interfaz y la animacion de entrada

Kicker y Boton codifican la regla de contraste: sobre fondo claro el acento
nunca se usa en texto pequeno.

La entrada por scroll se apaga sola bajo prefers-reduced-motion y con noscript,
para que un fallo de JS no deje el contenido invisible.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Cabecera, pie, layout base y arnés de pruebas end-to-end

Cierra el esqueleto de toda página y monta Playwright, para que las tareas de secciones ya tengan dónde verificarse en un navegador real.

**Files:**
- Create: `src/components/layout/Header.astro`, `Footer.astro`, `SkipLink.astro`
- Modify: `src/layouts/Base.astro` (reemplazo completo)
- Modify: `src/pages/index.astro`, y crear `src/pages/en/index.astro`
- Create: `playwright.config.ts`, `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: `getCopy` (Task 3), `langFromUrl`/`localizePath`/`alternates` (Task 2), `LanguageSwitcher` (Task 2), `Seccion`/`Boton` (Task 4).
- Produces:
  - `<Base titulo descripcion lang rutaCanonica>` — layout de toda página. `rutaCanonica` es la ruta sin prefijo de idioma, usada para hreflang y para el conmutador.
  - `<Header lang>`, `<Footer lang>`, `<SkipLink lang>`

- [ ] **Step 1: Instalar Playwright y configurarlo**

```bash
npm install -D @playwright/test @axe-core/playwright
npx playwright install chromium
```

Crear `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321', trace: 'on-first-retry' },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

Agregar a `package.json` en `scripts`: `"test:e2e": "playwright test"`.

- [ ] **Step 2: Escribir los tests de humo del layout que fallan**

Crear `tests/e2e/layout.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

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
});

test('el conmutador de idioma preserva la página', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /english/i }).click();
  await expect(page).toHaveURL(/\/en\/$/);

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

    const abrir = page.getByRole('button', { name: /abrir menú/i });
    await expect(abrir).toHaveAttribute('aria-expanded', 'false');

    await abrir.click();
    await expect(abrir).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: /navegación principal/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(abrir).toHaveAttribute('aria-expanded', 'false');
    await expect(abrir).toBeFocused();
  });
});
```

- [ ] **Step 3: Correr los tests y verificar que fallan**

Run: `npm run test:e2e -- --project=escritorio`
Expected: FAIL — no existe el enlace de salto ni el conmutador; `getByRole('link', { name: /saltar al contenido/i })` no encuentra nada.

- [ ] **Step 4: Escribir SkipLink y Header**

Crear `src/components/layout/SkipLink.astro`:

```astro
---
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);
---

<a
  href="#contenido"
  class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-copal focus:px-5 focus:py-3 focus:font-ui focus:text-kicker focus:uppercase focus:tracking-[0.2em] focus:text-bosque"
>
  {copy.a11y.saltarContenido}
</a>
```

Crear `src/components/layout/Header.astro`:

```astro
---
import { getCopy } from '../../lib/copy';
import { localizePath, type Lang } from '../../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher.astro';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);

const enlaces = [
  { texto: copy.nav.nosotros, href: localizePath('/nosotros', lang) },
  { texto: copy.nav.experiencias, href: localizePath('/experiencias', lang) },
  { texto: copy.nav.fest, href: localizePath('/2027', lang) },
  { texto: copy.nav.marcas, href: localizePath('/marcas', lang) },
];
---

<header class="absolute inset-x-0 top-0 z-40 text-lino">
  <div class="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-10">
    <a href={localizePath('/', lang)} class="font-display text-2xl tracking-[0.12em]">
      DHARMA
    </a>

    <nav
      id="nav-principal"
      aria-label={copy.a11y.navPrincipal}
      class="hidden items-center gap-8 md:flex"
    >
      {
        enlaces.map((e) => (
          <a
            href={e.href}
            class="font-ui text-kicker uppercase tracking-[0.20em] opacity-90 transition-opacity hover:opacity-100"
          >
            {e.texto}
          </a>
        ))
      }
      <LanguageSwitcher />
    </nav>

    <button
      type="button"
      id="menu-toggle"
      aria-expanded="false"
      aria-controls="nav-movil"
      aria-label={copy.a11y.menuAbrir}
      data-abrir={copy.a11y.menuAbrir}
      data-cerrar={copy.a11y.menuCerrar}
      class="md:hidden"
    >
      <span aria-hidden="true" class="block h-px w-7 bg-lino"></span>
      <span aria-hidden="true" class="mt-2 block h-px w-7 bg-lino"></span>
    </button>
  </div>

  <nav
    id="nav-movil"
    aria-label={copy.a11y.navPrincipal}
    hidden
    class="bg-bosque px-6 pb-8 md:hidden"
  >
    <ul class="flex flex-col gap-5">
      {
        enlaces.map((e) => (
          <li>
            <a href={e.href} class="font-display text-3xl">{e.texto}</a>
          </li>
        ))
      }
    </ul>
    <div class="mt-8"><LanguageSwitcher /></div>
  </nav>
</header>

<script>
  const boton = document.getElementById('menu-toggle');
  const menu = document.getElementById('nav-movil');

  if (boton && menu) {
    const abrir = boton.dataset.abrir ?? 'Abrir menú';
    const cerrar = boton.dataset.cerrar ?? 'Cerrar menú';

    const fijar = (abierto: boolean) => {
      boton.setAttribute('aria-expanded', String(abierto));
      boton.setAttribute('aria-label', abierto ? cerrar : abrir);
      menu.hidden = !abierto;
    };

    boton.addEventListener('click', () => {
      fijar(boton.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
        fijar(false);
        boton.focus(); // devolver el foco a donde estaba
      }
    });
  }
</script>
```

Se usa `hidden` en vez de `display:none` por clase, para que el menú cerrado quede fuera del orden de tabulación sin trabajo extra.

- [ ] **Step 5: Escribir el pie**

Crear `src/components/layout/Footer.astro`:

```astro
---
import { getCopy } from '../../lib/copy';
import { localizePath, type Lang } from '../../lib/i18n';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);
const anio = new Date().getFullYear();

const columnas = [
  {
    titulo: copy.footer.sitio,
    enlaces: [
      { texto: copy.nav.nosotros, href: localizePath('/nosotros', lang) },
      { texto: copy.nav.experiencias, href: localizePath('/experiencias', lang) },
      { texto: copy.nav.fest, href: localizePath('/2027', lang) },
    ],
  },
  {
    titulo: copy.footer.marcas,
    enlaces: [
      { texto: copy.nav.marcas, href: localizePath('/marcas', lang) },
      { texto: copy.footer.aplicar, href: `${localizePath('/marcas', lang)}#aplicar` },
    ],
  },
  {
    titulo: copy.footer.contacto,
    enlaces: [
      { texto: 'Instagram', href: 'https://www.instagram.com/dharma_festcr/' },
    ],
  },
];
---

<footer class="bg-bosque text-arena">
  <div class="mx-auto grid max-w-[1280px] gap-10 px-6 py-16 md:grid-cols-4 md:px-10">
    <div>
      <p class="font-display text-3xl tracking-[0.12em] text-lino">DHARMA</p>
      <p class="mt-3 text-sm">{copy.footer.tagline}</p>
    </div>

    {
      columnas.map((col) => (
        <nav aria-label={col.titulo}>
          <p class="font-ui text-kicker uppercase tracking-[0.24em] text-copal">{col.titulo}</p>
          <ul class="mt-4 flex flex-col gap-2 text-sm">
            {col.enlaces.map((e) => (
              <li>
                <a href={e.href} class="transition-colors hover:text-lino">{e.texto}</a>
              </li>
            ))}
          </ul>
        </nav>
      ))
    }
  </div>

  <div class="mx-auto max-w-[1280px] border-t border-salvia px-6 py-6 text-xs md:px-10">
    © {anio} Dharma Fest. {copy.footer.derechos}
  </div>
</footer>
```

Los datos de contacto son un hueco conocido: el cliente todavía no dio WhatsApp ni correo público (spec §13). Por ahora el pie enlaza solo a Instagram; agregar el resto cuando lleguen.

- [ ] **Step 6: Reescribir el layout base**

Reemplazar por completo `src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/jost';

import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';
import SkipLink from '../components/layout/SkipLink.astro';
import { DEFAULT_LANG, alternates, type Lang } from '../lib/i18n';

interface Props {
  titulo: string;
  descripcion: string;
  lang: Lang;
  /** Ruta sin prefijo de idioma, p. ej. `/experiencias`. */
  rutaCanonica: string;
}

const { titulo, descripcion, lang, rutaCanonica } = Astro.props;

const alternativas = alternates(rutaCanonica);
const canonica = new URL(Astro.url.pathname, Astro.site);
const porDefecto = alternativas.find((a) => a.lang === DEFAULT_LANG)!;
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{titulo}</title>
    <meta name="description" content={descripcion} />
    <link rel="canonical" href={canonica.href} />

    {
      alternativas.map((a) => (
        <link rel="alternate" hreflang={a.lang} href={new URL(a.href, Astro.site).href} />
      ))
    }
    <link rel="alternate" hreflang="x-default" href={new URL(porDefecto.href, Astro.site).href} />

    <meta property="og:type" content="website" />
    <meta property="og:title" content={titulo} />
    <meta property="og:description" content={descripcion} />
    <meta property="og:url" content={canonica.href} />
  </head>

  <body>
    <SkipLink lang={lang} />
    <Header lang={lang} />
    <main id="contenido" tabindex="-1">
      <slot />
    </main>
    <Footer lang={lang} />
  </body>
</html>
```

`tabindex="-1"` en `<main>` hace que el enlace de salto realmente mueva el foco, no solo el scroll.

- [ ] **Step 7: Actualizar las homes provisionales**

Reemplazar `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import { getCopy } from '../lib/copy';

const lang = 'es' as const;
const copy = getCopy(lang);
---

<Base
  titulo={copy.meta.titulo}
  descripcion={copy.meta.descripcion}
  lang={lang}
  rutaCanonica="/"
>
  <h1 class="font-display text-hero px-6 pt-40 md:px-10">
    {copy.hero.titulo} <em class="italic">{copy.hero.tituloEnfasis}</em>
  </h1>
</Base>
```

Crear `src/pages/en/index.astro` idéntico, con `const lang = 'en' as const;` y los mismos `rutaCanonica="/"`.

- [ ] **Step 8: Correr los tests y verificar que pasan**

Run: `npm run test:e2e`
Expected: PASS — 8 tests en escritorio y móvil.

Si el test del conmutador falla porque no encuentra `english`, revisar que `LanguageSwitcher` tenga el texto accesible en `.sr-only` tal como se escribió en la Tarea 2 Step 5.

- [ ] **Step 9: Commit**

```bash
git add src/layouts src/components/layout src/pages playwright.config.ts tests/e2e package.json
git commit -m "Agrega cabecera, pie, layout base y el arnes de Playwright

El layout emite hreflang para ambos idiomas mas x-default, y el enlace de salto
mueve el foco de verdad gracias a tabindex -1 en main.

El menu movil usa el atributo hidden para salir del orden de tabulacion, cierra
con Escape y devuelve el foco al boton.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Home, secciones 01 a 05

Hero, marquee, filosofía, los siete ejes y Campo Lago. Al terminar esta tarea la home ya se siente como la referencia.

**Files:**
- Create: `src/components/sections/Hero.astro`, `Marquee.astro`, `Filosofia.astro`, `Ejes.astro`, `CampoLago.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`
- Create: `tests/e2e/home-superior.spec.ts`

**Interfaces:**
- Consumes: `Seccion`, `Kicker`, `TituloSeccion`, `Boton`, `Reveal` (Task 4); `getCopy` (Task 3); `localizePath` (Task 2).
- Produces: cinco componentes que reciben `lang: Lang` y nada más. Leen su texto de `getCopy(lang)` y sus imágenes por import directo desde `src/assets/img/`.

Decisión de acoplamiento: las secciones sí importan `getCopy`, porque el copy es estático y global. Lo que **no** hacen es tocar `astro:content`; las experiencias y las marcas entran por props desde `index.astro` (Tareas 7 y 8).

- [ ] **Step 1: Escribir los tests de humo que fallan**

Crear `tests/e2e/home-superior.spec.ts`:

```ts
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

test('toda imagen de las secciones superiores tiene alt', async ({ page }) => {
  await page.goto('/');
  const imagenes = page.locator('main img');
  const total = await imagenes.count();
  expect(total).toBeGreaterThan(0);

  for (let i = 0; i < total; i++) {
    const alt = await imagenes.nth(i).getAttribute('alt');
    expect(alt, `imagen ${i} sin alt`).toBeTruthy();
  }
});

test('la home inglesa traduce el hero', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('more than one shape');
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm run test:e2e -- home-superior --project=escritorio`
Expected: FAIL — no existe `[data-marquee]` ni `[data-eje]`; el hero todavía no tiene CTA.

- [ ] **Step 3: Escribir el Hero**

Crear `src/components/sections/Hero.astro`:

```astro
---
import { Image } from 'astro:assets';
import Boton from '../ui/Boton.astro';
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';
import portada from '../../assets/img/hero.jpg';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);
---

<section class="relative flex min-h-[92svh] items-center justify-center overflow-hidden">
  <Image
    src={portada}
    alt=""
    widths={[900, 1400, 2000, 2400]}
    sizes="100vw"
    loading="eager"
    fetchpriority="high"
    class="absolute inset-0 h-full w-full object-cover"
  />
  <div
    aria-hidden="true"
    class="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,53,39,0.66),rgba(30,53,39,0.42)_45%,rgba(30,53,39,0.78))]"
  >
  </div>

  <div class="relative z-10 px-6 text-center text-lino md:px-10">
    <p class="font-ui text-kicker uppercase tracking-[0.32em] text-copal">
      {copy.hero.kicker}
    </p>

    <h1 class="mt-5 font-display text-hero">
      {copy.hero.titulo}<br /><em class="italic">{copy.hero.tituloEnfasis}</em>
    </h1>

    <p class="mt-4 font-ui text-sm tracking-[0.06em] opacity-90">{copy.hero.subtitulo}</p>

    <Boton href="#sumate" variante="contorno" class="mt-8">{copy.hero.cta}</Boton>
  </div>
</section>
```

La imagen lleva `alt=""` a propósito: es decoración de fondo y el titular ya comunica el mensaje. Va con `loading="eager"` y `fetchpriority="high"` porque es el LCP. El `h1` no se envuelve en `Reveal`.

Cuando el cliente entregue el video del hero, se reemplaza el `<Image>` por un `<video>` con `poster` apuntando a esta misma imagen, `muted playsinline`, y `preload="none"` bajo `prefers-reduced-motion`.

- [ ] **Step 4: Escribir el Marquee**

Crear `src/components/sections/Marquee.astro`:

```astro
---
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);

// Se duplica la lista para que el loop no muestre huecos al reiniciarse.
const nombres = copy.ejes.map((e) => e.nombre);
const cinta = [...nombres, ...nombres];
---

<div data-marquee aria-hidden="true" class="overflow-hidden bg-bosque py-4 text-arena">
  <div class="dh-cinta flex w-max gap-8 whitespace-nowrap">
    {
      cinta.map((nombre) => (
        <span class="font-ui text-kicker uppercase tracking-[0.28em]">
          {nombre} <span class="text-copal">✦</span>
        </span>
      ))
    }
  </div>
</div>

<style>
  .dh-cinta {
    animation: dh-desplazar 38s linear infinite;
  }

  @keyframes dh-desplazar {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* Restricción global: sin movimiento, la cinta se queda quieta. */
  @media (prefers-reduced-motion: reduce) {
    .dh-cinta { animation: none; }
  }
</style>
```

`aria-hidden="true"` porque los siete ejes ya están como texto real en la sección 04. Repetirlos en el lector de pantalla sería ruido.

- [ ] **Step 5: Escribir Filosofía y Campo Lago**

Ambas son el mismo patrón de dos columnas, invertido. Crear `src/components/sections/Filosofia.astro`:

```astro
---
import { Image } from 'astro:assets';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import Reveal from '../ui/Reveal.astro';
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';
import foto from '../../assets/img/filosofia.jpg';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);
---

<section class="grid bg-lino md:grid-cols-2">
  <div class="flex flex-col justify-center px-6 py-[var(--spacing-seccion)] md:px-16">
    <Reveal>
      <Kicker>{copy.filosofia.kicker}</Kicker>
      <TituloSeccion
        texto={copy.filosofia.titulo}
        enfasis={copy.filosofia.tituloEnfasis}
        class="mt-4"
      />
      <p class="mt-6 text-salvia">{copy.filosofia.cuerpo}</p>
    </Reveal>
  </div>

  <Image
    src={foto}
    alt="Personas compartiendo en una experiencia Dharma"
    widths={[700, 1100, 1400]}
    sizes="(min-width: 768px) 50vw, 100vw"
    class="h-full min-h-[320px] w-full object-cover"
  />
</section>
```

Crear `src/components/sections/CampoLago.astro` con la misma estructura, pero la imagen a la izquierda y el bloque de texto sobre `bg-bosque` con `tono="oscuro"` en `Kicker` y `TituloSeccion`, el párrafo en `text-arena`, y la imagen importada de `../../assets/img/campo-lago.jpg` con alt `Campo Lago, sede de Dharma Fest, rodeado de naturaleza`. Los textos salen de `copy.campoLago`.

- [ ] **Step 6: Escribir los siete ejes en grid bento**

Crear `src/components/sections/Ejes.astro`:

```astro
---
import { Image } from 'astro:assets';
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import Reveal from '../ui/Reveal.astro';
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';

import charlas from '../../assets/img/ejes/charlas.jpg';
import artistas from '../../assets/img/ejes/artistas.jpg';
import mercadito from '../../assets/img/ejes/mercadito.jpg';
import actividades from '../../assets/img/ejes/actividades.jpg';
import gastronomia from '../../assets/img/ejes/gastronomia.jpg';
import asociaciones from '../../assets/img/ejes/asociaciones.jpg';
import entretenimiento from '../../assets/img/ejes/entretenimiento.jpg';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);

// El orden calza con copy.ejes. La asimetría del bento sale de estas clases.
const imagenes = [charlas, artistas, mercadito, actividades, gastronomia, asociaciones, entretenimiento];
const areas = [
  'md:col-span-2 md:row-span-2',
  '', '', '', '',
  'md:col-span-2',
  'md:col-span-2',
];
---

<Seccion fondo="arena">
  <Reveal>
    <Kicker>{copy.ejesSeccion.kicker}</Kicker>
    <TituloSeccion
      texto={copy.ejesSeccion.titulo}
      enfasis={copy.ejesSeccion.tituloEnfasis}
      class="mt-4"
    />
  </Reveal>

  <ul class="mt-12 grid grid-cols-2 gap-2 md:grid-cols-4 md:auto-rows-[210px]">
    {
      copy.ejes.map((eje, i) => (
        <li data-eje class={`relative overflow-hidden ${areas[i]}`}>
          <Reveal indice={i} class="h-full">
            <Image
              src={imagenes[i]}
              alt={`${eje.nombre}: ${eje.descripcion}`}
              widths={[400, 800, 1200]}
              sizes="(min-width: 768px) 25vw, 50vw"
              class="h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              class="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(30,53,39,0.85))]"
            />
            <div class="absolute inset-x-0 bottom-0 p-4">
              <p class="font-ui text-kicker uppercase tracking-[0.16em] text-lino">
                {eje.nombre}
              </p>
              <p class="mt-1 font-display text-lg text-arena">{eje.descripcion}</p>
            </div>
          </Reveal>
        </li>
      ))
    }
  </ul>
</Seccion>
```

Es una `<ul>` y no una pila de `<div>` porque semánticamente son siete cosas del mismo tipo. El `alt` combina nombre y descripción, así que quien no ve las fotos recibe la misma información.

- [ ] **Step 7: Componer la home**

Reemplazar el `<Base>` de `src/pages/index.astro` por:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/sections/Hero.astro';
import Marquee from '../components/sections/Marquee.astro';
import Filosofia from '../components/sections/Filosofia.astro';
import Ejes from '../components/sections/Ejes.astro';
import CampoLago from '../components/sections/CampoLago.astro';
import { getCopy } from '../lib/copy';

const lang = 'es' as const;
const copy = getCopy(lang);
---

<Base
  titulo={copy.meta.titulo}
  descripcion={copy.meta.descripcion}
  lang={lang}
  rutaCanonica="/"
>
  <Hero lang={lang} />
  <Marquee lang={lang} />
  <Filosofia lang={lang} />
  <Ejes lang={lang} />
  <CampoLago lang={lang} />
</Base>
```

Aplicar el mismo cambio a `src/pages/en/index.astro` con `lang = 'en'`.

- [ ] **Step 8: Correr los tests y verificar que pasan**

Run: `npm run test:e2e`
Expected: PASS — los 6 tests nuevos más los 8 de la Tarea 5.

- [ ] **Step 9: Revisar a ojo en tres anchos**

Run: `npm run dev`

Abrir `http://localhost:4321` y comprobar en 375 px, 768 px y 1440 px:
- El hero ocupa casi toda la pantalla y el titular no se corta.
- El marquee se desplaza continuo, sin salto visible al reiniciar.
- El bento de ejes queda asimétrico en escritorio y en dos columnas parejas en móvil.
- Activar movimiento reducido en el sistema operativo y recargar: el marquee queda quieto y todo el contenido se ve sin necesidad de hacer scroll.

- [ ] **Step 10: Commit**

```bash
git add src/components/sections src/pages tests/e2e/home-superior.spec.ts
git commit -m "Agrega las cinco primeras secciones de la home

Hero, marquee, filosofia, bento de los siete ejes y Campo Lago.

El marquee es decorativo y va aria-hidden porque los siete ejes ya estan como
texto real en la seccion de ejes. La imagen del hero es el LCP, asi que carga
en eager y el h1 no se envuelve en Reveal.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Home, secciones 06 a 09

Experiencias, teaser del 2027 con cuenta regresiva, cifras del 2025 y marcas aliadas. Acá entra por primera vez el contenido de las colecciones.

**Files:**
- Create: `src/lib/countdown.ts`
- Create: `src/components/sections/Experiencias.astro`, `Fest2027.astro`, `Numeros2025.astro`, `Marcas.astro`
- Create: `src/components/ui/TarjetaExperiencia.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`
- Test: `tests/unit/countdown.test.ts`, `tests/e2e/home-medio.spec.ts`

**Interfaces:**
- Consumes: `experienciasDe`, `publicables` (Task 3); `Seccion`, `Kicker`, `TituloSeccion`, `Boton`, `Reveal` (Task 4).
- Produces:
  - `interface PartesCuenta { dias: number; horas: number; minutos: number }`
  - `countdownParts(objetivo: Date, ahora: Date): PartesCuenta | null` — `null` si el objetivo ya pasó
  - `<TarjetaExperiencia experiencia lang>` donde `experiencia` es `{ slug, titulo, resumen, fecha, estado, portada, portadaAlt }`
  - `<Experiencias lang experiencias>` — recibe las experiencias por props, ya filtradas
  - `<Fest2027 lang fechaObjetivo?: Date>` — sin fecha, se renderiza sin contador
  - `<Marcas lang marcas>` — recibe solo las que tienen permiso

- [ ] **Step 1: Escribir el test de la cuenta regresiva que falla**

Crear `tests/unit/countdown.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { countdownParts } from '../../src/lib/countdown';

const ahora = new Date('2026-09-08T12:00:00Z');

describe('countdownParts', () => {
  it('cuenta días, horas y minutos completos', () => {
    const objetivo = new Date('2026-09-11T15:30:00Z');
    expect(countdownParts(objetivo, ahora)).toEqual({ dias: 3, horas: 3, minutos: 30 });
  });

  it('trunca los segundos en vez de redondear', () => {
    const objetivo = new Date('2026-09-08T12:01:59Z');
    expect(countdownParts(objetivo, ahora)).toEqual({ dias: 0, horas: 0, minutos: 1 });
  });

  it('devuelve null si el objetivo ya pasó', () => {
    expect(countdownParts(new Date('2026-09-07T12:00:00Z'), ahora)).toBeNull();
  });

  it('devuelve null en el instante exacto del objetivo', () => {
    expect(countdownParts(ahora, ahora)).toBeNull();
  });

  it('maneja distancias largas sin desbordar los días', () => {
    const objetivo = new Date('2027-09-08T12:00:00Z');
    expect(countdownParts(objetivo, ahora)?.dias).toBe(365);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test -- countdown`
Expected: FAIL — `Failed to resolve import "../../src/lib/countdown"`.

- [ ] **Step 3: Implementar la cuenta regresiva**

Crear `src/lib/countdown.ts`:

```ts
export interface PartesCuenta {
  dias: number;
  horas: number;
  minutos: number;
}

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Distancia entre `ahora` y `objetivo`, partida en días, horas y minutos.
 * Devuelve null si el objetivo ya llegó o pasó, para que la vista sepa
 * que no debe mostrar contador.
 */
export function countdownParts(objetivo: Date, ahora: Date): PartesCuenta | null {
  const resta = objetivo.getTime() - ahora.getTime();
  if (resta <= 0) return null;

  return {
    dias: Math.floor(resta / DIA),
    horas: Math.floor((resta % DIA) / HORA),
    minutos: Math.floor((resta % HORA) / MINUTO),
  };
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm run test -- countdown`
Expected: PASS — 5 tests.

- [ ] **Step 5: Escribir los tests de humo de las secciones que fallan**

Crear `tests/e2e/home-medio.spec.ts`:

```ts
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
```

El último test fija por contrato la restricción de permisos: hoy ninguna marca lo tiene, así que la sección no debe existir en el DOM. Cuando el cliente autorice, ese test se actualiza a `toHaveCount(1)` en la misma tarea que cambia el JSON.

- [ ] **Step 6: Correr los tests y verificar que fallan**

Run: `npm run test:e2e -- home-medio --project=escritorio`
Expected: FAIL — no existe `[data-experiencia]` ni `#fest-2027`.

- [ ] **Step 7: Escribir la tarjeta y la sección de experiencias**

Crear `src/components/ui/TarjetaExperiencia.astro`:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { getCopy } from '../../lib/copy';
import { localizePath, type Lang } from '../../lib/i18n';

interface Props {
  lang: Lang;
  slug: string;
  titulo: string;
  resumen: string;
  fecha: Date;
  estado: 'proxima' | 'pasada';
  portada: ImageMetadata;
  portadaAlt: string;
}

const { lang, slug, titulo, resumen, fecha, estado, portada, portadaAlt } = Astro.props;
const copy = getCopy(lang);

// El slug del archivo viene como `es/nombre`; la URL solo lleva la parte final.
const nombreArchivo = slug.split('/').pop()!;
const href = localizePath(`/experiencias/${nombreArchivo}`, lang);

const etiqueta =
  estado === 'proxima'
    ? `${copy.experiencias.etiquetaProxima} · ${fecha.toLocaleDateString(lang, { day: 'numeric', month: 'long' })}`
    : copy.experiencias.etiquetaPasada;
---

<article data-experiencia class="group">
  <a href={href} class="block">
    <Image
      src={portada}
      alt={portadaAlt}
      widths={[400, 800, 1200]}
      sizes="(min-width: 768px) 33vw, 100vw"
      class="aspect-[4/3] w-full object-cover"
    />
    <p class="mt-4 font-ui text-kicker uppercase tracking-[0.18em] text-copal-ink">
      {etiqueta}
    </p>
    <h3 class="mt-2 font-display text-2xl text-bosque group-hover:text-copal-ink">
      {titulo}
    </h3>
    <p class="mt-2 text-sm text-salvia">{resumen}</p>
  </a>
</article>
```

La etiqueta usa `text-copal-ink` y no `text-copal`: es texto pequeño sobre fondo claro, así que aplica la regla de contraste.

Crear `src/components/sections/Experiencias.astro`:

```astro
---
import type { ImageMetadata } from 'astro';
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import Reveal from '../ui/Reveal.astro';
import TarjetaExperiencia from '../ui/TarjetaExperiencia.astro';
import { getCopy } from '../../lib/copy';
import { localizePath, type Lang } from '../../lib/i18n';

export interface ExperienciaEnTarjeta {
  slug: string;
  titulo: string;
  resumen: string;
  fecha: Date;
  estado: 'proxima' | 'pasada';
  portada: ImageMetadata;
  portadaAlt: string;
}

interface Props {
  lang: Lang;
  experiencias: ExperienciaEnTarjeta[];
}

const { lang, experiencias } = Astro.props;
const copy = getCopy(lang);
---

<Seccion id="experiencias">
  <div class="flex flex-wrap items-baseline justify-between gap-4">
    <Reveal>
      <Kicker>{copy.experiencias.kicker}</Kicker>
      <TituloSeccion
        texto={copy.experiencias.titulo}
        enfasis={copy.experiencias.tituloEnfasis}
        class="mt-4"
      />
    </Reveal>

    <a
      href={localizePath('/experiencias', lang)}
      class="font-ui text-kicker uppercase tracking-[0.24em] text-copal-ink underline-offset-8 hover:underline"
    >
      {copy.experiencias.verTodas} →
    </a>
  </div>

  {
    experiencias.length === 0 ? (
      <p class="mt-10 text-salvia">{copy.experiencias.vacio}</p>
    ) : (
      <div class="mt-12 grid gap-8 md:grid-cols-3">
        {experiencias.map((e, i) => (
          <Reveal indice={i}>
            <TarjetaExperiencia lang={lang} {...e} />
          </Reveal>
        ))}
      </div>
    )
  }
</Seccion>
```

El estado vacío no es adorno: si el cliente borra las experiencias, la sección dice algo útil en vez de dejar un hueco.

- [ ] **Step 8: Escribir Fest2027, Numeros2025 y Marcas**

Crear `src/components/sections/Fest2027.astro`:

```astro
---
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import Boton from '../ui/Boton.astro';
import Reveal from '../ui/Reveal.astro';
import { countdownParts } from '../../lib/countdown';
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';

interface Props {
  lang: Lang;
  /** Sin fecha confirmada por el cliente, el bloque va sin contador. */
  fechaObjetivo?: Date;
}

const { lang, fechaObjetivo } = Astro.props;
const copy = getCopy(lang);

const cuenta = fechaObjetivo ? countdownParts(fechaObjetivo, new Date()) : null;

const unidades = cuenta
  ? [
      { valor: cuenta.dias, etiqueta: copy.fest2027.dias },
      { valor: cuenta.horas, etiqueta: copy.fest2027.horas },
      { valor: cuenta.minutos, etiqueta: copy.fest2027.minutos },
    ]
  : [];
---

<Seccion id="fest-2027" fondo="bosque" class="text-center">
  <Reveal>
    <Kicker tono="oscuro" class="tracking-[0.32em]">{copy.fest2027.kicker}</Kicker>
    <TituloSeccion
      texto={copy.fest2027.titulo}
      enfasis={copy.fest2027.tituloEnfasis}
      tono="oscuro"
      class="mt-4"
    />
    <p class="mx-auto mt-6 text-arena">{copy.fest2027.cuerpo}</p>

    {
      unidades.length > 0 && (
        <ul data-cuenta class="mt-10 flex justify-center gap-10">
          {unidades.map((u) => (
            <li>
              <p class="font-display text-5xl text-copal">{u.valor}</p>
              <p class="mt-2 font-ui text-kicker uppercase tracking-[0.20em] text-arena">
                {u.etiqueta}
              </p>
            </li>
          ))}
        </ul>
      )
    }

    <Boton href="#sumate" class="mt-10">{copy.fest2027.cta}</Boton>
  </Reveal>
</Seccion>
```

El contador se calcula en build, no en el navegador. Como el sitio es estático, un contador de minutos quedaría congelado en la hora del build. **Mientras el cliente no confirme fecha esto no importa**; cuando la confirme, decidir entonces si se muestran solo días (correcto en estático) o si se agrega un script que lo actualice en vivo.

Crear `src/components/sections/Numeros2025.astro` sobre `fondo="bosqueDeep"`, con `copy.numeros2025.cifras` mapeadas en una `<ul>` de cuatro columnas; cada `<li>` lleva `data-cifra`, el valor en `font-display text-5xl text-copal` y la etiqueta en `text-kicker uppercase tracking-[0.20em] text-arena`.

Crear `src/components/sections/Marcas.astro`:

```astro
---
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import Boton from '../ui/Boton.astro';
import Reveal from '../ui/Reveal.astro';
import { getCopy } from '../../lib/copy';
import { localizePath, type Lang } from '../../lib/i18n';

export interface MarcaEnGrid {
  id: string;
  nombre: string;
  instagram: string;
  url?: string;
}

interface Props {
  lang: Lang;
  /** Ya filtradas con publicables(). Si viene vacío, la sección no se renderiza. */
  marcas: MarcaEnGrid[];
}

const { lang, marcas } = Astro.props;
const copy = getCopy(lang);
---

{
  marcas.length > 0 && (
    <Seccion id="marcas" fondo="arena">
      <Reveal>
        <Kicker>{copy.marcas.kicker}</Kicker>
        <TituloSeccion
          texto={copy.marcas.titulo}
          enfasis={copy.marcas.tituloEnfasis}
          class="mt-4"
        />
      </Reveal>

      <ul class="mt-12 grid grid-cols-2 gap-4 md:grid-cols-6">
        {marcas.map((m, i) => (
          <li>
            <Reveal indice={i}>
              <a
                href={m.url ?? `https://www.instagram.com/${m.instagram.replace('@', '')}/`}
                rel="noopener"
                class="flex h-20 items-center justify-center border border-piedra/40 px-3 text-center font-ui text-xs text-piedra transition-colors hover:border-copal-ink hover:text-copal-ink"
              >
                {m.nombre}
              </a>
            </Reveal>
          </li>
        ))}
      </ul>

      <Boton href={`${localizePath('/marcas', lang)}#aplicar`} class="mt-12">
        {copy.marcas.cta}
      </Boton>
    </Seccion>
  )
}
```

Mientras no haya logos ni permisos, el grid muestra el nombre en texto. Cuando lleguen los SVG, se reemplaza el texto por `<Image>` sin tocar la estructura.

- [ ] **Step 9: Conectar las colecciones desde la home**

Reemplazar el frontmatter de `src/pages/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import Hero from '../components/sections/Hero.astro';
import Marquee from '../components/sections/Marquee.astro';
import Filosofia from '../components/sections/Filosofia.astro';
import Ejes from '../components/sections/Ejes.astro';
import CampoLago from '../components/sections/CampoLago.astro';
import Experiencias from '../components/sections/Experiencias.astro';
import Fest2027 from '../components/sections/Fest2027.astro';
import Numeros2025 from '../components/sections/Numeros2025.astro';
import Marcas from '../components/sections/Marcas.astro';
import { getCopy } from '../lib/copy';
import { experienciasDe, publicables } from '../lib/contenido';

const lang = 'es' as const;
const copy = getCopy(lang);

const todas = await getCollection('experiencias');
const experiencias = experienciasDe(
  todas.map((e) => ({ slug: e.id, ...e.data })),
  lang,
).slice(0, 3);

const marcas = publicables(
  (await getCollection('marcas')).map((m) => ({ id: m.id, ...m.data })),
);
---
```

Y el cuerpo, después de `<CampoLago lang={lang} />`:

```astro
  <Experiencias lang={lang} experiencias={experiencias} />
  <Fest2027 lang={lang} />
  <Numeros2025 lang={lang} />
  <Marcas lang={lang} marcas={marcas} />
```

`Fest2027` va sin `fechaObjetivo` a propósito: no hay fecha confirmada (spec §12, riesgo 5). Aplicar los mismos cambios a `src/pages/en/index.astro`.

- [ ] **Step 10: Correr todos los tests**

Run: `npm run test && npm run test:e2e`
Expected: PASS — todos en verde, unitarios y end-to-end.

- [ ] **Step 11: Commit**

```bash
git add src/lib/countdown.ts src/components src/pages tests
git commit -m "Agrega las secciones de experiencias, 2027, cifras y marcas

La cuenta regresiva devuelve null si el objetivo ya paso, asi que el bloque
2027 se renderiza sin contador mientras el cliente no confirme fecha.

La seccion de marcas no existe en el DOM si ninguna tiene permiso, y un test
lo fija por contrato.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Home, secciones 10 a 13 y captura de comunidad

Voces, quiénes somos, el bloque de registro y la página de gracias. Acá se cierra la conversión, que es la métrica de éxito del proyecto.

**Files:**
- Create: `src/lib/subscribe.ts`
- Create: `src/components/sections/Voces.astro`, `Nosotros.astro`, `Sumate.astro`
- Create: `src/pages/gracias.astro`, `src/pages/en/gracias.astro`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`
- Test: `tests/unit/subscribe.test.ts`, `tests/e2e/sumate.spec.ts`

**Interfaces:**
- Consumes: `publicables` (Task 3); primitivas de la Task 4.
- Produces:
  - `type ResultadoSuscripcion = { ok: true } | { ok: false; error: 'correo-invalido' | 'error-proveedor' }`
  - `esCorreoValido(correo: string): boolean`
  - `subscribe(correo: string, lang: Lang): Promise<ResultadoSuscripcion>`
  - `<Voces lang testimonios>` — recibe solo los que tienen permiso
  - `<Sumate lang>` — id `sumate`, destino de todos los CTA del sitio

- [ ] **Step 1: Escribir el test de suscripción que falla**

Crear `tests/unit/subscribe.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { esCorreoValido, subscribe } from '../../src/lib/subscribe';

describe('esCorreoValido', () => {
  it.each([
    'hola@dharmafest.cr',
    'nombre.apellido@correo.co.cr',
    'a+etiqueta@dominio.com',
  ])('acepta %s', (correo) => {
    expect(esCorreoValido(correo)).toBe(true);
  });

  it.each([
    '',
    '   ',
    'sinarroba.com',
    'dos@@arrobas.com',
    'sin@dominio',
    'con espacio@correo.com',
  ])('rechaza %s', (correo) => {
    expect(esCorreoValido(correo)).toBe(false);
  });

  it('ignora espacios alrededor', () => {
    expect(esCorreoValido('  hola@dharmafest.cr  ')).toBe(true);
  });
});

describe('subscribe', () => {
  it('rechaza un correo inválido sin llamar al proveedor', async () => {
    const resultado = await subscribe('no-es-correo', 'es');
    expect(resultado).toEqual({ ok: false, error: 'correo-invalido' });
  });

  it('acepta un correo válido con el adaptador de consola', async () => {
    const espia = vi.spyOn(console, 'info').mockImplementation(() => {});

    const resultado = await subscribe('hola@dharmafest.cr', 'es');

    expect(resultado).toEqual({ ok: true });
    expect(espia).toHaveBeenCalledWith(
      '[dharma] suscripción simulada',
      { correo: 'hola@dharmafest.cr', lang: 'es' },
    );

    espia.mockRestore();
  });

  it('normaliza el correo antes de entregarlo al proveedor', async () => {
    const espia = vi.spyOn(console, 'info').mockImplementation(() => {});

    await subscribe('  HOLA@Dharmafest.CR ', 'en');

    expect(espia).toHaveBeenCalledWith(
      '[dharma] suscripción simulada',
      { correo: 'hola@dharmafest.cr', lang: 'en' },
    );

    espia.mockRestore();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npm run test -- subscribe`
Expected: FAIL — `Failed to resolve import "../../src/lib/subscribe"`.

- [ ] **Step 3: Implementar el adaptador de suscripción**

Crear `src/lib/subscribe.ts`:

```ts
import type { Lang } from './i18n';

export type ResultadoSuscripcion =
  | { ok: true }
  | { ok: false; error: 'correo-invalido' | 'error-proveedor' };

/**
 * Validación deliberadamente laxa. El único juez real de un correo es enviarlo;
 * acá solo se atrapan los errores de dedo evidentes.
 */
const FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function esCorreoValido(correo: string): boolean {
  return FORMATO.test(correo.trim());
}

/** Contrato que debe cumplir cualquier proveedor de correo. */
export interface Proveedor {
  (correo: string, lang: Lang): Promise<ResultadoSuscripcion>;
}

/**
 * Adaptador por defecto: no persiste nada.
 *
 * El cliente todavía no eligió proveedor (spec §12, riesgo 6), así que el
 * formulario funciona de punta a punta pero los correos no se guardan.
 * Para conectar Mailchimp, Brevo o Supabase, escribir un Proveedor nuevo y
 * cambiar la constante PROVEEDOR de abajo. Ningún componente se entera.
 */
const proveedorConsola: Proveedor = async (correo, lang) => {
  console.info('[dharma] suscripción simulada', { correo, lang });
  return { ok: true };
};

const PROVEEDOR: Proveedor = proveedorConsola;

export async function subscribe(correo: string, lang: Lang): Promise<ResultadoSuscripcion> {
  if (!esCorreoValido(correo)) {
    return { ok: false, error: 'correo-invalido' };
  }

  try {
    return await PROVEEDOR(correo.trim().toLowerCase(), lang);
  } catch {
    return { ok: false, error: 'error-proveedor' };
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npm run test -- subscribe`
Expected: PASS — 13 tests.

- [ ] **Step 5: Escribir el test end-to-end del formulario que falla**

Crear `tests/e2e/sumate.spec.ts`:

```ts
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
```

- [ ] **Step 6: Correr los tests y verificar que fallan**

Run: `npm run test:e2e -- sumate --project=escritorio`
Expected: FAIL — no existe el campo de correo.

- [ ] **Step 7: Escribir Voces y Nosotros**

Crear `src/components/sections/Voces.astro`:

```astro
---
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import Reveal from '../ui/Reveal.astro';
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';

export interface Testimonio {
  id: string;
  cita: string;
  autor: string;
  handle: string;
}

interface Props {
  lang: Lang;
  /** Ya filtrados con publicables(). Vacío = la sección no se renderiza. */
  testimonios: Testimonio[];
}

const { lang, testimonios } = Astro.props;
const copy = getCopy(lang);
---

{
  testimonios.length > 0 && (
    <Seccion id="voces">
      <Reveal><Kicker>{copy.voces.kicker}</Kicker></Reveal>

      <ul class="mt-10 grid gap-10 md:grid-cols-3">
        {testimonios.map((t, i) => (
          <li>
            <Reveal indice={i}>
              <figure>
                <blockquote class="font-display text-2xl italic text-bosque">
                  “{t.cita}”
                </blockquote>
                <figcaption class="mt-4 font-ui text-kicker uppercase tracking-[0.18em] text-copal-ink">
                  {t.autor} · {t.handle}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </Seccion>
  )
}
```

Crear `src/components/sections/Nosotros.astro`: dos columnas como `Filosofia`, con `copy.nosotros.kicker`, la cita en `<blockquote>` con `font-display text-3xl italic`, la atribución en `copy.nosotros.autor`, y la foto importada de `../../assets/img/equipo.jpg` con alt `Equipo de Dharma Fest`.

Mientras el cliente no diga quién está detrás de la marca (spec §12, riesgo 2), la atribución es genérica. En cuanto haya nombre y cara, esta sección gana peso sin cambiar de estructura.

- [ ] **Step 8: Escribir el bloque de registro**

Crear `src/components/sections/Sumate.astro`:

```astro
---
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import Reveal from '../ui/Reveal.astro';
import { getCopy } from '../../lib/copy';
import { localizePath, type Lang } from '../../lib/i18n';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);
const destinoGracias = localizePath('/gracias', lang);
---

<Seccion id="sumate" fondo="bosque" class="text-center">
  <Reveal>
    <Kicker tono="oscuro">{copy.sumate.kicker}</Kicker>
    <TituloSeccion
      texto={copy.sumate.titulo}
      enfasis={copy.sumate.tituloEnfasis}
      tono="oscuro"
      class="mt-4"
    />
    <p class="mx-auto mt-6 text-arena">{copy.sumate.cuerpo}</p>

    <form
      id="form-sumate"
      novalidate
      data-lang={lang}
      data-gracias={destinoGracias}
      data-error-correo={copy.sumate.errorCorreo}
      data-error-general={copy.sumate.errorGeneral}
      class="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
    >
      <label for="correo" class="sr-only">{copy.sumate.etiquetaCorreo}</label>
      <input
        id="correo"
        name="correo"
        type="email"
        inputmode="email"
        autocomplete="email"
        placeholder={copy.sumate.placeholder}
        aria-describedby="error-sumate"
        class="flex-1 border border-arena/40 bg-transparent px-4 py-3 text-lino placeholder:text-arena/60"
      />
      <button
        type="submit"
        class="bg-copal px-7 py-3 font-ui text-kicker uppercase tracking-[0.24em] text-bosque transition-colors hover:bg-copal-ink hover:text-lino"
      >
        {copy.sumate.boton}
      </button>
    </form>

    <p id="error-sumate" role="alert" hidden class="mt-4 font-ui text-sm text-copal"></p>
  </Reveal>
</Seccion>

<script>
  import { subscribe } from '../../lib/subscribe';
  import type { Lang } from '../../lib/i18n';

  const form = document.getElementById('form-sumate') as HTMLFormElement | null;
  const campo = document.getElementById('correo') as HTMLInputElement | null;
  const aviso = document.getElementById('error-sumate');

  if (form && campo && aviso) {
    const lang = (form.dataset.lang ?? 'es') as Lang;

    const mostrarError = (mensaje: string) => {
      aviso.textContent = mensaje;
      aviso.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
    };

    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      aviso.hidden = true;
      campo.removeAttribute('aria-invalid');

      const resultado = await subscribe(campo.value, lang);

      if (resultado.ok) {
        window.location.assign(form.dataset.gracias ?? '/gracias');
        return;
      }

      mostrarError(
        resultado.error === 'correo-invalido'
          ? (form.dataset.errorCorreo ?? '')
          : (form.dataset.errorGeneral ?? ''),
      );
    });
  }
</script>
```

`novalidate` desactiva la burbuja nativa del navegador para que el mensaje salga en el idioma del sitio y en un `role="alert"` que el lector de pantalla anuncia. El `<label>` va en `sr-only`: el diseño no lo muestra, pero existe.

- [ ] **Step 9: Crear la página de gracias y componer la home**

Crear `src/pages/gracias.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Seccion from '../components/ui/Seccion.astro';
import Boton from '../components/ui/Boton.astro';
import { getCopy } from '../lib/copy';

const lang = 'es' as const;
const copy = getCopy(lang);
---

<Base
  titulo={`${copy.gracias.titulo} · Dharma Fest`}
  descripcion={copy.gracias.cuerpo}
  lang={lang}
  rutaCanonica="/gracias"
>
  <Seccion fondo="bosque" class="min-h-[70svh] text-center">
    <h1 class="font-display text-hero text-lino">{copy.gracias.titulo}</h1>
    <p class="mx-auto mt-6 text-arena">{copy.gracias.cuerpo}</p>
    <Boton href="/" class="mt-10">{copy.gracias.volver}</Boton>
  </Seccion>
</Base>
```

Crear `src/pages/en/gracias.astro` igual, con `lang = 'en'`, `rutaCanonica="/gracias"` y `href="/en/"` en el botón.

En `src/pages/index.astro`, agregar al frontmatter:

```ts
const testimonios = publicables(
  (await getCollection('testimonios'))
    .map((t) => ({ id: t.id, ...t.data }))
    .filter((t) => t.lang === lang),
);
```

Y al cuerpo, después de `<Marcas ... />`:

```astro
  <Voces lang={lang} testimonios={testimonios} />
  <Nosotros lang={lang} />
  <Sumate lang={lang} />
```

Aplicar lo mismo en `src/pages/en/index.astro`.

- [ ] **Step 10: Correr todos los tests**

Run: `npm run test && npm run test:e2e`
Expected: PASS — todos en verde, unitarios y end-to-end.

- [ ] **Step 11: Verificar el hueco conocido a mano**

Run: `npm run dev`, abrir la consola del navegador, enviar el formulario con un correo válido.
Expected: en consola aparece `[dharma] suscripción simulada { correo: ..., lang: 'es' }` y la página navega a `/gracias`.

Esto confirma el comportamiento documentado: **el flujo funciona de punta a punta pero el correo no se guarda en ningún lado.** No es un bug pendiente, es la decisión de la spec §8 hasta que el cliente elija proveedor.

- [ ] **Step 12: Commit**

```bash
git add src/lib/subscribe.ts src/components/sections src/pages tests
git commit -m "Agrega voces, nosotros y la captura de comunidad

El formulario valida en el idioma del sitio y anuncia el error por role alert,
en vez de dejarselo a la burbuja nativa del navegador.

subscribe() usa un adaptador intercambiable; el de por defecto registra en
consola y no persiste nada, porque el cliente aun no eligio proveedor de correo.

La seccion de voces no existe en el DOM mientras ningun testimonio tenga
permiso del cliente.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Listado y detalle de experiencias

La única parte del sitio con rutas dinámicas. Es lo que el cliente va a actualizar más seguido, así que agregar una experiencia debe ser crear un archivo Markdown y nada más.

**Files:**
- Create: `src/pages/experiencias/index.astro`, `src/pages/experiencias/[slug].astro`
- Create: `src/pages/en/experiencias/index.astro`, `src/pages/en/experiencias/[slug].astro`
- Create: `src/components/ui/Galeria.astro`
- Test: `tests/e2e/experiencias.spec.ts`

**Interfaces:**
- Consumes: `experienciasDe` (Task 3); `TarjetaExperiencia` (Task 7); `Seccion`, `Kicker`, `TituloSeccion`, `Boton`, `Reveal` (Task 4).
- Produces: `<Galeria imagenes: { src: ImageMetadata; alt: string }[]>`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `tests/e2e/experiencias.spec.ts`:

```ts
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
```

El cuarto test es el que atrapa el error clásico de i18n con rutas dinámicas: emitir `hreflang` apuntando a la home en vez de a la página equivalente.

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm run test:e2e -- experiencias --project=escritorio`
Expected: FAIL — 404 en `/experiencias`.

- [ ] **Step 3: Escribir la galería**

Crear `src/components/ui/Galeria.astro`:

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  imagenes: { src: ImageMetadata; alt: string }[];
}

const { imagenes } = Astro.props;
---

{
  imagenes.length > 0 && (
    <ul class="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
      {imagenes.map((img) => (
        <li>
          <Image
            src={img.src}
            alt={img.alt}
            widths={[400, 800]}
            sizes="(min-width: 768px) 33vw, 50vw"
            class="aspect-square w-full object-cover"
          />
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 4: Escribir el listado**

Crear `src/pages/experiencias/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Seccion from '../../components/ui/Seccion.astro';
import Kicker from '../../components/ui/Kicker.astro';
import TarjetaExperiencia from '../../components/ui/TarjetaExperiencia.astro';
import Reveal from '../../components/ui/Reveal.astro';
import { getCopy } from '../../lib/copy';
import { experienciasDe } from '../../lib/contenido';

const lang = 'es' as const;
const copy = getCopy(lang);

const todas = experienciasDe(
  (await getCollection('experiencias')).map((e) => ({ slug: e.id, ...e.data })),
  lang,
);

const proximas = todas.filter((e) => e.estado === 'proxima');
const pasadas = todas.filter((e) => e.estado === 'pasada');
---

<Base
  titulo={`${copy.experiencias.titulo} ${copy.experiencias.tituloEnfasis} · Dharma Fest`}
  descripcion={copy.experiencias.vacio}
  lang={lang}
  rutaCanonica="/experiencias"
>
  <Seccion class="pt-40">
    <Kicker>{copy.experiencias.kicker}</Kicker>
    <h1 class="mt-4 font-display text-hero text-bosque">
      {copy.experiencias.titulo} <em class="italic">{copy.experiencias.tituloEnfasis}</em>
    </h1>

    {
      proximas.length > 0 && (
        <div data-grupo="proximas" class="mt-16 grid gap-8 md:grid-cols-3">
          {proximas.map((e, i) => (
            <Reveal indice={i}><TarjetaExperiencia lang={lang} {...e} /></Reveal>
          ))}
        </div>
      )
    }

    {
      pasadas.length > 0 && (
        <div data-grupo="pasadas" class="mt-16 grid gap-8 md:grid-cols-3">
          {pasadas.map((e, i) => (
            <Reveal indice={i}><TarjetaExperiencia lang={lang} {...e} /></Reveal>
          ))}
        </div>
      )
    }

    {todas.length === 0 && <p class="mt-16 text-salvia">{copy.experiencias.vacio}</p>}
  </Seccion>
</Base>
```

Crear `src/pages/en/experiencias/index.astro` idéntico con `lang = 'en'` y las rutas de import con un nivel más (`../../../`).

- [ ] **Step 5: Escribir el detalle**

Crear `src/pages/experiencias/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import { Image } from 'astro:assets';
import Base from '../../layouts/Base.astro';
import Seccion from '../../components/ui/Seccion.astro';
import Kicker from '../../components/ui/Kicker.astro';
import Galeria from '../../components/ui/Galeria.astro';
import Boton from '../../components/ui/Boton.astro';
import { getCopy } from '../../lib/copy';

export async function getStaticPaths() {
  const todas = await getCollection('experiencias');

  return todas
    .filter((e) => e.data.lang === 'es')
    .map((entrada) => ({
      // El id es `es/nombre`; la URL lleva solo `nombre`.
      params: { slug: entrada.id.split('/').pop()! },
      props: { entrada },
    }));
}

const { entrada } = Astro.props;
const { Content } = await render(entrada);

const lang = 'es' as const;
const copy = getCopy(lang);
const d = entrada.data;
---

<Base
  titulo={`${d.titulo} · Dharma Fest`}
  descripcion={d.resumen}
  lang={lang}
  rutaCanonica={`/experiencias/${Astro.params.slug}`}
>
  <Seccion class="pt-40">
    <Kicker>
      {d.lugar} · {d.fecha.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}
    </Kicker>
    <h1 class="mt-4 font-display text-hero text-bosque">{d.titulo}</h1>

    <Image
      src={d.portada}
      alt={d.portadaAlt}
      widths={[800, 1400, 2000]}
      sizes="100vw"
      class="mt-12 aspect-[16/9] w-full object-cover"
    />

    <div class="prose-dharma mt-12 max-w-[60ch] text-salvia">
      <Content />
    </div>

    <Galeria imagenes={d.galeria} />

    {d.ctaUrl && <Boton href={d.ctaUrl} class="mt-12">{copy.hero.cta}</Boton>}
  </Seccion>
</Base>
```

Agregar a `src/styles/global.css` los estilos del cuerpo Markdown:

```css
.prose-dharma p + p { margin-top: 1.25rem; }
.prose-dharma a { color: var(--color-copal-ink); text-underline-offset: 4px; }
```

Crear `src/pages/en/experiencias/[slug].astro` con el mismo contenido, filtrando `e.data.lang === 'en'`, `lang = 'en'`, e imports con un nivel más.

`rutaCanonica` recibe la ruta con el slug, así que `alternates()` genera el `hreflang` apuntando a la experiencia equivalente en el otro idioma. Eso funciona porque los archivos de `es/` y `en/` usan el mismo nombre. **Si alguien renombra solo uno de los dos, el hreflang apunta a un 404** — el quinto test cubre el 404, pero no la desincronización; vale la pena revisarlo al agregar cada experiencia.

- [ ] **Step 6: Correr los tests y verificar que pasan**

Run: `npm run test:e2e -- experiencias`
Expected: PASS — 5 tests.

Si el test del 404 falla en `npm run dev`, es esperado: el servidor de desarrollo responde distinto que el build estático. Verificarlo contra el build:

```bash
npm run build && npx astro preview
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/experiencias src/pages/en/experiencias src/components/ui/Galeria.astro src/styles/global.css tests/e2e/experiencias.spec.ts
git commit -m "Agrega el listado y el detalle de experiencias

Agregar una experiencia es crear un Markdown en es/ y en en/ con el mismo
nombre de archivo; las rutas y el hreflang salen de ahi.

El listado separa proximas de pasadas y tiene estado vacio, para que la pagina
diga algo util si el cliente borra el contenido.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Páginas 2027, marcas, nosotros y 404

Las cuatro páginas de apoyo. Todas reutilizan secciones ya construidas, así que la tarea es composición, no código nuevo.

**Files:**
- Create: `src/pages/2027.astro`, `marcas.astro`, `nosotros.astro`, `404.astro`
- Create: `src/pages/en/2027.astro`, `en/marcas.astro`, `en/nosotros.astro`
- Create: `src/components/sections/FormularioMarcas.astro`
- Test: `tests/e2e/paginas.spec.ts`

**Interfaces:**
- Consumes: `Fest2027`, `Numeros2025`, `Marcas`, `CampoLago`, `Filosofia`, `Nosotros`, `Sumate` (Tasks 6-8).
- Produces: `<FormularioMarcas lang>` — ancla `#aplicar`.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `tests/e2e/paginas.spec.ts`:

```ts
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
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npm run test:e2e -- paginas --project=escritorio`
Expected: FAIL — 404 en `/2027`.

- [ ] **Step 3: Escribir el formulario de marcas**

Crear `src/components/sections/FormularioMarcas.astro`:

```astro
---
import Seccion from '../ui/Seccion.astro';
import Kicker from '../ui/Kicker.astro';
import TituloSeccion from '../ui/TituloSeccion.astro';
import { getCopy } from '../../lib/copy';
import type { Lang } from '../../lib/i18n';

interface Props { lang: Lang }

const { lang } = Astro.props;
const copy = getCopy(lang);
---

<Seccion id="aplicar" fondo="bosque">
  <Kicker tono="oscuro">{copy.marcas.kicker}</Kicker>
  <TituloSeccion texto={copy.marcas.cta} tono="oscuro" class="mt-4" />

  <p class="mt-6 max-w-[60ch] text-arena">
    {copy.marcas.cuerpoAplicar}
  </p>

  <a
    href="https://www.instagram.com/dharma_festcr/"
    rel="noopener"
    class="mt-8 inline-block bg-copal px-7 py-3 font-ui text-kicker uppercase tracking-[0.24em] text-bosque transition-colors hover:bg-copal-ink hover:text-lino"
  >
    {copy.marcas.ctaInstagram}
  </a>
</Seccion>
```

Agregar a ambos JSON de `sitio` las claves nuevas: `marcas.cuerpoAplicar` y `marcas.ctaInstagram`. El test de paridad de la Tarea 3 falla si se agregan en un solo idioma.

**Decisión deliberada:** esto no es un formulario, es un enlace a Instagram. Un formulario real necesita un backend que reciba y almacene los datos, y ese backend no existe todavía (misma razón que el de suscripción, spec §8). Mandar a las marcas a un formulario que se traga sus datos sería peor que mandarlas al canal donde el cliente ya responde. Cuando haya proveedor, esto se convierte en formulario reutilizando el patrón de `Sumate.astro`.

- [ ] **Step 4: Escribir las cuatro páginas**

Crear `src/pages/2027.astro`, componiendo secciones ya existentes:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import Fest2027 from '../components/sections/Fest2027.astro';
import Numeros2025 from '../components/sections/Numeros2025.astro';
import Marcas from '../components/sections/Marcas.astro';
import Sumate from '../components/sections/Sumate.astro';
import { getCopy } from '../lib/copy';
import { publicables } from '../lib/contenido';

const lang = 'es' as const;
const copy = getCopy(lang);

const marcas = publicables(
  (await getCollection('marcas')).map((m) => ({ id: m.id, ...m.data })),
);
---

<Base
  titulo={`${copy.fest2027.titulo} ${copy.fest2027.tituloEnfasis} · Dharma Fest`}
  descripcion={copy.fest2027.cuerpo}
  lang={lang}
  rutaCanonica="/2027"
>
  <Fest2027 lang={lang} />
  <Numeros2025 lang={lang} />
  <Marcas lang={lang} marcas={marcas} />
  <Sumate lang={lang} />
</Base>
```

`Fest2027` incluye un `h1`? No: en la home es `h2`. Para esta página, pasarle `nivel={1}` a su `TituloSeccion` mediante una prop nueva `nivelTitulo?: 1 | 2` con valor por defecto `2`. Agregar esa prop a `Fest2027.astro` y usar `nivelTitulo={1}` acá. Sin eso la página no tiene `h1` y el primer test falla.

Crear `src/pages/marcas.astro` con `<Marcas>` y `<FormularioMarcas>`, aplicando el mismo patrón de `nivelTitulo`.
Crear `src/pages/nosotros.astro` componiendo `<Filosofia>`, `<CampoLago>`, `<Nosotros>` y `<Sumate>`, con un encabezado propio que aporte el `h1`.
Crear `src/pages/404.astro` con `copy.error404` y un `<Boton href="/">`.

Duplicar las tres primeras en `src/pages/en/` con `lang = 'en'`, imports a `../../` y `href="/en/"` donde corresponda. El 404 de Astro es único para todo el sitio: dejarlo en español con el botón a `/`, y no crear `en/404.astro`.

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npm run build && npx astro preview` en una terminal, y en otra `npm run test:e2e -- paginas`
Expected: PASS — 11 tests.

El 404 solo responde con status 404 real en el build, no en `astro dev`.

- [ ] **Step 6: Commit**

```bash
git add src/pages src/components/sections/FormularioMarcas.astro src/content/sitio tests/e2e/paginas.spec.ts
git commit -m "Agrega las paginas 2027, marcas, nosotros y 404

Son composicion de secciones ya construidas; lo unico nuevo es la prop
nivelTitulo, para que cada pagina tenga su propio h1 sin duplicar componentes.

La seccion de aplicar enlaza a Instagram en vez de mostrar un formulario: no
hay backend que reciba los datos, y un formulario que se los traga seria peor
que mandar a las marcas al canal donde el cliente ya responde.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: SEO, accesibilidad, rendimiento y entrega

Cierra el proyecto: sitemap, auditoría automática de accesibilidad, presupuesto de peso y el README que el cliente y el siguiente desarrollador necesitan.

**Files:**
- Modify: `astro.config.mjs` (integración de sitemap)
- Create: `public/robots.txt`
- Create: `tests/e2e/accesibilidad.spec.ts`
- Create: `README.md`
- Modify: `package.json` (script `verificar`)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: `npm run verificar` — la puerta única que debe pasar antes de mostrarle el sitio al cliente.

- [ ] **Step 1: Escribir la auditoría de accesibilidad que falla**

```bash
npm install -D @astrojs/sitemap
```

Crear `tests/e2e/accesibilidad.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const rutas = ['/', '/experiencias', '/marcas', '/nosotros', '/2027', '/en/'];

for (const ruta of rutas) {
  test(`${ruta} no tiene violaciones críticas de accesibilidad`, async ({ page }) => {
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
```

El test falla si aparece cualquier violación grave, y el mensaje nombra la regla exacta. No bajar el umbral: arreglar la violación.

- [ ] **Step 2: Correr la auditoría y anotar lo que salga**

Run: `npm run build && npx astro preview` en una terminal, `npm run test:e2e -- accesibilidad` en otra.
Expected: FAIL — al menos por el sitemap, que todavía no existe. Anotar cualquier violación de axe que aparezca; se arreglan en el paso siguiente.

- [ ] **Step 3: Agregar sitemap y robots**

Modificar `astro.config.mjs` para incluir la integración:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dharmafest.cr',
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-CR', en: 'en' } },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
```

Crear `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://dharmafest.cr/sitemap-index.xml
```

Recordatorio: `site` y esta URL son provisionales hasta que el cliente confirme dominio (spec §13, pregunta 7).

- [ ] **Step 4: Arreglar las violaciones que reportó axe**

Corregir cada violación anotada en el Step 2. Las más probables, con su arreglo:

- `landmark-unique` — dos `<nav>` con la misma etiqueta accesible. Ocurre porque el menú de escritorio y el móvil comparten `aria-label`. Arreglo: en `Header.astro`, dar al móvil `aria-label={`${copy.a11y.navPrincipal} (móvil)`}`.
- `color-contrast` — algún texto acento sobre fondo claro se escapó de la regla. Arreglo: cambiar esa clase a `text-copal-ink`.
- `heading-order` — una página salta de `h1` a `h3`. Arreglo: ajustar la prop `nivel` del `TituloSeccion` correspondiente.
- `region` — contenido fuera de landmarks. Arreglo: verificar que todo cuelgue de `<main>`, `<header>` o `<footer>`.

- [ ] **Step 5: Correr la auditoría y verificar que pasa**

Run: `npm run test:e2e -- accesibilidad`
Expected: PASS — 7 tests.

- [ ] **Step 6: Medir el presupuesto de peso**

Run: `npm run build`

Luego, para ver el peso comprimido de lo que se sirve:

```bash
find dist -name "*.js" -exec gzip -c {} \; | wc -c
find dist -name "*.css" -exec gzip -c {} \; | wc -c
```

Expected: JS por debajo de 150 000 bytes y CSS por debajo de 100 000 bytes (restricción global).

Si el CSS se pasa, el sospechoso es Tailwind incluyendo utilidades sin usar: revisar que no haya clases construidas por concatenación de cadenas, que el escáner no puede ver. Si el JS se pasa, el sospechoso son las fuentes o algún import accidental de una librería en un `<script>` de componente.

- [ ] **Step 7: Escribir el README**

Crear `README.md`:

```markdown
# Sitio de Dharma Fest Costa Rica

Casa de marca de Dharma Fest. Sitio estático bilingüe hecho con Astro.

## Correr el proyecto

    npm install
    npm run placeholders   # genera las imágenes marcadoras
    npm run dev            # http://localhost:4321

## Verificar antes de mostrar

    npm run verificar

Corre el chequeo de tipos, los tests unitarios, el build y los tests
end-to-end, incluida la auditoría de accesibilidad.

## Cómo agregar una experiencia

1. Crear `src/content/experiencias/es/<nombre>.md` y
   `src/content/experiencias/en/<nombre>.md`. **Los dos archivos deben llamarse
   igual**, o el enlace entre idiomas apunta a una página que no existe.
2. Poner la portada en `src/assets/img/experiencias/<nombre>.jpg`.
3. Llenar el frontmatter. `portadaAlt` es obligatorio: sin él, el build falla.
4. `estado: proxima` la manda al inicio del listado; `pasada`, al archivo.

## Cómo cambiar textos

Todo el texto de las secciones fijas vive en `src/content/sitio/es.json` y
`en.json`. Los dos archivos deben tener exactamente las mismas claves; hay un
test que lo verifica.

## Estado del proyecto: lo que falta del cliente

Estas cosas están construidas pero apagadas, esperando material o permiso:

- **Fotos.** Todo lo que se ve son marcadores. La lista completa de lo que hace
  falta está en `public/img/MANIFEST.md`.
- **Correos.** El formulario funciona de punta a punta pero **no guarda nada**.
  Para conectarlo, escribir un `Proveedor` en `src/lib/subscribe.ts` y cambiar
  la constante `PROVEEDOR`. Ningún componente más se toca.
- **Testimonios y marcas.** Están en el repo con `"permiso": false`, así que sus
  secciones no se renderizan. Cambiar a `true` solo con autorización del cliente.
- **Fecha del 2027.** Sin fecha, el bloque va sin cuenta regresiva. Para
  activarla, pasarle `fechaObjetivo` a `<Fest2027>`.
- **Dominio.** `astro.config.mjs` y `public/robots.txt` usan
  `https://dharmafest.cr` como provisional.
- **Equipo.** La sección "Quiénes somos" no nombra a nadie porque no sabemos
  quién está detrás de la marca.

## Despliegue

No hay. Por decisión del cliente el proyecto es local; para mostrar avances se
abre un túnel temporal.
```

- [ ] **Step 8: Agregar el script de verificación**

Agregar a `package.json` en `scripts`:

```json
"verificar": "astro check && vitest run && astro build && playwright test"
```

- [ ] **Step 9: Correr la verificación completa**

Run: `npm run verificar`
Expected: PASS en las cuatro etapas. Anotar los totales reales de tests; los números citados en las tareas anteriores son estimaciones y pueden diferir.

- [ ] **Step 10: Commit**

```bash
git add astro.config.mjs public/robots.txt README.md package.json tests/e2e/accesibilidad.spec.ts
git commit -m "Agrega sitemap, auditoria de accesibilidad y README

npm run verificar es la puerta unica antes de mostrarle el sitio al cliente:
tipos, unitarios, build y end-to-end con axe.

El README lista explicitamente lo que esta construido pero apagado esperando
material o permiso del cliente, para que nadie lo confunda con trabajo pendiente.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Cobertura de la especificación

| Sección de la spec | Dónde se implementa |
|---|---|
| §5 Paleta y regla de contraste | Task 1 (tokens y tests), Task 4 (Kicker, Boton) |
| §5 Tipografía auto-hospedada | Task 1 Step 10 |
| §5 Movimiento y reduced-motion | Task 1 (global.css), Task 4 (Reveal), Task 6 (marquee) |
| §6 Home, 13 secciones | Tasks 6, 7, 8 |
| §6 Rutas y hreflang | Task 2, Task 5 (Base), Task 9, Task 10 |
| §7 Modelo de contenido | Task 3 |
| §8 Stack y estructura | Task 1, Task 4, Task 5 |
| §8 Adaptador de suscripción | Task 8 |
| §9 Accesibilidad | Task 5 (skip link, menú), Task 11 (axe) |
| §10 Rendimiento | Task 6 (LCP del hero), Task 11 (presupuesto) |
| §11 Verificación | Task 11 (`npm run verificar`) |
| §12 Riesgos abiertos | Task 3 (permisos), Task 7 (sin fecha), Task 8 (sin proveedor), Task 11 (README) |

## Lo que este plan deja fuera a propósito

- **Venta de entradas y cuentas de usuario.** No-objetivo de la spec §2.
- **CMS.** El contenido se edita en Markdown y JSON. Se puede agregar después sin refactor, porque las colecciones ya están tipadas.
- **Despliegue.** Decisión explícita del cliente.
- **Formulario real de marcas.** Task 10 Step 3 explica por qué es un enlace a Instagram mientras no haya backend.
- **Contador en vivo del 2027.** Task 7 Step 8 explica por qué se calcula en build.
