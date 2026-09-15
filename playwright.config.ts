import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // Cada pagina carga el muro de 58 logos mas las fotos de seccion, y encima
  // axe recorre el arbol entero. Con los workers por defecto el navegador se
  // quedaba sin memoria y las paginas se caian ("Target crashed"), que parecia
  // un fallo del sitio y no lo era.
  workers: 3,
  reporter: "list",
  use: { baseURL: `http://localhost:${PUERTO}`, trace: "on-first-retry" },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Contra el build de produccion, no contra `next dev`. En dev, Next compila
    // cada ruta a demanda y bajo carga paralela los tests se caian por timeout
    // sin que hubiera nada roto. Ademas asi se prueba lo que el cliente vera.
    // Puerto propio para no pelearse con el `npm run dev` de siempre.
    command: `npm run build && npx next start -p ${PUERTO}`,
    // Directorio de build propio: si comparte .next con el `npm run dev` que
    // esta corriendo, los dos procesos se pisan los artefactos y el servidor
    // se cae a mitad de la corrida.
    // NEXT_PUBLIC_SITIO fija el origen para que las pruebas de canonica,
    // hreflang y sitemap comparen contra algo estable. Sin esto, SITIO caeria
    // en localhost y los asserts dependerian de donde corre la suite.
    env: { DHARMA_DIST_DIR: ".next-test", NEXT_PUBLIC_SITIO: "https://dharmafestcr.com" },
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
