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

describe('pares de la paleta que el diseño usa', () => {
  it('salvia sobre lino cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.salvia, PALETA.lino)).toBe(true);
  });

  it('bosque sobre lino cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.bosque, PALETA.lino)).toBe(true);
  });

  it('piedra sobre lino cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.piedra, PALETA.lino)).toBe(true);
  });

  it('arena sobre bosque cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.arena, PALETA.bosque)).toBe(true);
  });

  it('copal sobre bosque cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.copal, PALETA.bosque)).toBe(true);
  });

  it('copalInk sobre lino cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.copalInk, PALETA.lino)).toBe(true);
  });
});

describe('la regla que motiva copalInk', () => {
  it('copal sobre lino NO cumple AA en texto pequeño', () => {
    expect(cumpleAA(PALETA.copal, PALETA.lino)).toBe(false);
  });

  it('copal sobre lino sí cumple AA en texto grande', () => {
    expect(cumpleAA(PALETA.copal, PALETA.lino, true)).toBe(true);
  });
});
