import { describe, expect, it } from 'vitest';
import { getCopy } from '../../src/lib/copy';

/** Recorre un objeto anidado y devuelve todas las rutas de sus hojas. */
function rutasDeHoja(valor: unknown, prefijo = ''): string[] {
  if (Array.isArray(valor)) {
    return valor.flatMap((item, i) => rutasDeHoja(item, `${prefijo}[${i}]`));
  }
  if (valor !== null && typeof valor === 'object') {
    return Object.entries(valor).flatMap(([clave, v]) =>
      rutasDeHoja(v, prefijo ? `${prefijo}.${clave}` : clave),
    );
  }
  return [prefijo];
}

function hojas(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.flatMap(hojas);
  if (valor !== null && typeof valor === 'object') return Object.values(valor).flatMap(hojas);
  return [String(valor)];
}

describe('paridad entre idiomas', () => {
  it('español e inglés tienen exactamente las mismas claves', () => {
    expect(rutasDeHoja(getCopy('en')).sort()).toEqual(rutasDeHoja(getCopy('es')).sort());
  });

  it('ningún texto quedó vacío', () => {
    for (const lang of ['es', 'en'] as const) {
      expect(hojas(getCopy(lang)).filter((t) => t.trim() === '')).toEqual([]);
    }
  });

  it('los siete ejes están completos en ambos idiomas', () => {
    expect(getCopy('es').ejes).toHaveLength(7);
    expect(getCopy('en').ejes).toHaveLength(7);
  });
});
