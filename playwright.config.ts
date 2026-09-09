import { defineConfig, devices } from "@playwright/test";

const PUERTO = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
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
    env: { DHARMA_DIST_DIR: ".next-test" },
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
