import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

const carpeta = mkdtempSync(path.join(tmpdir(), "leads-"));
vi.stubEnv("DHARMA_DIR_DATOS", carpeta);

const { guardarLead, validarCorreo } = await import("@/lib/leads");

describe("validarCorreo", () => {
  it("acepta correos normales", () => {
    for (const bueno of [
      "persona@dharmafestcr.com",
      "nombre.apellido@empresa.co.cr",
      "marca+dharma@gmail.com",
    ]) {
      expect(validarCorreo(bueno), bueno).toBe(true);
    }
  });

  it("rechaza lo que no es un correo", () => {
    for (const malo of ["", "sin-arroba", "a@b", "a@@b.com", "espacio @b.com", "a@b."]) {
      expect(validarCorreo(malo), `"${malo}"`).toBe(false);
    }
  });
});

describe("guardarLead", () => {
  it("escribe una línea JSON por lead, sin pisar la anterior", async () => {
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

    const lineas = readFileSync(path.join(carpeta, "leads.jsonl"), "utf8").trim().split("\n");
    expect(lineas).toHaveLength(2);
    expect(JSON.parse(lineas[0]).correo).toBe("una@persona.com");
    expect(JSON.parse(lineas[1]).marca).toBe("Marca Ejemplo");
  });

  it("guarda siempre el consentimiento y la marca de tiempo", async () => {
    const lineas = readFileSync(path.join(carpeta, "leads.jsonl"), "utf8").trim().split("\n");
    for (const linea of lineas) {
      const lead = JSON.parse(linea);
      expect(lead.consentimiento).toBe(true);
      expect(Number.isNaN(Date.parse(lead.recibidoEn))).toBe(false);
    }
  });
});
