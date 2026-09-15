import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * SITIO se calcula al cargar el modulo, asi que cada caso tiene que pedir una
 * copia limpia con resetModules despues de mover el entorno.
 */
async function cargarSitio() {
  vi.resetModules();
  return (await import("@/lib/rutas")).SITIO;
}

describe("origen del sitio", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITIO", undefined);
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("manda NEXT_PUBLIC_SITIO cuando está puesto", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITIO", "https://dharmafestcr.com");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "no-deberia-usarse.vercel.app");
    expect(await cargarSitio()).toBe("https://dharmafestcr.com");
  });

  it("si no, usa el dominio de producción que expone Vercel", async () => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "dharma-fest-page.vercel.app");
    expect(await cargarSitio()).toBe("https://dharma-fest-page.vercel.app");
  });

  it("en local cae en localhost y no en un dominio inventado", async () => {
    // Antes esto era "https://dharmafestcr.com" fijo, un dominio que no
    // resuelve, y produccion mandaba a Google a una pagina inexistente.
    expect(await cargarSitio()).toBe("http://localhost:3000");
  });

  it("le quita la barra final para no armar URLs con doble barra", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITIO", "https://dharmafestcr.com/");
    const { urlDe } = (vi.resetModules(), await import("@/lib/rutas"));
    expect(urlDe("/patrocinios", "es")).toBe("https://dharmafestcr.com/patrocinios");
  });

  it("la canónica de cada idioma apunta a su propia página", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITIO", "https://dharmafestcr.com");
    vi.resetModules();
    const { alternativas } = await import("@/lib/rutas");
    const en = alternativas("/patrocinios", "en");
    expect(en.canonical).toBe("https://dharmafestcr.com/en/patrocinios");
    expect(en.languages.es).toBe("https://dharmafestcr.com/patrocinios");
  });
});
