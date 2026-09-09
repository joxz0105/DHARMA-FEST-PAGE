export interface PartesCuenta {
  dias: number;
  horas: number;
  minutos: number;
}

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

/**
 * Distancia entre `ahora` y `objetivo`, partida en días, horas y minutos.
 * Devuelve null si el objetivo ya llegó o pasó, para que la vista sepa
 * que no debe mostrar contador.
 */
export function countdownParts(objetivo: Date, ahora: Date): PartesCuenta | null {
  const resta = objetivo.getTime() - ahora.getTime();
  if (resta <= 0) return null;

  return {
    dias: Math.floor(resta / DIA),
    horas: Math.floor((resta % DIA) / HORA),
    minutos: Math.floor((resta % HORA) / MINUTO),
  };
}
