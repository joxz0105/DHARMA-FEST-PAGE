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
