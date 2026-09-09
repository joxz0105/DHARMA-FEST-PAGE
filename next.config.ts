import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  // Las pruebas e2e corren su propio servidor de produccion en paralelo al
  // `npm run dev` de siempre. Si comparten .next se pisan los artefactos y el
  // servidor se cae a mitad de la corrida, con fallos que no son del sitio.
  distDir: process.env.DHARMA_DIST_DIR ?? ".next",
};

export default createNextIntlPlugin("./i18n/request.ts")(nextConfig);
