# Dharma Fest CR v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sitio bilingüe de Dharma Fest CR contra el material real del cliente: home para el público y `/patrocinios` para marcas, con la identidad extraída del deck de patrocinios 2027.

**Architecture:** Next.js App Router con un único segmento dinámico `[lang]`. Todo el contenido vive en archivos JSON validados con Zod y se carga por un único módulo (`lib/contenido.ts`), de modo que las secciones son componentes de presentación sin datos incrustados. Las dos capturas de formulario pasan por un solo punto de escritura (`lib/leads.ts`) para que cambiar de proveedor de correo sea cambiar un archivo. Las imágenes se extraen una vez del PDF a `public/img/` mediante un script versionado y reproducible.

**Tech Stack:** Next.js 16.3.4 · React 19.3 · TypeScript · Tailwind CSS 4 · next-intl 4.14 · Zod · Vitest 5 · Playwright 1.63 + @axe-core/playwright · Python 3 con PyMuPDF y Pillow (solo para el script de extracción, no es dependencia del sitio)

## Global Constraints

- **Nunca desplegar.** Ni Vercel, ni Netlify, ni ningún MCP de despliegue. Solo `npm run dev` local. Si hay que mostrarle algo al cliente, se abre un túnel temporal y se cierra.
- **Los precios de patrocinio no se renderizan.** Viven en `content/paquetes.json` pero ningún componente los imprime. Oficial US$7.000, Oro US$4.000, Plata US$2.000 (+IVA).
- **`lima` (`#C6D03F`) nunca se usa como texto sobre fondo claro.** Contraste 1.68:1 sobre blanco. Sobre `noche` (`#111211`) da 11.17:1.
- **`palido` es `#E4E8AD`**, lima al 79% de luz. No es un beige ni una crema neutra. No sustituir por `#F6F2E9` ni similar.
- **Tema oscuro fijo.** Sin conmutador, sin `prefers-color-scheme`.
- **Copy del deck literal.** Donde el spec §8 dice que el copy es del deck, se copia carácter por carácter, incluido el voseo ("comprá", "sumate"). El copy de relleno va marcado como borrador.
- **Español sin prefijo de ruta, inglés bajo `/en/`.** `localePrefix: "as-needed"`, `defaultLocale: "es"`.
- **`data/` está en `.gitignore`.** Contiene datos de personas. Nunca commitear su contenido.
- **Cada archivo tiene una responsabilidad.** Una sección de página = un archivo en `components/secciones/`.

---

## Estructura de archivos

```
scripts/extraer_imagenes.py       extracción única del PDF → public/img/ + manifiesto
app/layout.tsx                    html/body, fuentes, metadata raíz
app/[lang]/layout.tsx             provider de i18n, header, footer, skip link
app/[lang]/page.tsx               home
app/[lang]/patrocinios/page.tsx   página de marcas
app/[lang]/road-to-dharma/page.tsx
app/[lang]/2027/page.tsx
app/[lang]/nosotros/page.tsx
app/[lang]/gracias/page.tsx
app/[lang]/privacidad/page.tsx
app/[lang]/not-found.tsx
app/sitemap.ts  app/robots.ts

components/layout/                Header, Footer, SkipLink, SelectorIdioma
components/ui/                    Kicker, TituloDisplay, ReglaVertical, TarjetaFoto,
                                  Cifra, Seccion, FondoSelva, MuroLogos
components/secciones/             una por sección (Hero, Actividades, Temas, Galeria,
                                  Cifras, RoadToDharma, CampoLago, ImpactoSocial,
                                  MarcasQueConfian, Sumate, Paquetes, NuestroPublico,
                                  PlanDeMedios, LoQueViene, Mercadito)
components/formularios/           FormComunidad, FormPropuesta, CasillaConsentimiento

content/*.json                    datos (§7 del spec)
content/copy/es.json, en.json     cadenas de interfaz

lib/contenido.ts                  carga + valida los JSON con Zod
lib/esquemas.ts                   esquemas Zod
lib/leads.ts                      ÚNICO punto de escritura de capturas
lib/contraste.ts                  utilidad WCAG, usada por los tests
lib/acciones.ts                   Server Actions de los dos formularios
i18n/routing.ts, i18n/request.ts  next-intl
middleware.ts

app/globals.css                   tokens + @theme de Tailwind 4
```

---

### Task 1: Andamiaje del proyecto

Deja el proyecto arrancando en limpio: Next 16, TypeScript, Tailwind 4, Vitest y Playwright configurados, con un test de humo de cada tipo.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `vitest.config.ts`, `playwright.config.ts`
- Test: `tests/unit/humo.test.ts`, `tests/e2e/humo.spec.ts`

**Interfaces:**
- Consumes: nada, es la primera tarea.
- Produces: scripts `npm run dev` (puerto 3000), `npm test` (Vitest), `npm run test:e2e` (Playwright), `npm run build`, `npm run verificar` (encadena los tres).

- [ ] **Step 1: Crear el proyecto**

Desde la raíz del repo, que hoy solo tiene `.gitignore` y `docs/`:

```bash
npx --yes create-next-app@16.3.4 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm --skip-install --yes
npm install
```

Si `create-next-app` se queja de que el directorio no está vacío, es correcto: acepta continuar. No debe borrar `docs/` ni `.gitignore`.

- [ ] **Step 2: Instalar dependencias de prueba y de contenido**

```bash
npm install next-intl@4.14.2 zod
npm install -D vitest@5 @vitejs/plugin-react @playwright/test@1.63.0 @axe-core/playwright
npx playwright install chromium
```

- [ ] **Step 3: Configurar Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: Configurar Playwright**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Añadir los scripts a `package.json`**

