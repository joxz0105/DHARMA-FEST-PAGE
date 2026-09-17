"""Recorta el margen transparente de los logos de marca.

Los PNG del deck traen mucho aire alrededor: Cuarzo Rosa ocupa el 10% de su
archivo y Piel y Mente el 14%. Con object-contain el navegador escala la caja
entera, aire incluido, y en las tarjetas de Beneficios Dharma esos logos
salian diminutos al lado de los que vienen justos.

Las copias recortadas van a public/img/logos-recortados/ y NO pisan los
originales, por dos motivos: el muro de logos de /patrocinios ya esta aprobado
tal como se ve, y extraer_imagenes.py regenera los originales desde el PDF.

Recorta todas las marcas de marcas.json, no solo las que hoy estan en
beneficios.json: asi una marca nueva en el catalogo ya tiene su copia.
Es idempotente.

    python scripts/recortar_logos.py

Se corre despues de recolorear_logos.py. La salida esta commiteada.
"""
import json
import pathlib
import sys

from PIL import Image

ORIGEN = pathlib.Path("public/img")
DESTINO = pathlib.Path("public/img/logos-recortados")
UMBRAL_ALFA = 16  # por debajo, el pixel es antialias perdido y no cuenta como logo
MARGEN = 0.04  # aire que se deja alrededor, relativo al lado mayor


def recortar(img: Image.Image) -> Image.Image:
    alfa = img.getchannel("A").point(lambda v: 255 if v > UMBRAL_ALFA else 0)
    caja = alfa.getbbox()
    if caja is None:
        return img
    izq, arr, der, aba = caja
    margen = round(max(der - izq, aba - arr) * MARGEN)
    caja = (
        max(izq - margen, 0),
        max(arr - margen, 0),
        min(der + margen, img.width),
        min(aba + margen, img.height),
    )
    return img.crop(caja)


def main() -> int:
    marcas = json.loads(pathlib.Path("content/marcas.json").read_text(encoding="utf-8"))
    DESTINO.mkdir(parents=True, exist_ok=True)
    faltan = 0

    for marca in marcas:
        ruta = ORIGEN / marca["logo"]
        if not ruta.exists():
            print(f"  falta: {marca['logo']}", file=sys.stderr)
            faltan += 1
            continue
        img = Image.open(ruta).convert("RGBA")
        recortada = recortar(img)
        recortada.save(DESTINO / marca["logo"], "PNG", optimize=True)
        antes = img.width * img.height
        despues = recortada.width * recortada.height
        print(f"  {marca['logo']:15} {img.size} -> {recortada.size}  ({100 * despues / antes:.0f}%)")

    print(f"recortados: {len(marcas) - faltan}   faltan: {faltan}")
    return 1 if faltan else 0


if __name__ == "__main__":
    raise SystemExit(main())
