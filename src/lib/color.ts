/** Convierte `#RGB` o `#RRGGBB` a sus tres canales 0-255. */
function canales(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '').trim();
  const expandido =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;

  if (!/^[0-9a-fA-F]{6}$/.test(expandido)) {
    throw new Error(`Hex inválido: ${hex}`);
  }

  return [
    parseInt(expandido.slice(0, 2), 16),
    parseInt(expandido.slice(2, 4), 16),
    parseInt(expandido.slice(4, 6), 16),
  ];
}

/** Luminancia relativa según WCAG 2.1. */
function luminancia(hex: string): number {
  const [r, g, b] = canales(hex).map((canal) => {
    const s = canal / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste WCAG entre dos colores. Va de 1 a 21. */
export function contrastRatio(hexA: string, hexB: string): number {
  const a = luminancia(hexA);
  const b = luminancia(hexB);
  const claro = Math.max(a, b);
  const oscuro = Math.min(a, b);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * ¿El par cumple WCAG AA?
 * Texto normal necesita 4.5:1. Texto grande (≥24 px, o ≥18.66 px en negrita) necesita 3:1.
 */
export function cumpleAA(hexTexto: string, hexFondo: string, textoGrande = false): boolean {
  const minimo = textoGrande ? 3 : 4.5;
  return contrastRatio(hexTexto, hexFondo) >= minimo;
}