En el bloque `"scripts"`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "verificar": "npm run test && npm run build && npm run test:e2e"
}
```

- [ ] **Step 6: Escribir los tests de humo**

`tests/unit/humo.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("andamiaje", () => {
  it("corre vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

`tests/e2e/humo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("el servidor responde", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBeLessThan(400);
});
```

- [ ] **Step 7: Correr ambos y verificar que pasan**

```bash
npm test
```
Esperado: `1 passed`.

```bash
npm run test:e2e
```
Esperado: `2 passed` (un proyecto de escritorio y uno móvil).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Levanta el andamiaje: Next 16, Tailwind 4, Vitest y Playwright"
```

---

### Task 2: Extracción de las imágenes del PDF

Un script reproducible que saca las 132 imágenes del deck, las redimensiona a tamaños web y escribe un manifiesto. Se corre una vez; su salida se commitea.

**Files:**
- Create: `scripts/extraer_imagenes.py`, `scripts/README.md`
- Create (salida): `public/img/**`, `content/manifiesto-imagenes.json`
- Test: `tests/unit/manifiesto.test.ts`

**Interfaces:**
- Consumes: nada del código; lee el PDF desde una ruta pasada por argumento.
- Produces: `content/manifiesto-imagenes.json`, un array de objetos
  `{ archivo: string; ancho: number; alto: number; pagina: number; grupo: string }`
  donde `grupo` es uno de `"fondo" | "foto" | "logo-marca" | "logo-asociacion" | "logo-dharma" | "otro"`.
  Las tareas 8 en adelante consumen este manifiesto.

- [ ] **Step 1: Escribir el script**

`scripts/extraer_imagenes.py`:

```python
"""Extrae las imagenes del deck de patrocinios a public/img/.

Uso:
    python scripts/extraer_imagenes.py "ruta/al/deck.pdf"

Requiere: pip install pymupdf pillow
Se corre una sola vez; la salida se commitea.
"""
import io
import json
import pathlib
import sys

import pymupdf
from PIL import Image

# Como se llama cada lamina del deck. Da el prefijo del nombre de archivo.
# El grupo NO sale de aqui: lo decide clasificar(), que mira el tamano real.
LAMINAS = {
    1: "portada",
    2: "quienes-somos",
    3: "por-que-dharma",
    4: "perfil-publico",
    5: "actividades",
    6: "temas",
    7: "galeria-1",
    8: "galeria-2",
    9: "galeria-3",
    10: "comunidad-cifras",
    11: "road-to-dharma",
    12: "espacios",
    13: "salones",
    14: "mercadito",
    15: "impacto-social",
    16: "plan-de-medios",
    17: "tier-oficial",
    18: "tier-oro",
    19: "tier-plata",
    20: "marcas",
    21: "contacto",
}

ANCHO_MAXIMO = 2000  # ninguna foto del sitio necesita mas
CALIDAD = 82


def clasificar(pagina: int, ancho: int, alto: int) -> str:
    """Un logo es una imagen pequena; una lamina de fondo es la textura repetida."""
    if ancho < 900:
        if pagina == 15:
            return "logo-asociacion"
        if pagina == 20:
            return "logo-marca"
        if pagina in (1, 13, 21):
            return "logo-dharma"
        return "otro"
    if ancho == 2400 and alto == 3600:
        return "fondo"
    return "foto"


def main() -> int:
    if len(sys.argv) < 2:
        print("Falta la ruta del PDF", file=sys.stderr)
        return 1

    pdf = pathlib.Path(sys.argv[1])
    salida = pathlib.Path("public/img")
    salida.mkdir(parents=True, exist_ok=True)

    doc = pymupdf.open(pdf)
    manifiesto = []
    vistos = set()
    contadores: dict[str, int] = {}

    for indice in range(doc.page_count):
        pagina = indice + 1
        nombre_lamina = LAMINAS.get(pagina, f"pagina-{pagina}")

        for imagen in doc[indice].get_images(full=True):
            xref = imagen[0]
            if xref in vistos:
                continue
            vistos.add(xref)

            crudo = doc.extract_image(xref)
            grupo = clasificar(pagina, crudo["width"], crudo["height"])

            # La textura de fondo se repite en seis laminas; basta con una copia.
            if grupo == "fondo" and any(m["grupo"] == "fondo" for m in manifiesto):
                continue

            contadores[nombre_lamina] = contadores.get(nombre_lamina, 0) + 1
            sufijo = contadores[nombre_lamina]
            base = f"{nombre_lamina}-{sufijo:02d}"

            img = Image.open(io.BytesIO(crudo["image"]))
            transparente = img.mode in ("RGBA", "LA", "P")

            if img.width > ANCHO_MAXIMO:
                alto_nuevo = round(img.height * ANCHO_MAXIMO / img.width)
                img = img.resize((ANCHO_MAXIMO, alto_nuevo), Image.LANCZOS)

            if transparente:
                archivo = f"{base}.png"
                img.convert("RGBA").save(salida / archivo, "PNG", optimize=True)
            else:
                archivo = f"{base}.jpg"
                img.convert("RGB").save(salida / archivo, "JPEG", quality=CALIDAD,
                                        optimize=True, progressive=True)

            manifiesto.append({
                "archivo": archivo,
                "ancho": img.width,
                "alto": img.height,
                "pagina": pagina,
                "grupo": grupo,
            })

    destino = pathlib.Path("content/manifiesto-imagenes.json")
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(manifiesto, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"{len(manifiesto)} imagenes en {salida}")
    for grupo in sorted({m["grupo"] for m in manifiesto}):
        print(f"  {grupo}: {sum(1 for m in manifiesto if m['grupo'] == grupo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Correrlo**

```bash
python -m pip install pymupdf pillow
python scripts/extraer_imagenes.py "C:/Users/jovag/Downloads/DHARMA Fest 2027-  Patrocinios Oficiales.pdf"
```

Esperado: alrededor de 127 imágenes (132 menos las cinco copias repetidas de la textura), con el desglose por grupo. Debe imprimir al menos `logo-marca: 61` y `logo-asociacion: 4`.

- [ ] **Step 3: Verificar el peso total**

```bash
du -sh public/img
```

Esperado: por debajo de 60 MB. Si se pasa, bajar `CALIDAD` a 78 y volver a correr. El PDF crudo pesa 185 MB; si la salida se le acerca, el redimensionado no corrió.

- [ ] **Step 4: Escribir el test del manifiesto**

`tests/unit/manifiesto.test.ts`:

```ts
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifiesto from "@/content/manifiesto-imagenes.json";

describe("manifiesto de imágenes", () => {
  it("tiene los logos de las marcas aliadas", () => {
    const marcas = manifiesto.filter((m) => m.grupo === "logo-marca");
    expect(marcas.length).toBeGreaterThanOrEqual(60);
  });

  it("tiene los cuatro logos de asociaciones", () => {
    const asociaciones = manifiesto.filter((m) => m.grupo === "logo-asociacion");
    expect(asociaciones).toHaveLength(4);
  });

  it("guarda una sola copia de la textura de fondo", () => {
    expect(manifiesto.filter((m) => m.grupo === "fondo")).toHaveLength(1);
  });

  it("cada entrada apunta a un archivo que existe", () => {
    for (const entrada of manifiesto) {
      const ruta = path.join(process.cwd(), "public/img", entrada.archivo);
      expect(existsSync(ruta), `falta ${entrada.archivo}`).toBe(true);
    }
  });

  it("ninguna imagen supera los 2000px de ancho", () => {
    for (const entrada of manifiesto) {
      expect(entrada.ancho).toBeLessThanOrEqual(2000);
    }
  });
});
```

- [ ] **Step 5: Correr el test**

```bash
npm test -- manifiesto
```
Esperado: 5 passed.

- [ ] **Step 6: Escribir `scripts/README.md`**

```markdown
# Scripts

## `extraer_imagenes.py`

Saca las imágenes del deck de patrocinios del cliente, las redimensiona a un máximo
de 2000px de ancho y escribe `content/manifiesto-imagenes.json`.

Se corre **una sola vez**; la salida está commiteada. Solo hace falta volver a
correrlo si el cliente entrega un deck nuevo.

    python -m pip install pymupdf pillow
    python scripts/extraer_imagenes.py "ruta/al/deck.pdf"

El PDF **no** está en el repositorio: pesa 185 MB y es material del cliente.
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Extrae las imagenes del deck del cliente al sitio"
```

---

### Task 3: Tokens de color y capa tipográfica

La paleta del deck como custom properties y como tema de Tailwind 4, con las fuentes cargadas y un test que impide que alguien rompa el contraste.

**Files:**
- Create: `lib/contraste.ts`
- Modify: `app/globals.css`, `app/layout.tsx`
- Test: `tests/unit/contraste.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `lib/contraste.ts` exporta `luminancia(hex: string): number` y `ratio(a: string, b: string): number`.
  - Tokens CSS: `--color-noche`, `--color-lima`, `--color-lima-humo`, `--color-lima-hondo`, `--color-palido`, `--color-hueso`, `--color-oro`. En Tailwind quedan como `bg-noche`, `text-lima`, etc.
  - Variables de fuente: `--font-display` (Bodoni Moda), `--font-texto` (Archivo). En Tailwind: `font-display`, `font-texto`.

- [ ] **Step 1: Escribir el test de contraste primero**

`tests/unit/contraste.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ratio } from "@/lib/contraste";

const NOCHE = "#111211";
const LIMA = "#C6D03F";
const PALIDO = "#E4E8AD";
const HUESO = "#FFFFFF";
const ORO = "#B59F15";
const LIMA_HUMO = "#98A138";
const LIMA_HONDO = "#80872D";

describe("contraste de la paleta", () => {
  it("todo tono de la rampa pasa AA como texto sobre noche", () => {
    for (const tono of [LIMA, PALIDO, HUESO, ORO, LIMA_HUMO, LIMA_HONDO]) {
      expect(ratio(tono, NOCHE), `${tono} sobre noche`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("el lima sobre blanco falla, y por eso no se usa así", () => {
    expect(ratio(LIMA, HUESO)).toBeLessThan(3);
  });

  it("calcula el ratio conocido de lima sobre noche", () => {
    expect(ratio(LIMA, NOCHE)).toBeCloseTo(11.17, 1);
  });

  it("es simétrico", () => {
    expect(ratio(LIMA, NOCHE)).toBeCloseTo(ratio(NOCHE, LIMA), 5);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npm test -- contraste
```
Esperado: FAIL, `Failed to resolve import "@/lib/contraste"`.

- [ ] **Step 3: Escribir `lib/contraste.ts`**

```ts
/** Utilidades WCAG 2.1 para verificar la paleta. Solo se usan en tests. */

function canal(valor: number): number {
  return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const limpio = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(limpio)) {
    throw new Error(`Hex inválido: ${hex}`);
  }
  const [r, g, b] = [0, 2, 4].map((i) =>
    canal(Number.parseInt(limpio.slice(i, i + 2), 16) / 255),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratio(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const alto = Math.max(la, lb);
  const bajo = Math.min(la, lb);
  return (alto + 0.05) / (bajo + 0.05);
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test -- contraste
```
Esperado: 4 passed.

- [ ] **Step 5: Escribir los tokens en `app/globals.css`**

Reemplazar el contenido completo del archivo:

```css
@import "tailwindcss";

@theme {
  /* Rampa de marca. Todo vive en el tono 64-65deg; cambia solo la luminosidad.
     Muestreada pixel a pixel del deck de patrocinios del cliente. */
  --color-noche: #111211;
  --color-lima: #c6d03f;
  --color-lima-humo: #98a138;
  --color-lima-hondo: #80872d;
  --color-palido: #e4e8ad;
  --color-hueso: #ffffff;
  /* Unico color fuera de la rampa. Solo el paquete Oro. */
  --color-oro: #b59f15;

  --font-display: var(--fuente-bodoni), Georgia, "Times New Roman", serif;
  --font-texto: var(--fuente-archivo), ui-sans-serif, system-ui, sans-serif;
}

:root {
  color-scheme: dark;
}

body {
  background-color: var(--color-noche);
  color: var(--color-hueso);
  font-family: var(--font-texto);
  -webkit-font-smoothing: antialiased;
}

/* El foco se ve siempre, y se ve en lima. */
:focus-visible {
  outline: 3px solid var(--color-lima);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Cargar las fuentes en `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--fuente-bodoni",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--fuente-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dharma Fest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bodoni.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Verificar que compila**

```bash
npm run build
```
Esperado: build exitoso, sin errores de TypeScript.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Fija la paleta del deck como tokens y blinda el contraste con tests"
```

---

### Task 4: Ruteo bilingüe

next-intl con español sin prefijo e inglés bajo `/en/`, más el selector de idioma.

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `middleware.ts`, `content/copy/es.json`, `content/copy/en.json`, `components/layout/SelectorIdioma.tsx`
- Create: `app/[lang]/layout.tsx`, `app/[lang]/page.tsx`
- Delete: `app/page.tsx` (la home de Task 1 se reemplaza por la versión con idioma)
- Test: `tests/unit/copy.test.ts`, `tests/e2e/idioma.spec.ts`

**Interfaces:**
- Consumes: los tokens de Task 3.
- Produces:
  - `i18n/routing.ts` exporta `routing` con `locales: ["es", "en"]`, `defaultLocale: "es"`, `localePrefix: "as-needed"`.
  - `content/copy/{es,en}.json`: mismo conjunto de claves en ambos. Las secciones leen de aquí vía `useTranslations` / `getTranslations`.
  - `components/layout/SelectorIdioma.tsx`: componente cliente que cambia de idioma conservando la ruta.

- [ ] **Step 1: Escribir primero el test que exige simetría entre idiomas**

`tests/unit/copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import en from "@/content/copy/en.json";
import es from "@/content/copy/es.json";

function claves(objeto: unknown, prefijo = ""): string[] {
  if (typeof objeto !== "object" || objeto === null) return [prefijo];
  return Object.entries(objeto).flatMap(([clave, valor]) =>
    claves(valor, prefijo ? `${prefijo}.${clave}` : clave),
  );
}

describe("diccionarios de copy", () => {
  it("español e inglés tienen exactamente las mismas claves", () => {
    expect(claves(en).sort()).toEqual(claves(es).sort());
  });

  it("ninguna cadena está vacía", () => {
    for (const [nombre, dicc] of [["es", es], ["en", en]] as const) {
      const vacias = claves(dicc).filter((ruta) => {
        const valor = ruta.split(".").reduce<any>((o, k) => o?.[k], dicc);
        return typeof valor === "string" && valor.trim() === "";
      });
      expect(vacias, `cadenas vacías en ${nombre}`).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm test -- copy
```
Esperado: FAIL, no resuelve `@/content/copy/es.json`.

- [ ] **Step 3: Crear los diccionarios iniciales**

`content/copy/es.json`:

```json
{
  "nav": {
    "inicio": "Inicio",
    "festival": "Dharma Fest 2027",
    "road": "Road to Dharma",
    "patrocinios": "Patrocinios",
    "nosotros": "Nosotros",
    "saltarAlContenido": "Saltar al contenido",
    "abrirMenu": "Abrir el menú",
    "cerrarMenu": "Cerrar el menú",
    "cambiarIdioma": "Cambiar idioma"
  },
  "pie": {
    "derechos": "Dharma Fest Costa Rica",
    "privacidad": "Privacidad",
    "contacto": "Contacto"
  }
}
```

`content/copy/en.json`:

```json
{
  "nav": {
    "inicio": "Home",
    "festival": "Dharma Fest 2027",
    "road": "Road to Dharma",
    "patrocinios": "Sponsorship",
    "nosotros": "About",
    "saltarAlContenido": "Skip to content",
    "abrirMenu": "Open menu",
    "cerrarMenu": "Close menu",
    "cambiarIdioma": "Change language"
  },
  "pie": {
    "derechos": "Dharma Fest Costa Rica",
    "privacidad": "Privacy",
    "contacto": "Contact"
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test -- copy
```
Esperado: 2 passed.

- [ ] **Step 5: Configurar next-intl**

`i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
});

export type Idioma = (typeof routing.locales)[number];
```

`i18n/request.ts`:

```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const solicitado = await requestLocale;
  const locale = hasLocale(routing.locales, solicitado)
    ? solicitado
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`@/content/copy/${locale}.json`)).default,
  };
});
```

`middleware.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|img|.*\\..*).*)",
};
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
```

- [ ] **Step 6: Mover la home al segmento de idioma**

Borrar `app/page.tsx`. Crear `app/[lang]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export default async function LayoutIdioma({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) notFound();
  setRequestLocale(lang);

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
```

`app/[lang]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("nav");
  return (
    <main id="contenido">
      <h1 className="font-display text-6xl text-lima">Dharma Fest</h1>
      <p>{t("inicio")}</p>
    </main>
  );
}
```

Actualizar `app/layout.tsx` para que el `lang` del `<html>` no quede fijo en `es`: quitar el atributo del layout raíz y ponerlo en el layout de idioma no es posible con App Router, así que el layout raíz pasa a leerlo de los params. Reemplazar su firma por:

```tsx
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang?: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang ?? "es"} className={`${bodoni.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Escribir el selector de idioma**

`components/layout/SelectorIdioma.tsx`:

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

export function SelectorIdioma() {
  const idioma = useLocale();
  const ruta = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  function rutaEn(destino: string): string {
    // Quita el prefijo de idioma actual y pone el nuevo. El español no lleva prefijo.
    const sinPrefijo = ruta.replace(/^\/(es|en)(?=\/|$)/, "") || "/";
    return destino === routing.defaultLocale ? sinPrefijo : `/${destino}${sinPrefijo === "/" ? "" : sinPrefijo}`;
  }

  return (
    <nav aria-label={t("cambiarIdioma")} className="flex gap-2 font-texto text-sm">
      {routing.locales.map((codigo) => (
        <button
          key={codigo}
          type="button"
          lang={codigo}
          aria-current={codigo === idioma ? "true" : undefined}
          onClick={() => router.push(rutaEn(codigo))}
          className={
            codigo === idioma
              ? "text-lima underline underline-offset-4"
              : "text-hueso/70 hover:text-hueso"
          }
        >
          {codigo.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 8: Escribir el test e2e del ruteo**

`tests/e2e/idioma.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("el español vive en la raíz, sin prefijo", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("el inglés vive bajo /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("una ruta de idioma inexistente da 404", async ({ page }) => {
  const respuesta = await page.goto("/fr");
  expect(respuesta?.status()).toBe(404);
});
```

- [ ] **Step 9: Correr los tests**

```bash
npm test && npm run test:e2e -- idioma
```
Esperado: unitarios en verde; los tres e2e pasan en ambos proyectos (6 passed).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Agrega el ruteo bilingue con espanol en la raiz"
```

---

### Task 5: Modelo de contenido

Los archivos de datos del spec §7 con validación Zod, para que un JSON mal escrito falle en el build y no en producción.

**Files:**
- Create: `lib/esquemas.ts`, `lib/contenido.ts`
- Create: `content/cifras.json`, `content/actividades.json`, `content/temas.json`, `content/paquetes.json`, `content/marcas.json`, `content/asociaciones.json`, `content/espacios.json`, `content/medios.json`
- Test: `tests/unit/contenido.test.ts`

**Interfaces:**
- Consumes: `content/manifiesto-imagenes.json` de Task 2.
- Produces: `lib/contenido.ts` exporta funciones sincrónicas que devuelven datos ya validados:
  `getCifras()`, `getActividades()`, `getTemas()`, `getPaquetes()`, `getMarcas()`, `getAsociaciones()`, `getEspacios()`, `getMedios()`.
  Cada una lanza si el JSON no valida. Los tipos se infieren de los esquemas Zod y se exportan como
  `Cifras`, `Actividad`, `Tema`, `Paquete`, `Marca`, `Asociacion`, `Espacio`, `Medio`.

- [ ] **Step 1: Escribir el test primero**

`tests/unit/contenido.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getActividades,
  getAsociaciones,
  getCifras,
  getEspacios,
  getMarcas,
  getPaquetes,
  getTemas,
} from "@/lib/contenido";

describe("contenido", () => {
  it("las cifras son las del deck", () => {
    const cifras = getCifras();
    expect(cifras.personas).toBe(4000);
    expect(cifras.experienciasAnuales).toBe(8);
    expect(cifras.crecimiento).toBe(67);
    expect(cifras.baseDeDatos).toBe(26000);
    expect(cifras.genero.mujeres).toBeCloseTo(68.2, 1);
    expect(cifras.genero.hombres).toBeCloseTo(31.8, 1);
  });

  it("los porcentajes de género suman 100", () => {
    const { mujeres, hombres } = getCifras().genero;
    expect(mujeres + hombres).toBeCloseTo(100, 1);
  });

  it("las edades vienen ordenadas de mayor a menor", () => {
    const edades = getCifras().edades;
    const porcentajes = edades.map((e) => e.porcentaje);
    expect([...porcentajes].sort((a, b) => b - a)).toEqual(porcentajes);
  });

  it("hay cinco actividades y ocho temas", () => {
    expect(getActividades()).toHaveLength(5);
    expect(getTemas()).toHaveLength(8);
  });

  it("hay tres paquetes con sus tres grupos de beneficios", () => {
    const paquetes = getPaquetes();
    expect(paquetes).toHaveLength(3);
    for (const paquete of paquetes) {
      expect(paquete.presencia.length).toBeGreaterThan(0);
      expect(paquete.visibilidad.length).toBeGreaterThan(0);
      expect(paquete.captacion.length).toBeGreaterThan(0);
    }
  });

  it("los paquetes guardan el precio aunque no se muestre", () => {
    const porSlug = Object.fromEntries(getPaquetes().map((p) => [p.slug, p]));
    expect(porSlug.oficial.inversionUSD).toBe(7000);
    expect(porSlug.oro.inversionUSD).toBe(4000);
    expect(porSlug.plata.inversionUSD).toBe(2000);
  });

  it("cada marca apunta a un logo del manifiesto", () => {
    const marcas = getMarcas();
    expect(marcas.length).toBeGreaterThanOrEqual(60);
    for (const marca of marcas) {
      expect(marca.logo).toMatch(/^marcas-\d+\.(png|jpg)$/);
    }
  });

  it("hay cuatro asociaciones aliadas y tres salones", () => {
    expect(getAsociaciones()).toHaveLength(4);
    expect(getEspacios()).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm test -- contenido
```
Esperado: FAIL, no resuelve `@/lib/contenido`.

- [ ] **Step 3: Escribir los esquemas**

`lib/esquemas.ts`:

```ts
import { z } from "zod";

const textoBilingue = z.object({ es: z.string().min(1), en: z.string().min(1) });

export const esquemaCifras = z.object({
  personas: z.number().int().positive(),
  experienciasAnuales: z.number().int().positive(),
  crecimiento: z.number().positive(),
  baseDeDatos: z.number().int().positive(),
  profesionales: z.number().int().positive(),
  genero: z.object({ mujeres: z.number(), hombres: z.number() }),
  edades: z.array(z.object({ rango: z.string(), porcentaje: z.number() })).min(1),
  alcanceOrganico: z.array(z.number()).min(1),
});

export const esquemaActividad = z.object({
  slug: z.string(),
  nombre: textoBilingue,
  imagen: z.string(),
});

export const esquemaTema = z.object({
  slug: z.string(),
  nombre: textoBilingue,
  imagen: z.string(),
});

export const esquemaPaquete = z.object({
  slug: z.enum(["oficial", "oro", "plata"]),
  nombre: z.string(),
  lema: textoBilingue,
  /** Se guarda para tenerlo a mano. NO se renderiza. Ver Global Constraints. */
  inversionUSD: z.number().int().positive(),
  presencia: z.array(textoBilingue).min(1),
  visibilidad: z.array(textoBilingue).min(1),
  captacion: z.array(textoBilingue).min(1),
});

export const esquemaMarca = z.object({ nombre: z.string(), logo: z.string() });

export const esquemaAsociacion = z.object({ nombre: z.string(), logo: z.string() });

export const esquemaEspacio = z.object({
  slug: z.string(),
  nombre: z.string(),
  imagen: z.string(),
});

export const esquemaMedio = textoBilingue;

export type Cifras = z.infer<typeof esquemaCifras>;
export type Actividad = z.infer<typeof esquemaActividad>;
export type Tema = z.infer<typeof esquemaTema>;
export type Paquete = z.infer<typeof esquemaPaquete>;
export type Marca = z.infer<typeof esquemaMarca>;
export type Asociacion = z.infer<typeof esquemaAsociacion>;
export type Espacio = z.infer<typeof esquemaEspacio>;
export type Medio = z.infer<typeof esquemaMedio>;
```

- [ ] **Step 4: Escribir el cargador**

`lib/contenido.ts`:

```ts
import { z } from "zod";
import actividades from "@/content/actividades.json";
import asociaciones from "@/content/asociaciones.json";
import cifras from "@/content/cifras.json";
import espacios from "@/content/espacios.json";
import marcas from "@/content/marcas.json";
import medios from "@/content/medios.json";
import paquetes from "@/content/paquetes.json";
import temas from "@/content/temas.json";
import {
  esquemaActividad,
  esquemaAsociacion,
  esquemaCifras,
  esquemaEspacio,
  esquemaMarca,
  esquemaMedio,
  esquemaPaquete,
  esquemaTema,
} from "./esquemas";

/** Valida y da un error que dice qué archivo está mal, no solo qué campo. */
function validar<T>(esquema: z.ZodType<T>, datos: unknown, archivo: string): T {
  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new Error(`content/${archivo} no valida:\n${z.prettifyError(resultado.error)}`);
  }
  return resultado.data;
}

export const getCifras = () => validar(esquemaCifras, cifras, "cifras.json");
export const getActividades = () =>
  validar(z.array(esquemaActividad).length(5), actividades, "actividades.json");
export const getTemas = () => validar(z.array(esquemaTema).length(8), temas, "temas.json");
export const getPaquetes = () =>
  validar(z.array(esquemaPaquete).length(3), paquetes, "paquetes.json");
export const getMarcas = () => validar(z.array(esquemaMarca).min(60), marcas, "marcas.json");
export const getAsociaciones = () =>
  validar(z.array(esquemaAsociacion).length(4), asociaciones, "asociaciones.json");
export const getEspacios = () =>
  validar(z.array(esquemaEspacio).length(3), espacios, "espacios.json");
export const getMedios = () => validar(z.array(esquemaMedio).min(1), medios, "medios.json");

export type * from "./esquemas";
```

- [ ] **Step 5: Escribir los archivos de datos**

`content/cifras.json` — todas las cifras salen del deck, láminas 6 y 10:

```json
{
  "personas": 4000,
  "experienciasAnuales": 8,
  "crecimiento": 67,
  "baseDeDatos": 26000,
  "profesionales": 100,
  "genero": { "mujeres": 68.2, "hombres": 31.8 },
  "edades": [
    { "rango": "25-34", "porcentaje": 43.1 },
    { "rango": "35-44", "porcentaje": 30.7 },
    { "rango": "18-24", "porcentaje": 11.0 },
    { "rango": "45-54", "porcentaje": 10.9 }
  ],
  "alcanceOrganico": [20000, 18000, 11000, 6200]
}
```

`content/actividades.json` — lámina 5. La imagen de cada una sale del manifiesto (`actividades-NN.jpg`); confirmar los nombres reales tras correr Task 2 y ajustar:

```json
[
  { "slug": "movimiento-corporal", "nombre": { "es": "Movimiento Corporal", "en": "Body Movement" }, "imagen": "actividades-02.jpg" },
  { "slug": "entretenimiento", "nombre": { "es": "Entretenimiento", "en": "Entertainment" }, "imagen": "actividades-03.jpg" },
  { "slug": "talleres-y-conferencias", "nombre": { "es": "Talleres y Conferencias", "en": "Workshops & Talks" }, "imagen": "actividades-04.jpg" },
  { "slug": "gastronomia-funcional", "nombre": { "es": "Gastronomía Funcional", "en": "Functional Food" }, "imagen": "actividades-05.jpg" },
  { "slug": "mercadito-prosalud", "nombre": { "es": "Mercadito ProSalud", "en": "ProSalud Market" }, "imagen": "actividades-06.jpg" }
]
```

`content/temas.json` — lámina 6:

```json
[
  { "slug": "salud-mental", "nombre": { "es": "Salud Mental", "en": "Mental Health" }, "imagen": "temas-02.jpg" },
  { "slug": "higiene-del-sueno", "nombre": { "es": "Higiene del sueño", "en": "Sleep Hygiene" }, "imagen": "temas-03.jpg" },
  { "slug": "amor-propio", "nombre": { "es": "Amor propio", "en": "Self-Love" }, "imagen": "temas-04.jpg" },
  { "slug": "medio-ambiente", "nombre": { "es": "Medio Ambiente", "en": "Environment" }, "imagen": "temas-05.jpg" },
  { "slug": "yoga", "nombre": { "es": "Yoga", "en": "Yoga" }, "imagen": "temas-06.jpg" },
  { "slug": "pilates", "nombre": { "es": "Pilates", "en": "Pilates" }, "imagen": "temas-07.jpg" },
  { "slug": "zumba", "nombre": { "es": "Zumba", "en": "Zumba" }, "imagen": "temas-08.jpg" },
  { "slug": "terapia-de-sonido", "nombre": { "es": "Terapia de Sonido & Breathwork", "en": "Sound Therapy & Breathwork" }, "imagen": "temas-09.jpg" }
]
```

`content/paquetes.json` — láminas 17, 18 y 19, literal:

```json
[
  {
    "slug": "oficial",
    "nombre": "Oficial",
    "lema": { "es": "Tu marca en la comunidad, todo el año", "en": "Your brand in the community, all year long" },
    "inversionUSD": 7000,
    "presencia": [
      { "es": "Zona exclusiva con stand 8x8 en ubicación principal", "en": "Exclusive area with an 8x8 stand in a prime location" },
      { "es": "Cortesías: 10 Experiencia + 20 regulares", "en": "Courtesy passes: 10 Experience + 20 regular" },
      { "es": "Logo en backdrop oficial, pantallas y material impreso", "en": "Logo on the official backdrop, screens and printed material" },
      { "es": "Presencia en 2 ediciones de Road to Dharma, una co-creada con tu marca", "en": "Presence at 2 Road to Dharma editions, one co-created with your brand" }
    ],
    "visibilidad": [
      { "es": "Exclusividad de categoría", "en": "Category exclusivity" },
      { "es": "Gira de medios y campaña con influenciadores", "en": "Media tour and influencer campaign" },
      { "es": "Presencia en toda la comunicación del evento", "en": "Presence across all event communications" },
      { "es": "Activaciones BTL y pauta digital segmentada", "en": "BTL activations and targeted digital advertising" }
    ],
    "captacion": [
      { "es": "Registro digital en festival y en ambos Road to Dharma", "en": "Digital sign-up at the festival and both Road to Dharma editions" },
      { "es": "Reporte consolidado de leads del año", "en": "Consolidated annual lead report" },
      { "es": "Contenido audiovisual exclusivo de todas tus activaciones", "en": "Exclusive video content of all your activations" },
      { "es": "Video POST Dharma Fest exclusivo de la marca", "en": "Brand-exclusive post-festival video" }
    ]
  },
  {
    "slug": "oro",
    "nombre": "Oro",
    "lema": { "es": "El festival, más presencia continua", "en": "The festival, plus year-round presence" },
    "inversionUSD": 4000,
    "presencia": [
      { "es": "Stand 6x6 en zona de alto tránsito", "en": "6x6 stand in a high-traffic area" },
      { "es": "Cortesías: 5 Experiencia + 15 regulares", "en": "Courtesy passes: 5 Experience + 15 regular" },
      { "es": "Logo en backdrop oficial y en pantalla durante charlas", "en": "Logo on the official backdrop and on screen during talks" },
      { "es": "Presencia de marca en 1 edición de Road to Dharma", "en": "Brand presence at 1 Road to Dharma edition" }
    ],
    "visibilidad": [
      { "es": "Gira de medios y campaña con influenciadores", "en": "Media tour and influencer campaign" },
      { "es": "Una publicación (post y story) en redes de Dharma y Campo Lago", "en": "One post and story on the Dharma and Campo Lago channels" },
      { "es": "Presencia en activaciones BTL", "en": "Presence at BTL activations" },
      { "es": "Contenido audiovisual de tu activación", "en": "Video content of your activation" }
    ],
    "captacion": [
      { "es": "Reporte de leads de ambos momentos", "en": "Lead report from both moments" },
      { "es": "Video POST Dharma Fest con mención de marca", "en": "Post-festival video with a brand mention" }
    ]
  },
  {
    "slug": "plata",
    "nombre": "Plata",
    "lema": { "es": "2 días de presencia", "en": "Two full days of presence" },
    "inversionUSD": 2000,
    "presencia": [
      { "es": "Stand 3x3 con mesa y 2 sillas, ambos días", "en": "3x3 stand with a table and 2 chairs, both days" },
      { "es": "Cortesías: 10 entradas regulares", "en": "Courtesy passes: 10 regular tickets" },
      { "es": "Logo en material oficial del evento", "en": "Logo on official event material" }
    ],
    "visibilidad": [
      { "es": "Una publicación (post y story) en redes de Campo Lago y Dharma en colaboración con la marca", "en": "One collaborative post and story on the Campo Lago and Dharma channels" },
      { "es": "Mención en comunicaciones oficiales y actividades del evento", "en": "Mention in official communications and event activities" },
      { "es": "Invitación preferente a los Road to Dharma", "en": "Priority invitation to Road to Dharma editions" }
    ],
    "captacion": [
      { "es": "Registro digital de contactos en tu stand", "en": "Digital contact capture at your stand" },
      { "es": "Reporte de leads al cierre del evento", "en": "Lead report at the close of the event" }
    ]
  }
]
```

`content/asociaciones.json` — lámina 15:

```json
[
  { "nombre": "Guiare", "logo": "impacto-social-01.png" },
  { "nombre": "Transformación en Tiempos Violentos", "logo": "impacto-social-02.png" },
  { "nombre": "Green Wolf Costa Rica", "logo": "impacto-social-03.png" },
  { "nombre": "Mar y Cielo", "logo": "impacto-social-04.png" }
]
```

`content/espacios.json` — lámina 13:

```json
[
  { "slug": "la-casita", "nombre": "Salón La Casita", "imagen": "salones-01.jpg" },
  { "slug": "terraza-360", "nombre": "Salón Terraza 360", "imagen": "salones-02.jpg" },
  { "slug": "higueron", "nombre": "Salón Higuerón", "imagen": "salones-03.jpg" }
]
```

`content/medios.json` — lámina 16, literal:

```json
[
  { "es": "Campaña en Instagram, Facebook y TikTok", "en": "Instagram, Facebook and TikTok campaign" },
  { "es": "Gira de medios: TV, radio y prensa", "en": "Media tour: TV, radio and press" },
  { "es": "Pauta digital segmentada", "en": "Targeted digital advertising" },
  { "es": "Base de datos propia de 26,000 personas", "en": "In-house database of 26,000 people" },
  { "es": "Difusión a través de artistas y facilitadores participantes", "en": "Reach through participating artists and facilitators" },
  { "es": "Activaciones BTL en centros comerciales aliados", "en": "BTL activations in partner shopping centres" }
]
```

`content/marcas.json` — las ~61 marcas de la lámina 20. Los nombres se leen de los logos ya extraídos; el orden es el del deck, de izquierda a derecha y de arriba abajo. Empezar por:

```json
[
  { "nombre": "Sesderma", "logo": "marcas-01.png" },
  { "nombre": "Everlast", "logo": "marcas-02.png" },
  { "nombre": "FuXion", "logo": "marcas-03.png" },
  { "nombre": "Zumba", "logo": "marcas-04.png" },
  { "nombre": "Nikkos", "logo": "marcas-05.png" },
  { "nombre": "Dr. Brown's", "logo": "marcas-06.png" },
  { "nombre": "Matcha-la", "logo": "marcas-07.png" },
  { "nombre": "So-Fit", "logo": "marcas-08.png" },
  { "nombre": "Nipskin", "logo": "marcas-09.png" }
]
```

Completar las restantes leyendo `public/img/marcas-*.png` una por una. Si un logo resulta ilegible, poner el nombre en blanco **no** es opción: el `alt` de un logo es su nombre. Dejarlo fuera del JSON y anotarlo en el commit para preguntarle al cliente.

- [ ] **Step 6: Correr el test**

```bash
npm test -- contenido
```
Esperado: 8 passed. Si falla por nombres de imagen, ajustar los JSON a lo que realmente produjo Task 2.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Agrega el modelo de contenido con los datos del deck validados"
```

---

### Task 6: Primitivas de interfaz

Los ladrillos visuales que el deck repite. Sin ellos cada sección reinventaría el mismo degradado.

**Files:**
- Create: `components/ui/Seccion.tsx`, `components/ui/Kicker.tsx`, `components/ui/TituloDisplay.tsx`, `components/ui/ReglaVertical.tsx`, `components/ui/TarjetaFoto.tsx`, `components/ui/Cifra.tsx`, `components/ui/FondoSelva.tsx`, `components/ui/MuroLogos.tsx`
- Test: `tests/e2e/primitivas.spec.ts`, `app/[lang]/laboratorio/page.tsx` (página de prueba, se borra en Task 13)

**Interfaces:**
- Consumes: tokens de Task 3, `content/manifiesto-imagenes.json` de Task 2.
- Produces:
  - `<Seccion id? className? children>` — envoltura con el ritmo vertical estándar.
  - `<Kicker>texto</Kicker>` — etiqueta pequeña, arriba a la izquierda.
  - `<TituloDisplay como="h1"|"h2" italica?>` — el display didone. `italica` envuelve en `<em>`.
  - `<ReglaVertical />` — la línea fina que separa titular de cuerpo.
  - `<TarjetaFoto src alt etiqueta prioridad?>` — foto con esquina redondeada, degradado al pie y etiqueta.
  - `<Cifra valor sufijo? prefijo? rotulo />` — el número grande en caja de contorno lima.
  - `<FondoSelva />` — la textura del deck, `aria-hidden`, absolutamente posicionada.
  - `<MuroLogos logos={{nombre, logo}[]} />` — grilla de logos en escala de grises que recuperan color al pasar el mouse.

- [ ] **Step 1: Escribir las primitivas**

`components/ui/Seccion.tsx`:

```tsx
export function Seccion({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative px-6 py-24 md:px-12 lg:px-20 ${className}`}>
      {children}
    </section>
  );
}
```

`components/ui/Kicker.tsx`:

```tsx
export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-texto text-sm tracking-wide text-hueso/70">{children}</p>
  );
}
```

`components/ui/TituloDisplay.tsx`:

```tsx
export function TituloDisplay({
  como: Como = "h2",
  italica = false,
  className = "",
  children,
}: {
  como?: "h1" | "h2" | "h3";
  italica?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Como
      className={`font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl ${className}`}
    >
      {italica ? <em className="italic">{children}</em> : children}
    </Como>
  );
}
```

`components/ui/ReglaVertical.tsx`:

```tsx
export function ReglaVertical() {
  return <span aria-hidden className="hidden w-px self-stretch bg-hueso/30 md:block" />;
}
```

`components/ui/TarjetaFoto.tsx`:

```tsx
import Image from "next/image";

export function TarjetaFoto({
  src,
  alt,
  etiqueta,
  prioridad = false,
}: {
  src: string;
  alt: string;
  etiqueta: string;
  prioridad?: boolean;
}) {
  return (
    <figure className="relative aspect-[3/4] overflow-hidden rounded-2xl">
      <Image
        src={`/img/${src}`}
        alt={alt}
        fill
        priority={prioridad}
        sizes="(max-width: 768px) 50vw, 20vw"
        className="object-cover"
      />
      {/* El degradado no es decoración: sostiene el contraste de la etiqueta. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-noche via-noche/70 to-transparent"
      />
      <figcaption className="absolute bottom-4 left-4 font-texto text-sm text-hueso">
        {etiqueta}
      </figcaption>
    </figure>
  );
}
```

`components/ui/Cifra.tsx`:

```tsx
export function Cifra({
  valor,
  prefijo = "",
  sufijo = "",
  rotulo,
}: {
  valor: string | number;
  prefijo?: string;
  sufijo?: string;
  rotulo: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-texto text-sm text-hueso/80">{rotulo}</p>
      <p className="rounded-xl border border-lima px-5 py-3 font-display text-5xl text-lima md:text-6xl">
        {prefijo}
        {valor}
        {sufijo}
      </p>
    </div>
  );
}
```

`components/ui/FondoSelva.tsx`:

```tsx
import Image from "next/image";
import manifiesto from "@/content/manifiesto-imagenes.json";

const textura = manifiesto.find((imagen) => imagen.grupo === "fondo");

/** La textura de selva que el deck repite como fondo. Decorativa: alt vacío. */
export function FondoSelva({ opacidad = 0.35 }: { opacidad?: number }) {
  if (!textura) return null;
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src={`/img/${textura.archivo}`}
        alt=""
        fill
        sizes="100vw"
        style={{ opacity: opacidad }}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-noche/60 via-noche/40 to-noche" />
    </div>
  );
}
```

`components/ui/MuroLogos.tsx`:

```tsx
import Image from "next/image";

export function MuroLogos({
  logos,
}: {
  logos: readonly { nombre: string; logo: string }[];
}) {
  return (
    <ul className="grid grid-cols-3 gap-x-6 gap-y-10 sm:grid-cols-4 lg:grid-cols-6">
      {logos.map((marca) => (
        <li key={marca.logo} className="flex items-center justify-center">
          <Image
            src={`/img/${marca.logo}`}
            alt={marca.nombre}
            width={160}
            height={80}
            sizes="160px"
            className="h-12 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
          />
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 2: Montar una página de laboratorio para verlas**

`app/[lang]/laboratorio/page.tsx`:

```tsx
import { Cifra } from "@/components/ui/Cifra";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { Kicker } from "@/components/ui/Kicker";
import { MuroLogos } from "@/components/ui/MuroLogos";
import { Seccion } from "@/components/ui/Seccion";
import { TarjetaFoto } from "@/components/ui/TarjetaFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getActividades, getMarcas } from "@/lib/contenido";

export default function Laboratorio() {
  const actividades = getActividades();
  return (
    <main id="contenido">
      <Seccion>
        <FondoSelva />
        <Kicker>Laboratorio</Kicker>
        <TituloDisplay como="h1">Primitivas</TituloDisplay>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {actividades.map((actividad) => (
            <TarjetaFoto
              key={actividad.slug}
              src={actividad.imagen}
              alt={actividad.nombre.es}
              etiqueta={actividad.nombre.es}
            />
          ))}
        </div>
        <div className="mt-12 flex flex-wrap gap-8">
          <Cifra valor={4000} prefijo="+" rotulo="Personas" />
          <Cifra valor={67} sufijo="%" rotulo="Crecimiento" />
        </div>
        <div className="mt-12">
          <MuroLogos logos={getMarcas().slice(0, 12)} />
        </div>
      </Seccion>
    </main>
  );
}
```

- [ ] **Step 3: Escribir el test de accesibilidad de las primitivas**

`tests/e2e/primitivas.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("el laboratorio no tiene violaciones de accesibilidad", async ({ page }) => {
  await page.goto("/laboratorio");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(violations).toEqual([]);
});

test("la textura de fondo es decorativa y no la anuncia el lector", async ({ page }) => {
  await page.goto("/laboratorio");
  const decorativas = page.locator('img[alt=""]');
  await expect(decorativas.first()).toBeAttached();
});

test("cada logo de marca lleva su nombre como texto alternativo", async ({ page }) => {
  await page.goto("/laboratorio");
  const logos = page.locator("ul li img");
  const total = await logos.count();
  expect(total).toBeGreaterThan(0);
  for (let i = 0; i < total; i++) {
    await expect(logos.nth(i)).not.toHaveAttribute("alt", "");
  }
});
```

- [ ] **Step 4: Correr los tests**

```bash
npm run test:e2e -- primitivas
```
Esperado: 6 passed (3 tests × 2 proyectos).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Agrega las primitivas visuales que el deck repite"
```

---

### Task 7: Layout, cabecera y pie

**Files:**
- Create: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/layout/SkipLink.tsx`
- Modify: `app/[lang]/layout.tsx`
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: `SelectorIdioma` de Task 4, copy `nav.*` y `pie.*` de Task 4.
- Produces: el layout que envuelve todas las páginas. `SkipLink` apunta a `#contenido`; **toda página debe tener un `<main id="contenido">`**.

- [ ] **Step 1: Escribir el test primero**

`tests/e2e/layout.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("el salto al contenido aparece al tabular y lleva el foco al main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const salto = page.getByRole("link", { name: /saltar al contenido/i });
  await expect(salto).toBeFocused();
  await salto.press("Enter");
  await expect(page.locator("main#contenido")).toBeFocused();
});

test("hay una sola cabecera, un solo main y un solo pie", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
});

test("hay exactamente un h1 en la home", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});

test("el selector de idioma marca el idioma activo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "ES" })).toHaveAttribute("aria-current", "true");
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm run test:e2e -- layout
```
Esperado: FAIL — no hay `header`, ni `footer`, ni salto.

- [ ] **Step 3: Escribir el `SkipLink`**

`components/layout/SkipLink.tsx`:

```tsx
import { useTranslations } from "next-intl";

export function SkipLink() {
  const t = useTranslations("nav");
  return (
    <a
      href="#contenido"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-lima focus:px-4 focus:py-2 focus:font-texto focus:text-noche"
    >
      {t("saltarAlContenido")}
    </a>
  );
}
```

- [ ] **Step 4: Escribir la cabecera**

`components/layout/Header.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SelectorIdioma } from "./SelectorIdioma";

export function Header({ lang }: { lang: string }) {
  const t = useTranslations("nav");
  const base = lang === "es" ? "" : `/${lang}`;

  const enlaces = [
    { href: `${base}/2027`, texto: t("festival") },
    { href: `${base}/road-to-dharma`, texto: t("road") },
    { href: `${base}/patrocinios`, texto: t("patrocinios") },
    { href: `${base}/nosotros`, texto: t("nosotros") },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-6 md:px-12">
      <Link href={base || "/"} aria-label="Dharma Fest">
        <Image src="/img/portada-02.png" alt="Dharma Fest" width={180} height={60} priority
               className="h-10 w-auto object-contain" />
      </Link>
      <nav aria-label={t("inicio")} className="hidden gap-8 font-texto text-sm md:flex">
        {enlaces.map((enlace) => (
          <Link key={enlace.href} href={enlace.href} className="text-hueso/85 hover:text-lima">
            {enlace.texto}
          </Link>
        ))}
      </nav>
      <SelectorIdioma />
    </header>
  );
}
```

Si tras Task 2 el logo no quedó en `portada-02.png`, buscar en el manifiesto la entrada de grupo `logo-dharma` y usar ese archivo.

- [ ] **Step 5: Escribir el pie**

`components/layout/Footer.tsx`:

```tsx
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer({ lang }: { lang: string }) {
  const t = useTranslations("pie");
  const base = lang === "es" ? "" : `/${lang}`;

  return (
    <footer className="border-t border-hueso/15 px-6 py-12 font-texto text-sm md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="text-hueso/70">
          © {new Date().getFullYear()} {t("derechos")}
        </p>
        <div className="flex flex-wrap gap-6">
          <a href="https://instagram.com/dharma_festcr" className="text-hueso/70 hover:text-lima">
            @dharma_festcr
          </a>
          <a href="mailto:info@dharmafestcr.com" className="text-hueso/70 hover:text-lima">
            info@dharmafestcr.com
          </a>
          <Link href={`${base}/privacidad`} className="text-hueso/70 hover:text-lima">
            {t("privacidad")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Enchufarlos en el layout de idioma**

En `app/[lang]/layout.tsx`, reemplazar el `return`:

```tsx
  return (
    <NextIntlClientProvider>
      <SkipLink />
      <Header lang={lang} />
      {children}
      <Footer lang={lang} />
    </NextIntlClientProvider>
  );
```

Con los imports correspondientes. Y en `app/[lang]/page.tsx`, envolver en `<main id="contenido" tabIndex={-1}>` — el `tabIndex={-1}` es lo que permite que el salto le dé el foco.

- [ ] **Step 7: Correr los tests**

```bash
npm run test:e2e -- layout
```
Esperado: 8 passed.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Agrega cabecera, pie y salto al contenido"
```

---

### Task 8: Home — hero, quiénes somos, actividades y temas

**Files:**
- Create: `components/secciones/Hero.tsx`, `components/secciones/QuienesSomos.tsx`, `components/secciones/Actividades.tsx`, `components/secciones/Temas.tsx`
- Modify: `app/[lang]/page.tsx`, `content/copy/es.json`, `content/copy/en.json`
- Test: `tests/e2e/home-superior.spec.ts`

**Interfaces:**
- Consumes: primitivas de Task 6, `getActividades()` y `getTemas()` de Task 5.
- Produces: las cuatro primeras secciones de la home. `Hero` contiene el único `<h1>` de la página.

- [ ] **Step 1: Añadir el copy**

En `content/copy/es.json`, agregar al nivel raíz:

```json
{
  "home": {
    "heroDatos": "4ta edición · 2 días · Camp Lago",
    "heroCta": "Sumate a la comunidad",
    "quienesSomosKicker": "Sobre Dharma",
    "quienesSomosTitulo": "Quiénes Somos",
    "quienesSomosCuerpo": "Producimos las mejores experiencias de bienestar de Costa Rica. Conectamos personas con lo que las hace sentir bien y a las marcas, con su público meta.",
    "actividadesTitulo": "Actividades",
    "temasTitulo": "Temas",
    "temasCierre": "Una red de más de 100 profesionales del bienestar"
  }
}
```

En `content/copy/en.json`, las mismas claves:

```json
{
  "home": {
    "heroDatos": "4th edition · 2 days · Camp Lago",
    "heroCta": "Join the community",
    "quienesSomosKicker": "About Dharma",
    "quienesSomosTitulo": "Who We Are",
    "quienesSomosCuerpo": "We produce the finest wellness experiences in Costa Rica. We connect people with what makes them feel good, and brands with the audience they are looking for.",
    "actividadesTitulo": "Activities",
    "temasTitulo": "Topics",
    "temasCierre": "A network of more than 100 wellness professionals"
  }
}
```

El copy en español de `quienesSomosCuerpo` es literal de la lámina 2 del deck. No reescribirlo.

- [ ] **Step 2: Escribir el hero**

`components/secciones/Hero.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Hero({ lang }: { lang: string }) {
  const t = useTranslations("home");
  const base = lang === "es" ? "" : `/${lang}`;

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      <Image
        src="/img/portada-01.jpg"
        alt="El higuerón de Camp Lago, sede del Dharma Fest"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-noche via-noche/45 to-noche/25"
      />
      <div className="relative z-10 px-6 pb-24 md:px-12 lg:px-20">
        <h1 className="font-display text-6xl leading-[0.9] text-hueso md:text-8xl lg:text-9xl">
          Dharma<em className="italic">fest</em>
        </h1>
        <p className="mt-6 font-texto text-lg text-palido">{t("heroDatos")}</p>
        <Link
          href={`${base}#sumate`}
          className="mt-10 inline-block rounded-full bg-lima px-8 py-4 font-texto text-noche hover:bg-palido"
        >
          {t("heroCta")}
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Escribir quiénes somos**

`components/secciones/QuienesSomos.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { ReglaVertical } from "@/components/ui/ReglaVertical";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function QuienesSomos() {
  const t = useTranslations("home");
  return (
    <Seccion>
      <Kicker>{t("quienesSomosKicker")}</Kicker>
      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
        <TituloDisplay className="text-palido md:basis-2/5">
          {t("quienesSomosTitulo")}
        </TituloDisplay>
        <ReglaVertical />
        <p className="font-texto text-xl leading-relaxed text-hueso/90 md:basis-3/5">
          {t("quienesSomosCuerpo")}
        </p>
      </div>
    </Seccion>
  );
}
```

- [ ] **Step 4: Escribir actividades y temas**

`components/secciones/Actividades.tsx`:

```tsx
import { useLocale, useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TarjetaFoto } from "@/components/ui/TarjetaFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { getActividades } from "@/lib/contenido";

export function Actividades() {
  const t = useTranslations("home");
  const idioma = useLocale() as "es" | "en";
  const actividades = getActividades();

  return (
    <Seccion id="actividades">
      <FondoSelva />
      <TituloDisplay className="text-center text-lima-humo">
        {t("actividadesTitulo")}
      </TituloDisplay>
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
        {actividades.map((actividad) => (
          <li key={actividad.slug}>
            <TarjetaFoto
              src={actividad.imagen}
              alt={actividad.nombre[idioma]}
              etiqueta={actividad.nombre[idioma]}
            />
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
```

`components/secciones/Temas.tsx` — idéntico en forma, pero con `getTemas()`, `grid-cols-4` y el cierre:

```tsx
import { useLocale, useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TarjetaFoto } from "@/components/ui/TarjetaFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getTemas } from "@/lib/contenido";

export function Temas() {
  const t = useTranslations("home");
  const idioma = useLocale() as "es" | "en";
  const temas = getTemas();

  return (
    <Seccion id="temas">
      <TituloDisplay className="text-palido">{t("temasTitulo")}</TituloDisplay>
      <ul className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
        {temas.map((tema) => (
          <li key={tema.slug}>
            <TarjetaFoto
              src={tema.imagen}
              alt={tema.nombre[idioma]}
              etiqueta={tema.nombre[idioma]}
            />
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center font-texto text-lg text-hueso/80">{t("temasCierre")}</p>
    </Seccion>
  );
}
```

- [ ] **Step 5: Montarlas en la home**

`app/[lang]/page.tsx`:

```tsx
import { setRequestLocale } from "next-intl/server";
import { Actividades } from "@/components/secciones/Actividades";
import { Hero } from "@/components/secciones/Hero";
import { QuienesSomos } from "@/components/secciones/QuienesSomos";
import { Temas } from "@/components/secciones/Temas";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  setRequestLocale(lang);

  return (
    <main id="contenido" tabIndex={-1}>
      <Hero lang={lang} />
      <QuienesSomos />
      <Actividades />
      <Temas />
    </main>
  );
}
```

- [ ] **Step 6: Escribir el test**

`tests/e2e/home-superior.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("el hero muestra el nombre y el dato del festival", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dharma");
  await expect(page.getByText("4ta edición · 2 días · Camp Lago")).toBeVisible();
});

test("la foto del hero tiene texto alternativo con sentido", async ({ page }) => {
  await page.goto("/");
  const alt = await page.locator("section img").first().getAttribute("alt");
  expect(alt).toBeTruthy();
  expect(alt!.length).toBeGreaterThan(10);
});

test("el copy de quiénes somos es el del deck, literal", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Producimos las mejores experiencias de bienestar de Costa Rica"),
  ).toBeVisible();
});

test("hay cinco actividades y ocho temas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#actividades li")).toHaveCount(5);
  await expect(page.locator("#temas li")).toHaveCount(8);
});

test("la mitad superior de la home no tiene violaciones de accesibilidad", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(violations).toEqual([]);
});

test("la home en inglés traduce el hero", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByText("4th edition · 2 days · Camp Lago")).toBeVisible();
});
```

- [ ] **Step 7: Correr los tests**

```bash
npm test && npm run test:e2e -- home-superior
```
Esperado: 12 passed.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Agrega el hero y las tres primeras secciones de la home"
```

---

### Task 9: Home — galería, cifras, Road to Dharma, Camp Lago, impacto y marcas

**Files:**
- Create: `components/secciones/Galeria.tsx`, `components/secciones/Cifras.tsx`, `components/secciones/RoadToDharma.tsx`, `components/secciones/CampoLago.tsx`, `components/secciones/ImpactoSocial.tsx`, `components/secciones/MarcasQueConfian.tsx`
- Modify: `app/[lang]/page.tsx`, `content/copy/es.json`, `content/copy/en.json`
- Test: `tests/e2e/home-inferior.spec.ts`

**Interfaces:**
- Consumes: primitivas de Task 6; `getCifras()`, `getMarcas()`, `getAsociaciones()`, `getEspacios()` de Task 5; manifiesto de Task 2 para las fotos de galería (`grupo === "foto"` y páginas 7, 8 y 9).
- Produces: las seis secciones restantes de la home, en ese orden.

- [ ] **Step 1: Añadir el copy**

En `content/copy/es.json`, dentro de `home`:

```json
{
  "galeriaKicker": "Galería",
  "galeriaTitulo": "Galería Dharma",
  "cifrasTitulo": "Comunidad en Crecimiento",
  "cifrasPersonas": "Personas que han vivido una experiencia Dharma",
  "cifrasExperiencias": "Experiencias anuales",
  "cifrasCrecimiento": "Crecimiento de participación anual en el festival Dharma",
  "cifrasBase": "Base de datos de más de 26K personas",
  "roadTitulo": "Road To Dharma",
  "roadCuerpo": "Experiencias premium recurrentes durante todo el año, de 80 a 200 participantes cada una. Formato íntimo, alta permanencia y conexión real con la comunidad Dharma. El festival es el encuentro anual. Road to Dharma es la comunidad todo el año.",
  "roadCta": "Conocé Road to Dharma",
  "sedeKicker": "La sede",
  "sedeTitulo": "Espacios",
  "impactoTitulo": "Impacto Social",
  "impactoSubtitulo": "Asociaciones Aliadas",
  "impactoCuerpo": "Nuestro propósito es dejar huella y fomentar la comunidad en cada evento.",
  "marcasTitulo": "Marcas",
  "marcasSubtitulo": "que confían en Dharma"
}
```

En `content/copy/en.json`, las mismas claves traducidas. `roadCuerpo` en inglés:

```json
{
  "roadCuerpo": "Recurring premium experiences all year round, 80 to 200 participants each. An intimate format with high retention and a real connection to the Dharma community. The festival is the annual gathering. Road to Dharma is the community all year long."
}
```

- [ ] **Step 2: Escribir la galería**

`components/secciones/Galeria.tsx`:

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import manifiesto from "@/content/manifiesto-imagenes.json";

// Las laminas 7, 8 y 9 del deck son la galeria.
const FOTOS = manifiesto.filter(
  (imagen) => imagen.grupo === "foto" && [7, 8, 9].includes(imagen.pagina),
);

export function Galeria() {
  const t = useTranslations("home");
  return (
    <Seccion id="galeria">
      <Kicker>{t("galeriaKicker")}</Kicker>
      <TituloDisplay italica className="mt-4 text-hueso">
        {t("galeriaTitulo")}
      </TituloDisplay>
      <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-3">
        {FOTOS.map((foto) => (
          <li key={foto.archivo} className="relative aspect-square overflow-hidden rounded-xl">
            <Image
              src={`/img/${foto.archivo}`}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
```

Las fotos de galería llevan `alt=""` a propósito: son decorativas y la sección ya tiene título. Poner descripciones inventadas de personas que no conocemos sería peor que no ponerlas.

- [ ] **Step 3: Escribir las cifras**

`components/secciones/Cifras.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Cifra } from "@/components/ui/Cifra";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getCifras } from "@/lib/contenido";

export function Cifras() {
  const t = useTranslations("home");
  const cifras = getCifras();

  return (
    <Seccion id="cifras">
      <FondoSelva opacidad={0.25} />
      <TituloDisplay className="text-center text-lima">{t("cifrasTitulo")}</TituloDisplay>
      <div className="mt-16 grid gap-10 md:grid-cols-3">
        <Cifra valor={cifras.personas} prefijo="+" rotulo={t("cifrasPersonas")} />
        <Cifra valor={cifras.experienciasAnuales} prefijo="+" rotulo={t("cifrasExperiencias")} />
        <Cifra valor={cifras.crecimiento} sufijo="%" rotulo={t("cifrasCrecimiento")} />
      </div>
      <p className="mt-12 text-center font-texto text-hueso/80">{t("cifrasBase")}</p>
    </Seccion>
  );
}
```

- [ ] **Step 4: Escribir Road to Dharma, Camp Lago, impacto y marcas**

`components/secciones/RoadToDharma.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ReglaVertical } from "@/components/ui/ReglaVertical";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function RoadToDharma({ lang }: { lang: string }) {
  const t = useTranslations("home");
  const base = lang === "es" ? "" : `/${lang}`;

  return (
    <section id="road" className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      <Image src="/img/road-to-dharma-01.jpg" alt="" fill sizes="100vw"
             className="-z-10 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noche/65" />
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <TituloDisplay className="text-palido md:basis-2/5">{t("roadTitulo")}</TituloDisplay>
        <ReglaVertical />
        <div className="md:basis-3/5">
          <p className="font-texto text-lg leading-relaxed text-hueso/90">{t("roadCuerpo")}</p>
          <Link href={`${base}/road-to-dharma`}
                className="mt-8 inline-block border-b border-lima pb-1 font-texto text-lima">
            {t("roadCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

`components/secciones/CampoLago.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { Seccion } from "@/components/ui/Seccion";
import { TarjetaFoto } from "@/components/ui/TarjetaFoto";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getEspacios } from "@/lib/contenido";

export function CampoLago() {
  const t = useTranslations("home");
  const espacios = getEspacios();

  return (
    <Seccion id="sede">
      <Kicker>{t("sedeKicker")}</Kicker>
      <TituloDisplay className="mt-4 text-palido">{t("sedeTitulo")}</TituloDisplay>
      <ul className="mt-14 grid gap-4 md:grid-cols-3">
        {espacios.map((espacio) => (
          <li key={espacio.slug}>
            <TarjetaFoto src={espacio.imagen} alt={espacio.nombre} etiqueta={espacio.nombre} />
          </li>
        ))}
      </ul>
    </Seccion>
  );
}
```

`components/secciones/ImpactoSocial.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { MuroLogos } from "@/components/ui/MuroLogos";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getAsociaciones } from "@/lib/contenido";

export function ImpactoSocial() {
  const t = useTranslations("home");
  return (
    <Seccion id="impacto">
      <TituloDisplay className="text-lima-humo">{t("impactoTitulo")}</TituloDisplay>
      <p className="mt-2 font-display text-2xl italic text-palido">{t("impactoSubtitulo")}</p>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/85">{t("impactoCuerpo")}</p>
      <div className="mt-14">
        <MuroLogos logos={getAsociaciones()} />
      </div>
    </Seccion>
  );
}
```

`components/secciones/MarcasQueConfian.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { MuroLogos } from "@/components/ui/MuroLogos";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getMarcas } from "@/lib/contenido";

export function MarcasQueConfian() {
  const t = useTranslations("home");
  return (
    <Seccion id="marcas">
      <FondoSelva opacidad={0.2} />
      <TituloDisplay className="text-lima">{t("marcasTitulo")}</TituloDisplay>
      <p className="mt-1 font-display text-3xl italic text-palido">{t("marcasSubtitulo")}</p>
      <div className="mt-14">
        <MuroLogos logos={getMarcas()} />
      </div>
    </Seccion>
  );
}
```

- [ ] **Step 5: Montarlas en la home**

En `app/[lang]/page.tsx`, tras `<Temas />`:

```tsx
      <Galeria />
      <Cifras />
      <RoadToDharma lang={lang} />
      <CampoLago />
      <ImpactoSocial />
      <MarcasQueConfian />
```

- [ ] **Step 6: Escribir el test**

`tests/e2e/home-inferior.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("las cifras del deck salen en pantalla", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#cifras")).toContainText("+4000");
  await expect(page.locator("#cifras")).toContainText("67%");
});

test("el muro muestra las 60 y pico marcas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#marcas li").first()).toBeVisible();
  expect(await page.locator("#marcas li").count()).toBeGreaterThanOrEqual(60);
});

test("hay cuatro asociaciones aliadas", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#impacto li")).toHaveCount(4);
});

test("los tres salones de la sede aparecen con su nombre", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#sede")).toContainText("Salón La Casita");
  await expect(page.locator("#sede")).toContainText("Salón Terraza 360");
  await expect(page.locator("#sede")).toContainText("Salón Higuerón");
});

test("Road to Dharma enlaza a su página", async ({ page }) => {
  await page.goto("/");
  await page.locator("#road a").click();
  await expect(page).toHaveURL(/road-to-dharma/);
});

test("la home completa no tiene violaciones de accesibilidad", async ({ page }) => {
  await page.goto("/");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(violations).toEqual([]);
});

test("los encabezados no saltan niveles", async ({ page }) => {
  await page.goto("/");
  const niveles = await page.locator("h1, h2, h3, h4").evaluateAll((nodos) =>
    nodos.map((n) => Number(n.tagName[1])),
  );
  expect(niveles[0]).toBe(1);
  for (let i = 1; i < niveles.length; i++) {
    expect(niveles[i] - niveles[i - 1]).toBeLessThanOrEqual(1);
  }
});
```

El último test va a fallar hasta que exista `/road-to-dharma` (Task 11). Si estorba, marcarlo `test.fixme` y quitarle la marca en Task 11.

- [ ] **Step 7: Correr los tests**

```bash
npm run test:e2e -- home-inferior
```
Esperado: todos en verde salvo el de navegación a `/road-to-dharma`, que pasa en Task 11.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Completa la home con galeria, cifras, sede, impacto y marcas"
```

---

### Task 10: Captura de datos y Server Actions

El único punto de escritura de datos personales, con consentimiento explícito y páginas de gracias.

**Files:**
- Create: `lib/leads.ts`, `lib/acciones.ts`, `components/formularios/CasillaConsentimiento.tsx`, `components/formularios/FormComunidad.tsx`, `components/formularios/FormPropuesta.tsx`, `components/secciones/Sumate.tsx`, `app/[lang]/privacidad/page.tsx`

**Cambio respecto del spec §6:** el spec preveía una página `/gracias`. Al implementarlo con
`useActionState` la confirmación queda en el mismo lugar del formulario, con `role="status"`, y
no hace falta navegar a otra página. Es mejor: no se pierde el contexto y el lector de pantalla
anuncia el cambio sin recargar. **No se crea `/gracias`**, y por eso tampoco aparece en
`lib/rutas.ts` (Task 13).
- Modify: `app/[lang]/page.tsx`, `content/copy/es.json`, `content/copy/en.json`
- Test: `tests/unit/leads.test.ts`, `tests/e2e/formularios.spec.ts`

**Interfaces:**
- Consumes: nada de tareas anteriores salvo primitivas y copy.
- Produces:
  - `lib/leads.ts` exporta `type Lead = { tipo: "comunidad" | "propuesta"; correo: string; nombre?: string; marca?: string; mensaje?: string; idioma: string; consentimiento: true; recibidoEn: string }`
    y `guardarLead(lead: Lead): Promise<void>`.
    **Este es el único lugar del código que escribe datos de personas.** Cambiar de proveedor de correo se hace aquí y en ningún otro archivo.
  - `lib/acciones.ts` exporta `suscribirComunidad(estadoPrevio, formData)` y `solicitarPropuesta(estadoPrevio, formData)`, ambas Server Actions con la firma de `useActionState`, devolviendo `{ ok: boolean; errores?: Record<string, string> }`.

- [ ] **Step 1: Escribir primero el test de `leads.ts`**

`tests/unit/leads.test.ts`:

```ts
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const carpeta = mkdtempSync(path.join(tmpdir(), "leads-"));
vi.stubEnv("DHARMA_DIR_DATOS", carpeta);

const { guardarLead, validarCorreo } = await import("@/lib/leads");

describe("validarCorreo", () => {
  it("acepta correos normales", () => {
    expect(validarCorreo("persona@dharmafestcr.com")).toBe(true);
  });

  it("rechaza lo que no es un correo", () => {
    for (const malo of ["", "sin-arroba", "a@b", "a@@b.com", "espacio @b.com"]) {
      expect(validarCorreo(malo), malo).toBe(false);
    }
  });
});

describe("guardarLead", () => {
  it("escribe una línea JSON por lead", async () => {
    await guardarLead({
      tipo: "comunidad",
      correo: "una@persona.com",
      idioma: "es",
      consentimiento: true,
      recibidoEn: new Date().toISOString(),
    });
    await guardarLead({
      tipo: "propuesta",
      correo: "otra@marca.com",
      marca: "Marca Ejemplo",
      idioma: "en",
      consentimiento: true,
      recibidoEn: new Date().toISOString(),
    });

    const contenido = readFileSync(path.join(carpeta, "leads.jsonl"), "utf8");
    const lineas = contenido.trim().split("\n");
    expect(lineas).toHaveLength(2);
    expect(JSON.parse(lineas[0]).correo).toBe("una@persona.com");
    expect(JSON.parse(lineas[1]).marca).toBe("Marca Ejemplo");
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm test -- leads
```
Esperado: FAIL, no resuelve `@/lib/leads`.

- [ ] **Step 3: Escribir `lib/leads.ts`**

```ts
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type Lead = {
  tipo: "comunidad" | "propuesta";
  correo: string;
  nombre?: string;
  marca?: string;
  mensaje?: string;
  idioma: string;
  consentimiento: true;
  recibidoEn: string;
};

export function validarCorreo(valor: string): boolean {
  // Deliberadamente simple: un solo arroba, algo antes, y un dominio con punto.
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(valor);
}

function carpetaDatos(): string {
  return process.env.DHARMA_DIR_DATOS ?? path.join(process.cwd(), "data");
}

/**
 * Único punto de escritura de datos personales del sitio.
 *
 * Hoy hace append a un .jsonl local. El día que el cliente elija proveedor de
 * correo (Mailchimp, Brevo, el que sea), se cambia SOLO esta función. Ningún
 * otro archivo debe escribir leads.
 */
export async function guardarLead(lead: Lead): Promise<void> {
  const carpeta = carpetaDatos();
  await mkdir(carpeta, { recursive: true });
  await appendFile(path.join(carpeta, "leads.jsonl"), `${JSON.stringify(lead)}\n`, "utf8");
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npm test -- leads
```
Esperado: 3 passed.

- [ ] **Step 5: Escribir las Server Actions**

`lib/acciones.ts`:

```ts
"use server";

import { guardarLead, validarCorreo, type Lead } from "./leads";

export type EstadoFormulario = { ok: boolean; errores?: Record<string, string> };

function leerConsentimiento(datos: FormData): boolean {
  return datos.get("consentimiento") === "on";
}

export async function suscribirComunidad(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const correo = String(datos.get("correo") ?? "").trim();
  const idioma = String(datos.get("idioma") ?? "es");
  const errores: Record<string, string> = {};

  if (!validarCorreo(correo)) errores.correo = "correoInvalido";
  if (!leerConsentimiento(datos)) errores.consentimiento = "consentimientoRequerido";
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const lead: Lead = {
    tipo: "comunidad",
    correo,
    nombre: String(datos.get("nombre") ?? "").trim() || undefined,
    idioma,
    consentimiento: true,
    recibidoEn: new Date().toISOString(),
  };
  await guardarLead(lead);
  return { ok: true };
}

export async function solicitarPropuesta(
  _previo: EstadoFormulario,
  datos: FormData,
): Promise<EstadoFormulario> {
  const correo = String(datos.get("correo") ?? "").trim();
  const marca = String(datos.get("marca") ?? "").trim();
  const idioma = String(datos.get("idioma") ?? "es");
  const errores: Record<string, string> = {};

  if (!validarCorreo(correo)) errores.correo = "correoInvalido";
  if (marca.length === 0) errores.marca = "marcaRequerida";
  if (!leerConsentimiento(datos)) errores.consentimiento = "consentimientoRequerido";
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const lead: Lead = {
    tipo: "propuesta",
    correo,
    marca,
    nombre: String(datos.get("nombre") ?? "").trim() || undefined,
    mensaje: String(datos.get("mensaje") ?? "").trim() || undefined,
    idioma,
    consentimiento: true,
    recibidoEn: new Date().toISOString(),
  };
  await guardarLead(lead);
  return { ok: true };
}
```

- [ ] **Step 6: Añadir el copy de los formularios**

En `content/copy/es.json`, al nivel raíz:

```json
{
  "formularios": {
    "sumateTitulo": "Sumate",
    "sumateCuerpo": "Dejanos tu correo y te avisamos del Dharma Fest 2027 y de cada Road to Dharma.",
    "nombre": "Nombre",
    "correo": "Correo electrónico",
    "marca": "Marca o empresa",
    "mensaje": "Contanos qué buscás",
    "consentimiento": "Autorizo a Dharma Fest a guardar mi correo para enviarme información del festival y de las experiencias Road to Dharma. Puedo darme de baja cuando quiera.",
    "finalidad": "Usamos tus datos solo para eso. No los compartimos con terceros.",
    "enviar": "Sumate",
    "enviarPropuesta": "Solicitá la propuesta",
    "enviando": "Enviando…",
    "correoInvalido": "Revisá el correo, no parece válido.",
    "marcaRequerida": "Necesitamos el nombre de la marca.",
    "consentimientoRequerido": "Necesitamos tu autorización para guardarte el correo.",
    "graciasTitulo": "Gracias",
    "graciasComunidad": "Ya estás en la comunidad. Te escribimos pronto.",
    "graciasPropuesta": "Recibimos tu solicitud. Te mandamos la propuesta por correo.",
    "propuestaTitulo": "Solicitá la propuesta",
    "propuestaCuerpo": "Contanos de tu marca y te mandamos los paquetes con la inversión de cada uno."
  }
}
```

En `content/copy/en.json`, las mismas claves traducidas. El consentimiento en inglés:

```json
{
  "consentimiento": "I allow Dharma Fest to store my email address in order to send me information about the festival and the Road to Dharma experiences. I can unsubscribe at any time."
}
```

- [ ] **Step 7: Escribir la casilla de consentimiento y los formularios**

`components/formularios/CasillaConsentimiento.tsx`:

```tsx
import { useTranslations } from "next-intl";

/** Nunca premarcada. Ley 8968: el consentimiento es un acto, no un ajuste por defecto. */
export function CasillaConsentimiento({ error }: { error?: string }) {
  const t = useTranslations("formularios");
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-start gap-3 font-texto text-sm text-hueso/85">
        <input
          type="checkbox"
          name="consentimiento"
          required
          aria-describedby="finalidad"
          className="mt-1 size-4 accent-lima"
        />
        <span>{t("consentimiento")}</span>
      </label>
      <p id="finalidad" className="pl-7 font-texto text-xs text-hueso/60">
        {t("finalidad")}
      </p>
      {error ? (
        <p role="alert" className="pl-7 font-texto text-sm text-lima">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
```

`components/formularios/FormComunidad.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { suscribirComunidad, type EstadoFormulario } from "@/lib/acciones";
import { CasillaConsentimiento } from "./CasillaConsentimiento";

const INICIAL: EstadoFormulario = { ok: false };

export function FormComunidad() {
  const t = useTranslations("formularios");
  const idioma = useLocale();
  const [estado, accion, pendiente] = useActionState(suscribirComunidad, INICIAL);

  if (estado.ok) {
    return (
      <p role="status" className="font-texto text-lg text-lima">
        {t("graciasComunidad")}
      </p>
    );
  }

  return (
    <form action={accion} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="idioma" value={idioma} />
      <label className="flex flex-col gap-2 font-texto text-sm">
        {t("nombre")}
        <input name="nombre" type="text" autoComplete="name"
               className="rounded border border-hueso/30 bg-transparent px-4 py-3 text-hueso" />
      </label>
      <label className="flex flex-col gap-2 font-texto text-sm">
        {t("correo")}
        <input name="correo" type="email" required autoComplete="email"
               aria-invalid={estado.errores?.correo ? "true" : undefined}
               className="rounded border border-hueso/30 bg-transparent px-4 py-3 text-hueso" />
      </label>
      {estado.errores?.correo ? (
        <p role="alert" className="font-texto text-sm text-lima">{t(estado.errores.correo)}</p>
      ) : null}
      <CasillaConsentimiento error={estado.errores?.consentimiento} />
      <button type="submit" disabled={pendiente}
              className="self-start rounded-full bg-lima px-8 py-3 font-texto text-noche disabled:opacity-60">
        {pendiente ? t("enviando") : t("enviar")}
      </button>
    </form>
  );
}
```

`components/formularios/FormPropuesta.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { solicitarPropuesta, type EstadoFormulario } from "@/lib/acciones";
import { CasillaConsentimiento } from "./CasillaConsentimiento";

const INICIAL: EstadoFormulario = { ok: false };

export function FormPropuesta() {
  const t = useTranslations("formularios");
  const idioma = useLocale();
  const [estado, accion, pendiente] = useActionState(solicitarPropuesta, INICIAL);

  if (estado.ok) {
    return (
      <p role="status" className="font-texto text-lg text-lima">
        {t("graciasPropuesta")}
      </p>
    );
  }

  return (
    <form action={accion} className="flex max-w-xl flex-col gap-5">
      <input type="hidden" name="idioma" value={idioma} />
      <label className="flex flex-col gap-2 font-texto text-sm">
        {t("marca")}
        <input name="marca" type="text" required autoComplete="organization"
               aria-invalid={estado.errores?.marca ? "true" : undefined}
               className="rounded border border-hueso/30 bg-transparent px-4 py-3 text-hueso" />
      </label>
      {estado.errores?.marca ? (
        <p role="alert" className="font-texto text-sm text-lima">{t(estado.errores.marca)}</p>
      ) : null}
      <label className="flex flex-col gap-2 font-texto text-sm">
        {t("nombre")}
        <input name="nombre" type="text" autoComplete="name"
               className="rounded border border-hueso/30 bg-transparent px-4 py-3 text-hueso" />
      </label>
      <label className="flex flex-col gap-2 font-texto text-sm">
        {t("correo")}
        <input name="correo" type="email" required autoComplete="email"
               aria-invalid={estado.errores?.correo ? "true" : undefined}
               className="rounded border border-hueso/30 bg-transparent px-4 py-3 text-hueso" />
      </label>
      {estado.errores?.correo ? (
        <p role="alert" className="font-texto text-sm text-lima">{t(estado.errores.correo)}</p>
      ) : null}
      <label className="flex flex-col gap-2 font-texto text-sm">
        {t("mensaje")}
        <textarea name="mensaje" rows={4}
                  className="rounded border border-hueso/30 bg-transparent px-4 py-3 text-hueso" />
      </label>
      <CasillaConsentimiento error={estado.errores?.consentimiento} />
      <button type="submit" disabled={pendiente}
              className="self-start rounded-full bg-lima px-8 py-3 font-texto text-noche disabled:opacity-60">
        {pendiente ? t("enviando") : t("enviarPropuesta")}
      </button>
    </form>
  );
}
```

- [ ] **Step 8: Montar la sección Sumate y las páginas de apoyo**

`components/secciones/Sumate.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Sumate() {
  const t = useTranslations("formularios");
  return (
    <Seccion id="sumate">
      <TituloDisplay className="text-lima">{t("sumateTitulo")}</TituloDisplay>
      <p className="mt-4 max-w-xl font-texto text-lg text-hueso/85">{t("sumateCuerpo")}</p>
      <div className="mt-10">
        <FormComunidad />
      </div>
    </Seccion>
  );
}
```

Añadir `<Sumate />` al final de la home, antes de cerrar el `<main>`.

`app/[lang]/privacidad/page.tsx` — página maquetada con el aviso de que el texto lo debe entregar el cliente:

```tsx
import { setRequestLocale } from "next-intl/server";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export default async function Privacidad({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  setRequestLocale(lang);
  return (
    <main id="contenido" tabIndex={-1}>
      <Seccion>
        <TituloDisplay como="h1" className="text-palido">Privacidad</TituloDisplay>
        {/* BORRADOR: el texto legal y el responsable del tratamiento los entrega el
            cliente. Ver spec §9 y §10.5. No inventar politica de privacidad. */}
        <p className="mt-8 max-w-2xl font-texto text-lg text-hueso/85">
          Esta página está pendiente del texto legal del cliente.
        </p>
      </Seccion>
    </main>
  );
}
```

- [ ] **Step 9: Escribir el test e2e de los formularios**

`tests/e2e/formularios.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("no deja enviar sin consentimiento", async ({ page }) => {
  await page.goto("/#sumate");
  await page.fill('input[name="correo"]', "persona@ejemplo.com");
  await page.click('button[type="submit"]');
  // La casilla es required: el navegador bloquea el envio y el formulario sigue ahi.
  await expect(page.locator('input[name="consentimiento"]')).toBeFocused();
});

test("la casilla de consentimiento nunca viene premarcada", async ({ page }) => {
  await page.goto("/#sumate");
  await expect(page.locator('input[name="consentimiento"]')).not.toBeChecked();
});

test("un correo válido con consentimiento da acuse de recibo", async ({ page }) => {
  await page.goto("/#sumate");
  await page.fill('input[name="correo"]', `prueba+${Date.now()}@ejemplo.com`);
  await page.check('input[name="consentimiento"]');
  await page.click('button[type="submit"]');
  await expect(page.getByRole("status")).toBeVisible();
});

test("la finalidad del tratamiento está junto al formulario", async ({ page }) => {
  await page.goto("/#sumate");
  await expect(page.locator("#finalidad")).toBeVisible();
});

test("el formulario se puede recorrer con el teclado", async ({ page }) => {
  await page.goto("/#sumate");
  await page.locator('input[name="nombre"]').focus();
  await page.keyboard.press("Tab");
  await expect(page.locator('input[name="correo"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('input[name="consentimiento"]')).toBeFocused();
});
```

- [ ] **Step 10: Correr todo**

```bash
npm test && npm run test:e2e -- formularios
```
Esperado: unitarios en verde, 10 e2e passed.

- [ ] **Step 11: Verificar que los datos no se cuelan a git**

```bash
git status --porcelain | grep -c "^?? data/" || echo "data/ correctamente ignorado"
```
Esperado: `data/ correctamente ignorado`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Agrega la captura de datos con consentimiento explicito"
```

---

### Task 11: Página de patrocinios

La que reemplaza al PDF. Sin precios.

**Files:**
- Create: `app/[lang]/patrocinios/page.tsx`, `components/secciones/NuestroPublico.tsx`, `components/secciones/PlanDeMedios.tsx`, `components/secciones/LoQueViene.tsx`, `components/secciones/Paquetes.tsx`, `components/secciones/Mercadito.tsx`
- Modify: `content/copy/es.json`, `content/copy/en.json`
- Test: `tests/e2e/patrocinios.spec.ts`

**Interfaces:**
- Consumes: `getPaquetes()`, `getCifras()`, `getMedios()`, `getMarcas()` de Task 5; `FormPropuesta` de Task 10; primitivas de Task 6.
- Produces: la ruta `/patrocinios` y `/en/patrocinios`.

- [ ] **Step 1: Escribir primero el test que blinda la regla de los precios**

`tests/e2e/patrocinios.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("no se publica ningún precio", async ({ page }) => {
  await page.goto("/patrocinios");
  const texto = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  for (const prohibido of ["7000", "7.000", "4000", "4.000", "2000", "2.000", "$7", "$4", "$2"]) {
    expect(texto, `aparece el precio ${prohibido}`).not.toContain(prohibido);
  }
});

test("están los tres paquetes con sus tres grupos de beneficios", async ({ page }) => {
  await page.goto("/patrocinios");
  await expect(page.locator("#paquetes article")).toHaveCount(3);
  await expect(page.locator("#paquetes")).toContainText("Oficial");
  await expect(page.locator("#paquetes")).toContainText("Oro");
  await expect(page.locator("#paquetes")).toContainText("Plata");
});

test("el argumento de venta del deck abre la página", async ({ page }) => {
  await page.goto("/patrocinios");
  await expect(page.getByText("Comprá presencia")).toBeVisible();
});

test("los datos de audiencia salen del deck", async ({ page }) => {
  await page.goto("/patrocinios");
  await expect(page.locator("#publico")).toContainText("68,2");
  await expect(page.locator("#publico")).toContainText("43,1");
});

test("lo que viene anuncia los dos días y los 2.000 asistentes", async ({ page }) => {
  await page.goto("/patrocinios");
  await expect(page.locator("#lo-que-viene")).toContainText("2.000");
});

test("el formulario de propuesta pide la marca", async ({ page }) => {
  await page.goto("/patrocinios");
  await expect(page.locator('input[name="marca"]')).toBeVisible();
});

test("patrocinios no tiene violaciones de accesibilidad", async ({ page }) => {
  await page.goto("/patrocinios");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(violations).toEqual([]);
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm run test:e2e -- patrocinios
```
Esperado: FAIL, la ruta da 404.

- [ ] **Step 3: Añadir el copy**

En `content/copy/es.json`, al nivel raíz. El copy de `heroKicker`, `heroItalica`, `heroTitulo` y `heroCuerpo` es literal de la lámina 3:

```json
{
  "patrocinios": {
    "heroKicker": "¿Por qué Dharma?",
    "heroItalica": "No comprés segundos",
    "heroTitulo": "Comprá presencia",
    "heroCuerpo": "Las personas están saturadas de contenido. Un anuncio digital compite por segundos de atención distraída. En Dharma tu marca se vuelve una experiencia.",
    "publicoKicker": "Nuestro público",
    "publicoTitulo": "Perfil",
    "publicoCuerpo": "Una comunidad activa y aspiracional, que invierte en su bienestar físico, mental y espiritual. Buscan experiencias auténticas que conecten con la salud integral. Son personas influyentes, valoran la sostenibilidad y prefieren marcas y experiencias premium.",
    "estiloTitulo": "Estilo de vida",
    "estilo": "Bienestar integral · Música & arte · Naturaleza y sostenibilidad · Social media & experiencias premium",
    "generoTitulo": "Género de audiencia",
    "mujeres": "Mujeres",
    "hombres": "Hombres",
    "edadesTitulo": "Edades de la audiencia",
    "mediosTitulo": "Plan de medios & Difusión",
    "mediosDesde": "Tu marca, desde hoy",
    "mediosDesdeLista": "La comunicación arranca meses antes del evento · Las marcas aliadas entran en toda la campaña, no solo en el festival · Y acompañan a la comunidad en los Road to Dharma durante todo el año",
    "mediosComo": "¿Cómo se difunde?",
    "loQueVieneTitulo": "Lo que viene",
    "loQueVieneEdicion": "4ta edición de Dharma Fest",
    "loQueViene": "Por primera vez, dos días completos · 2.000 asistentes proyectados · +30 marcas en el Mercadito · Programación ampliada en movimiento, salud, gastronomía y música",
    "paquetesTitulo": "Patrocinadores",
    "paquetesCuerpo": "Tres formas de estar. Escribinos y te mandamos la propuesta con la inversión de cada una.",
    "grupoPresencia": "Presencia Dharma Fest 2027",
    "grupoVisibilidad": "Visibilidad y Comunidad",
    "grupoCaptacion": "Captación de Clientes",
    "mercaditoTitulo": "Mercadito",
    "mercaditoCuerpo": "Un espacio consciente con marcas locales que promueven el bienestar integral. Más de 30 marcas en la edición 2027.",
    "mercaditoCta": "Quiero un stand"
  }
}
```

En `content/copy/en.json`, las mismas claves. El hero necesita transcreación, no traducción literal — `heroItalica`: `"Stop buying seconds"`, `heroTitulo`: `"Buy presence"`.

- [ ] **Step 4: Escribir las secciones**

`components/secciones/Paquetes.tsx` — el componente donde vive la regla de negocio más importante:

```tsx
import { useLocale, useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getPaquetes } from "@/lib/contenido";

const COLOR_POR_PAQUETE = {
  oficial: "text-lima",
  oro: "text-oro",
  plata: "text-palido",
} as const;

export function Paquetes() {
  const t = useTranslations("patrocinios");
  const idioma = useLocale() as "es" | "en";
  const paquetes = getPaquetes();

  return (
    <Seccion id="paquetes">
      <TituloDisplay className="text-palido">{t("paquetesTitulo")}</TituloDisplay>
      <p className="mt-4 max-w-xl font-texto text-lg text-hueso/85">{t("paquetesCuerpo")}</p>

      <div className="mt-16 grid gap-12 lg:grid-cols-3">
        {paquetes.map((paquete) => (
          <article key={paquete.slug} className="border-t border-hueso/20 pt-8">
            {/* paquete.inversionUSD existe, y NO se renderiza a proposito.
                Ver Global Constraints del plan y spec §3. */}
            <h3 className={`font-display text-5xl ${COLOR_POR_PAQUETE[paquete.slug]}`}>
              {paquete.nombre}
            </h3>
            <p className="mt-2 font-texto text-sm text-hueso/70">{paquete.lema[idioma]}</p>

            {(
              [
                ["grupoPresencia", paquete.presencia],
                ["grupoVisibilidad", paquete.visibilidad],
                ["grupoCaptacion", paquete.captacion],
              ] as const
            ).map(([clave, beneficios]) => (
              <div key={clave} className="mt-8">
                <h4 className="font-texto text-sm font-semibold text-hueso">{t(clave)}</h4>
                <ul className="mt-3 flex flex-col gap-2">
                  {beneficios.map((beneficio) => (
                    <li key={beneficio.es} className="font-texto text-sm text-hueso/80">
                      {beneficio[idioma]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </div>
    </Seccion>
  );
}
```

`components/secciones/NuestroPublico.tsx` — las barras de edad se dibujan con `div` de ancho porcentual y cada una lleva su porcentaje como texto visible. Nada de gráficos que un lector de pantalla no pueda leer:

```tsx
import { useTranslations } from "next-intl";
import { FondoSelva } from "@/components/ui/FondoSelva";
import { Kicker } from "@/components/ui/Kicker";
import { ReglaVertical } from "@/components/ui/ReglaVertical";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getCifras } from "@/lib/contenido";

export function NuestroPublico() {
  const t = useTranslations("patrocinios");
  const cifras = getCifras();

  return (
    <Seccion id="publico">
      <FondoSelva opacidad={0.3} />
      <Kicker>{t("publicoKicker")}</Kicker>
      <TituloDisplay className="mt-4 text-lima-humo">{t("publicoTitulo")}</TituloDisplay>

      <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start">
        <p className="font-texto text-lg leading-relaxed text-hueso/90 md:basis-1/2">
          {t("publicoCuerpo")}
        </p>
        <ReglaVertical />
        <div className="md:basis-1/2">
          <h3 className="font-display text-3xl italic text-palido">{t("estiloTitulo")}</h3>
          <ul className="mt-4 flex flex-col gap-1">
            {t("estilo")
              .split("·")
              .map((item) => (
                <li key={item} className="font-texto text-hueso/85">
                  {item.trim()}
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="font-texto text-sm text-hueso/80">{t("generoTitulo")}</h3>
          <dl className="mt-4 flex gap-10">
            <div>
              <dt className="font-texto text-sm text-hueso/70">{t("mujeres")}</dt>
              <dd className="font-display text-4xl text-lima">
                {cifras.genero.mujeres.toLocaleString("es-CR")}%
              </dd>
            </div>
            <div>
              <dt className="font-texto text-sm text-hueso/70">{t("hombres")}</dt>
              <dd className="font-display text-4xl text-palido">
                {cifras.genero.hombres.toLocaleString("es-CR")}%
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="font-texto text-sm text-hueso/80">{t("edadesTitulo")}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {cifras.edades.map((edad) => (
              <li key={edad.rango} className="flex items-center gap-4">
                <span className="w-16 font-texto text-sm text-hueso/85">{edad.rango}</span>
                <span aria-hidden className="h-2 flex-1 rounded-full bg-hueso/15">
                  <span
                    className="block h-2 rounded-full bg-lima"
                    style={{ width: `${edad.porcentaje}%` }}
                  />
                </span>
                <span className="w-16 text-right font-texto text-sm text-lima">
                  {edad.porcentaje.toLocaleString("es-CR")}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Seccion>
  );
}
```

`components/secciones/PlanDeMedios.tsx`:

```tsx
import { useLocale, useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";
import { getMedios } from "@/lib/contenido";

export function PlanDeMedios() {
  const t = useTranslations("patrocinios");
  const idioma = useLocale() as "es" | "en";
  const medios = getMedios();

  return (
    <Seccion id="medios">
      <TituloDisplay className="text-palido">{t("mediosTitulo")}</TituloDisplay>
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="font-texto text-lg font-semibold text-lima">{t("mediosDesde")}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {t("mediosDesdeLista")
              .split("·")
              .map((item) => (
                <li key={item} className="font-texto text-hueso/85">
                  {item.trim()}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h3 className="font-texto text-lg font-semibold text-lima">{t("mediosComo")}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {medios.map((medio) => (
              <li key={medio.es} className="font-texto text-hueso/85">
                {medio[idioma]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Seccion>
  );
}
```

`components/secciones/LoQueViene.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { Kicker } from "@/components/ui/Kicker";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function LoQueViene() {
  const t = useTranslations("patrocinios");
  return (
    <Seccion id="lo-que-viene">
      <Kicker>{t("loQueVieneEdicion")}</Kicker>
      <TituloDisplay className="mt-4 text-lima">{t("loQueVieneTitulo")}</TituloDisplay>
      <ul className="mt-10 flex max-w-2xl flex-col gap-4">
        {t("loQueViene")
          .split("·")
          .map((item) => (
            <li key={item} className="border-l-2 border-lima pl-4 font-texto text-lg text-hueso/90">
              {item.trim()}
            </li>
          ))}
      </ul>
    </Seccion>
  );
}
```

`components/secciones/Mercadito.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export function Mercadito() {
  const t = useTranslations("patrocinios");
  return (
    <section id="mercadito" className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      <Image src="/img/mercadito-01.jpg" alt="" fill sizes="100vw" className="-z-10 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noche/70" />
      <TituloDisplay className="text-palido">{t("mercaditoTitulo")}</TituloDisplay>
      <p className="mt-6 max-w-xl font-texto text-lg text-hueso/90">{t("mercaditoCuerpo")}</p>
      {/* PENDIENTE DEL CLIENTE: no hay precio ni condiciones del stand del Mercadito.
          Spec §10.4. El CTA lleva al formulario general hasta que los defina. */}
      <Link href="#propuesta"
            className="mt-8 inline-block border-b border-lima pb-1 font-texto text-lima">
        {t("mercaditoCta")}
      </Link>
    </section>
  );
}
```

- [ ] **Step 5: Montar la página**

`app/[lang]/patrocinios/page.tsx` con el orden del spec: hero → NuestroPublico → Cifras → PlanDeMedios → LoQueViene → Paquetes → Mercadito → MarcasQueConfian → FormPropuesta. Un solo `<h1>`, en el hero.

- [ ] **Step 6: Correr los tests**

```bash
npm run test:e2e -- patrocinios
```
Esperado: 14 passed. Si falla el test de precios, buscar qué componente está imprimiendo `inversionUSD` y quitarlo — el dato se guarda, no se muestra.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Agrega la pagina de patrocinios que reemplaza al PDF"
```

---

### Task 12: Road to Dharma, 2027 y nosotros

Las tres páginas de apoyo. Su copy es borrador y va marcado como tal.

**Files:**
- Create: `app/[lang]/road-to-dharma/page.tsx`, `app/[lang]/2027/page.tsx`, `app/[lang]/nosotros/page.tsx`, `app/[lang]/not-found.tsx`
- Modify: `content/copy/es.json`, `content/copy/en.json`
- Test: `tests/e2e/paginas.spec.ts`

**Interfaces:**
- Consumes: primitivas de Task 6, contenido de Task 5, `FormComunidad` de Task 10.
- Produces: las rutas restantes. Cada página exporta su propio `generateMetadata` con título propio.

- [ ] **Step 1: Escribir el test**

`tests/e2e/paginas.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const RUTAS = ["/road-to-dharma", "/2027", "/nosotros"];

for (const ruta of RUTAS) {
  test(`${ruta} responde y tiene un solo h1`, async ({ page }) => {
    const respuesta = await page.goto(ruta);
    expect(respuesta?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test(`${ruta} tiene título de página propio`, async ({ page }) => {
    await page.goto(ruta);
    const titulo = await page.title();
    expect(titulo.length).toBeGreaterThan(0);
    expect(titulo).not.toBe("Dharma Fest");
  });

  test(`${ruta} no tiene violaciones de accesibilidad`, async ({ page }) => {
    await page.goto(ruta);
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(violations).toEqual([]);
  });
}

test("una ruta inexistente da 404 con página propia", async ({ page }) => {
  const respuesta = await page.goto("/no-existe-esta-pagina");
  expect(respuesta?.status()).toBe(404);
  await expect(page.locator("h1")).toBeVisible();
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm run test:e2e -- paginas
```
Esperado: FAIL, las rutas dan 404.

- [ ] **Step 3: Escribir el copy, marcando los borradores**

En `content/copy/es.json`, añadir una sección `borrador` con las cadenas que el cliente aún no aprobó. La clave del asunto: **que se note en el código cuáles son inventadas**.

```json
{
  "borrador": {
    "_nota": "BORRADOR. Copy escrito por nosotros, pendiente de aprobación del cliente. Ver spec §8.",
    "roadTitulo": "Road to Dharma",
    "roadIntro": "El festival es el encuentro anual. Road to Dharma es la comunidad todo el año.",
    "roadCuerpo": "Entre una edición y otra del Dharma Fest, la comunidad no se apaga. Los Road to Dharma son experiencias de 80 a 200 personas: lo bastante chicas para que te hablen por tu nombre, lo bastante seguidas para que el bienestar deje de ser un evento al año y pase a ser una costumbre.",
    "festivalTitulo": "Dharma Fest 2027",
    "festivalIntro": "La cuarta edición. Por primera vez, dos días completos.",
    "festivalFechaPendiente": "Fecha por confirmar",
    "nosotrosTitulo": "Nosotros",
    "nosotrosCuerpo": "Producimos las mejores experiencias de bienestar de Costa Rica. Conectamos personas con lo que las hace sentir bien y a las marcas, con su público meta.",
    "noEncontradaTitulo": "Esta página no existe",
    "noEncontradaCuerpo": "Puede que el enlace esté viejo. Volvé al inicio y seguí desde ahí.",
    "volverAlInicio": "Volver al inicio"
  }
}
```

- [ ] **Step 4: Escribir las tres páginas y el 404**

Cada una sigue el mismo molde. `app/[lang]/road-to-dharma/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormComunidad } from "@/components/formularios/FormComunidad";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "borrador" });
  return { title: `${t("roadTitulo")} · Dharma Fest` };
}

export default async function RoadPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("borrador");

  return (
    <main id="contenido" tabIndex={-1}>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden">
        <Image src="/img/road-to-dharma-01.jpg" alt="" fill priority sizes="100vw"
               className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-noche to-noche/30" />
        <div className="relative z-10 px-6 pb-20 md:px-12 lg:px-20">
          <TituloDisplay como="h1" className="text-palido">{t("roadTitulo")}</TituloDisplay>
          <p className="mt-6 max-w-2xl font-texto text-xl text-hueso/90">{t("roadIntro")}</p>
        </div>
      </section>
      <Seccion>
        {/* BORRADOR: copy propio, pendiente de aprobacion del cliente. Spec §8. */}
        <p className="max-w-2xl font-texto text-lg leading-relaxed text-hueso/85">
          {t("roadCuerpo")}
        </p>
      </Seccion>
      <Seccion>
        <FormComunidad />
      </Seccion>
    </main>
  );
}
```

`app/[lang]/2027/page.tsx` — mismo molde, con el aviso de fecha pendiente visible:

```tsx
        {/* PENDIENTE DEL CLIENTE: no hay fecha del festival. Spec §10.1.
            Cuando llegue, aqui va la cuenta regresiva y el JSON-LD de Event. */}
        <p className="font-texto text-lg text-lima">{t("festivalFechaPendiente")}</p>
```

`app/[lang]/nosotros/page.tsx` — mismo molde, con `nosotrosCuerpo` (que es copy literal del deck) y la sección de asociaciones aliadas reutilizando `<ImpactoSocial />`. Añadir:

```tsx
        {/* PENDIENTE DEL CLIENTE: no se sabe quien esta detras de la marca.
            Spec §10.2. Esta pagina queda corta hasta que lo digan. */}
```

`app/[lang]/not-found.tsx`:

```tsx
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Seccion } from "@/components/ui/Seccion";
import { TituloDisplay } from "@/components/ui/TituloDisplay";

export default function NoEncontrada() {
  const t = useTranslations("borrador");
  return (
    <main id="contenido" tabIndex={-1}>
      <Seccion>
        <TituloDisplay como="h1" className="text-lima">{t("noEncontradaTitulo")}</TituloDisplay>
        <p className="mt-6 font-texto text-lg text-hueso/85">{t("noEncontradaCuerpo")}</p>
        <Link href="/" className="mt-8 inline-block border-b border-lima pb-1 font-texto text-lima">
          {t("volverAlInicio")}
        </Link>
      </Seccion>
    </main>
  );
}
```

- [ ] **Step 5: Correr los tests**

```bash
npm run test:e2e -- paginas
```
Esperado: 20 passed. Quitar el `test.fixme` del test de navegación de `home-inferior.spec.ts` si se puso en Task 9, y volver a correrlo.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Agrega road to dharma, 2027, nosotros y la pagina de 404"
```

---

### Task 13: SEO, metadata y cierre

Sitemap, robots, títulos por página, `hreflang`, y limpieza del laboratorio.

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `lib/rutas.ts`
- Modify: `app/[lang]/layout.tsx` (metadata con `alternates`), todas las páginas (`generateMetadata`)
- Delete: `app/[lang]/laboratorio/page.tsx`, `tests/unit/humo.test.ts`, `tests/e2e/humo.spec.ts`
- Modify: `tests/e2e/primitivas.spec.ts` (apuntar a la home en vez del laboratorio)
- Test: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `routing` de Task 4.
- Produces: `lib/rutas.ts` exporta `RUTAS: readonly string[]` (`["", "/2027", "/road-to-dharma", "/patrocinios", "/nosotros", "/privacidad"]`) y `SITIO = "https://dharmafestcr.com"`, consumidos por el sitemap y por los `alternates`.

- [ ] **Step 1: Escribir el test**

`tests/e2e/seo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("cada página declara su alternativa en el otro idioma", async ({ page }) => {
  await page.goto("/patrocinios");
  const es = page.locator('link[rel="alternate"][hreflang="es"]');
  const en = page.locator('link[rel="alternate"][hreflang="en"]');
  await expect(es).toHaveCount(1);
  await expect(en).toHaveCount(1);
  await expect(en).toHaveAttribute("href", /\/en\/patrocinios$/);
});

test("hay canonical y no apunta a otro idioma", async ({ page }) => {
  await page.goto("/en/patrocinios");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveCount(1);
  await expect(canonical).toHaveAttribute("href", /\/en\/patrocinios$/);
});

test("el sitemap lista las rutas en ambos idiomas", async ({ request }) => {
  const respuesta = await request.get("/sitemap.xml");
  expect(respuesta.status()).toBe(200);
  const xml = await respuesta.text();
  expect(xml).toContain("/patrocinios");
  expect(xml).toContain("/en/patrocinios");
});

test("robots.txt existe y apunta al sitemap", async ({ request }) => {
  const respuesta = await request.get("/robots.txt");
  expect(respuesta.status()).toBe(200);
  expect(await respuesta.text()).toContain("sitemap");
});

test("el laboratorio ya no existe", async ({ page }) => {
  const respuesta = await page.goto("/laboratorio");
  expect(respuesta?.status()).toBe(404);
});
```

- [ ] **Step 2: Correr y verificar que falla**

```bash
npm run test:e2e -- seo
```
Esperado: FAIL en casi todo.

- [ ] **Step 3: Escribir `lib/rutas.ts`**

```ts
export const SITIO = "https://dharmafestcr.com";

/** Rutas publicas, sin prefijo de idioma. La cadena vacia es la home. */
export const RUTAS = [
  "",
  "/2027",
  "/road-to-dharma",
  "/patrocinios",
  "/nosotros",
  "/privacidad",
] as const;

export function urlDe(ruta: string, idioma: string): string {
  const prefijo = idioma === "es" ? "" : `/${idioma}`;
  return `${SITIO}${prefijo}${ruta}`;
}
```

- [ ] **Step 4: Escribir sitemap y robots**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { RUTAS, urlDe } from "@/lib/rutas";

export default function sitemap(): MetadataRoute.Sitemap {
  return RUTAS.flatMap((ruta) =>
    routing.locales.map((idioma) => ({
      url: urlDe(ruta, idioma),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((otro) => [otro, urlDe(ruta, otro)]),
        ),
      },
    })),
  );
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/rutas";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITIO}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Añadir `alternates` a cada página**

En cada `generateMetadata`, además del título:

```ts
  const rutaBase = "/patrocinios"; // la que corresponda; "" en la home
  return {
    title: `…`,
    alternates: {
      canonical: urlDe(rutaBase, lang),
      languages: { es: urlDe(rutaBase, "es"), en: urlDe(rutaBase, "en") },
    },
  };
```

La home usa `rutaBase = ""`.

- [ ] **Step 6: Borrar el laboratorio y los tests de humo**

```bash
rm -rf app/\[lang\]/laboratorio tests/unit/humo.test.ts tests/e2e/humo.spec.ts
```

En `tests/e2e/primitivas.spec.ts`, cambiar los tres `page.goto("/laboratorio")` por `page.goto("/")`.

- [ ] **Step 7: Correr la verificación completa**

```bash
npm run verificar
```
Esperado: unitarios en verde, build sin errores ni advertencias de TypeScript, y toda la batería e2e en verde en los dos proyectos.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Agrega sitemap, hreflang y metadata por pagina"
```

---

### Task 14: README y cierre de la rama

**Files:**
- Create: `README.md`
- Modify: `docs/superpowers/plans/2026-09-09-dharma-fest-v2.md` (marcar tareas completas)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: la documentación de arranque del proyecto.

- [ ] **Step 1: Escribir el README**

Debe cubrir, sin adornos: qué es el proyecto, cómo levantarlo (`npm install && npm run dev`), cómo correr las pruebas (`npm run verificar`), de dónde salen las imágenes (`scripts/README.md`), **la advertencia de que no se despliega**, dónde viven los datos capturados y por qué están fuera de git, y la lista de lo que falta del cliente con enlace al spec §10.

- [ ] **Step 2: Marcar en este plan las tareas completadas**

Cambiar `- [ ]` por `- [x]` en los pasos ejecutados.

- [ ] **Step 3: Verificación final**

```bash
npm run verificar
git status --porcelain
```
Esperado: todo en verde y el árbol limpio salvo lo que se vaya a commitear.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Agrega el README y cierra la primera vuelta del sitio v2"
```

---

## Notas para quien ejecute el plan

**Lo que no se hace, aunque parezca obvio hacerlo:**

- No desplegar. Hay un MCP de Vercel conectado y Next.js lo hace de un clic. No.
- No imprimir los precios de patrocinio, aunque estén en `paquetes.json`.
- No inventar la política de privacidad, la fecha del festival, ni quién está detrás de la marca. Si falta el dato, se deja el comentario `PENDIENTE DEL CLIENTE` y se sigue.
- No poner `alt` inventados en fotos de personas reales que no conocemos. Foto decorativa, `alt=""`.
- No reemplazar `palido` (`#E4E8AD`) por un beige.

**Si un test falla por nombres de archivo de imagen:** Task 2 genera los nombres, y las tareas 5 en adelante los consumen. Ante una discrepancia, la fuente de verdad es `content/manifiesto-imagenes.json`, no lo que este plan escribió a mano.
