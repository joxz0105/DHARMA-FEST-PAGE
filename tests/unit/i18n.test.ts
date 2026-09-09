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
