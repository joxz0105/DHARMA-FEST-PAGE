import { describe, expect, it, vi } from 'vitest';
import { esCorreoValido, subscribe } from '../../src/lib/subscribe';

describe('esCorreoValido', () => {
  it.each([
    'hola@dharmafest.cr',
    'nombre.apellido@correo.co.cr',
    'a+etiqueta@dominio.com',
  ])('acepta %s', (correo) => {
    expect(esCorreoValido(correo)).toBe(true);
  });

  it.each([
    '',
    '   ',
    'sinarroba.com',
    'dos@@arrobas.com',
    'sin@dominio',
    'con espacio@correo.com',
  ])('rechaza %s', (correo) => {
    expect(esCorreoValido(correo)).toBe(false);
  });

  it('ignora espacios alrededor', () => {
    expect(esCorreoValido('  hola@dharmafest.cr  ')).toBe(true);
  });
});

describe('subscribe', () => {
  it('rechaza un correo inválido sin llamar al proveedor', async () => {
    const resultado = await subscribe('no-es-correo', 'es');
    expect(resultado).toEqual({ ok: false, error: 'correo-invalido' });
  });

  it('acepta un correo válido con el adaptador de consola', async () => {
    const espia = vi.spyOn(console, 'info').mockImplementation(() => {});

    const resultado = await subscribe('hola@dharmafest.cr', 'es');

    expect(resultado).toEqual({ ok: true });
    expect(espia).toHaveBeenCalledWith(
      '[dharma] suscripción simulada',
      { correo: 'hola@dharmafest.cr', lang: 'es' },
    );

    espia.mockRestore();
  });

  it('normaliza el correo antes de entregarlo al proveedor', async () => {
    const espia = vi.spyOn(console, 'info').mockImplementation(() => {});

    await subscribe('  HOLA@Dharmafest.CR ', 'en');

    expect(espia).toHaveBeenCalledWith(
      '[dharma] suscripción simulada',
      { correo: 'hola@dharmafest.cr', lang: 'en' },
    );

    espia.mockRestore();
  });
});
