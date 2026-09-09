import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PALETA, TOKEN_CSS, type NombreToken } from '../../src/lib/palette';

const tokensCss = readFileSync(resolve('src/styles/tokens.css'), 'utf8');

describe('tokens.css refleja la paleta', () => {
  const nombres = Object.keys(PALETA) as NombreToken[];

  it.each(nombres)('define %s con el hex de PALETA', (nombre) => {
    const declaracion = `${TOKEN_CSS[nombre]}: ${PALETA[nombre]};`;
    expect(tokensCss).toContain(declaracion);
  });

  it('declara las dos familias tipográficas', () => {
    expect(tokensCss).toContain('--font-display:');
    expect(tokensCss).toContain('--font-ui:');
  });
});
