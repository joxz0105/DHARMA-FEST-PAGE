import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// El hreflang de cada experiencia (ver src/pages/experiencias/[slug].astro)
// resuelve porque los Markdown de es/ y en/ comparten nombre de archivo.
// No hay nada en astro:content que obligue a esa simetria, así que se
// verifica leyendo el directorio directamente en disco (astro:content no
// está disponible bajo Vitest).
const DIR_ES = resolve('src/content/experiencias/es');
const DIR_EN = resolve('src/content/experiencias/en');

function archivosMarkdown(dir: string): string[] {
  return readdirSync(dir).filter((archivo) => archivo.endsWith('.md'));
}

describe('paridad de archivos entre es/ y en/ en experiencias', () => {
  const archivosEs = archivosMarkdown(DIR_ES);
  const archivosEn = archivosMarkdown(DIR_EN);
  const setEs = new Set(archivosEs);
  const setEn = new Set(archivosEn);

  it.each(archivosEs)('%s tiene su par en en/', (archivo) => {
    expect(setEn.has(archivo), `Falta src/content/experiencias/en/${archivo}`).toBe(true);
  });

  it.each(archivosEn)('%s tiene su par en es/', (archivo) => {
    expect(setEs.has(archivo), `Falta src/content/experiencias/es/${archivo}`).toBe(true);
  });
});
