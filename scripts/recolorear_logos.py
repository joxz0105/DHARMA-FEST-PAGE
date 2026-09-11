"""Recolorea a tinta los logos que vienen blancos del deck.

Los logos del PDF de patrocinios estan pintados de blanco, porque ahi viven
sobre laminas oscuras. El sitio es claro: sobre papel blanco desaparecen.

Este script les cambia el color conservando el canal alfa, que es lo que
mantiene el antialias limpio. Es idempotente: si un logo ya esta oscuro, lo
deja igual, asi que se puede correr las veces que haga falta.

    python scripts/recolorear_logos.py

Se corre despues de extraer_imagenes.py. La salida esta commiteada.
"""
import json
import pathlib
import sys

from PIL import Image

TINTA = (28, 42, 20)  # --color-tinta #1C2A14
GRUPOS = {"logo-marca", "logo-asociacion"}
UMBRAL_CLARO = 200  # media de luminosidad a partir de la cual se considera blanco


def es_claro(img: Image.Image) -> bool:
    """Mira solo los pixeles opacos: el fondo transparente no cuenta."""
    pixeles = [p for p in img.getdata() if p[3] > 200]
    if not pixeles:
        return False
    media = sum((p[0] + p[1] + p[2]) / 3 for p in pixeles) / len(pixeles)
    return media >= UMBRAL_CLARO


def main() -> int:
    manifiesto = json.loads(
        pathlib.Path("content/manifiesto-imagenes.json").read_text(encoding="utf-8")
    )
    carpeta = pathlib.Path("public/img")
    recoloreados = 0
    saltados = 0

    for entrada in manifiesto:
        if entrada["grupo"] not in GRUPOS:
            continue
        ruta = carpeta / entrada["archivo"]
        if not ruta.exists():
            print(f"  falta: {entrada['archivo']}", file=sys.stderr)
            continue

        img = Image.open(ruta).convert("RGBA")
        if not es_claro(img):
            saltados += 1
            continue

        # Mantiene el alfa tal cual y solo reemplaza el color.
        alfa = img.getchannel("A")
        solido = Image.new("RGBA", img.size, (*TINTA, 255))
        solido.putalpha(alfa)
        solido.save(ruta, "PNG", optimize=True)
        recoloreados += 1

    print(f"recoloreados: {recoloreados}   ya oscuros: {saltados}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
