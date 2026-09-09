import { describe, expect, it } from 'vitest';
import { debeAnimar, retrasoEscalonado } from '../../src/lib/motion';

describe('debeAnimar', () => {
  it('no anima si la persona pidió menos movimiento', () => {
    expect(debeAnimar(true)).toBe(false);
  });

  it('anima en el caso normal', () => {
    expect(debeAnimar(false)).toBe(true);
  });
});

describe('retrasoEscalonado', () => {
  it('el primer elemento no espera', () => {
    expect(retrasoEscalonado(0)).toBe(0);
  });

  it('escalona de 80 en 80 milisegundos', () => {
    expect(retrasoEscalonado(1)).toBe(80);
    expect(retrasoEscalonado(3)).toBe(240);
  });

  it('topa a 400 ms para que una lista larga no se sienta lenta', () => {
    expect(retrasoEscalonado(20)).toBe(400);
  });
});
