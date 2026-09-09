import { describe, expect, it } from 'vitest';
import { countdownParts } from '../../src/lib/countdown';

const ahora = new Date('2026-09-08T12:00:00Z');

describe('countdownParts', () => {
  it('cuenta días, horas y minutos completos', () => {
    const objetivo = new Date('2026-09-11T15:30:00Z');
    expect(countdownParts(objetivo, ahora)).toEqual({ dias: 3, horas: 3, minutos: 30 });
  });

  it('trunca los segundos en vez de redondear', () => {
    const objetivo = new Date('2026-09-08T12:01:59Z');
    expect(countdownParts(objetivo, ahora)).toEqual({ dias: 0, horas: 0, minutos: 1 });
  });

  it('devuelve null si el objetivo ya pasó', () => {
    expect(countdownParts(new Date('2026-09-07T12:00:00Z'), ahora)).toBeNull();
  });

  it('devuelve null en el instante exacto del objetivo', () => {
    expect(countdownParts(ahora, ahora)).toBeNull();
  });

  it('maneja distancias largas sin desbordar los días', () => {
    const objetivo = new Date('2027-09-08T12:00:00Z');
    expect(countdownParts(objetivo, ahora)?.dias).toBe(365);
  });
});
