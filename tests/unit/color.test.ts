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

describe('anillo de foco', () => {
  // src/styles/global.css dibuja el foco con dos tonos: un aro bosque
  // (outline) sobre un halo lino (box-shadow). En cada fondo del sitio,
  // al menos uno de los dos debe cumplir el 3:1 que exige WCAG 2.1 SC 1.4.11
  // para indicadores de foco. Este test es la guarda contra volver a usar
  // copal, que nunca llega a 3:1 sobre lino ni arena.
  const fondosDelSitio = [
    ['lino', PALETA.lino],
    ['arena', PALETA.arena],
    ['bosque', PALETA.bosque],
    ['bosqueDeep', PALETA.bosqueDeep],
  ] as const;

  const NIVEL_MINIMO_NO_TEXTO = 3;

  it.each(fondosDelSitio)('el anillo de foco cumple 3:1 sobre %s', (_nombre, fondo) => {
    const contrasteAro = contrastRatio(PALETA.bosque, fondo);
    const contrasteHalo = contrastRatio(PALETA.lino, fondo);
    const mejorContraste = Math.max(contrasteAro, contrasteHalo);
    expect(mejorContraste).toBeGreaterThanOrEqual(NIVEL_MINIMO_NO_TEXTO);
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
