/** Utilidades WCAG 2.1 para verificar la paleta. Solo se usan en tests. */

function canal(valor: number): number {
  return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const limpio = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(limpio)) {
    throw new Error(`Hex inválido: ${hex}`);
  }
  const [r, g, b] = [0, 2, 4].map((i) =>
    canal(Number.parseInt(limpio.slice(i, i + 2), 16) / 255),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratio(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const alto = Math.max(la, lb);
  const bajo = Math.min(la, lb);
  return (alto + 0.05) / (bajo + 0.05);
}
