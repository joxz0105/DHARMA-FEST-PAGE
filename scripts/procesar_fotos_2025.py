"""Pasa las fotos del Dharma Fest 2025 a tamano web.

El cliente entrego 63 fotos profesionales en original, de hasta 40 MB cada una.
Servirlas asi seria absurdo: se reducen a 1800px de ancho y calidad 78, que es
de sobra para fondos a pantalla completa y deja el total en unos 20 MB.

    python scripts/procesar_fotos_2025.py "ruta/a/Fotos Dharma Fest 2025"

El nombre de salida conserva el numero de la camara (2025-dsc8733.jpg) para
poder rastrear cada foto hasta su original. La salida esta commiteada; los
originales no, viven en `info compartida/` y esa carpeta esta en .gitignore.
"""
import json
import pathlib
import sys

from PIL import Image, ImageOps

ANCHO_MAXIMO = 1800
CALIDAD = 78


def main() -> int:
    if len(sys.argv) < 2:
        print("Falta la carpeta de fotos", file=sys.stderr)
        return 1

    origen = pathlib.Path(sys.argv[1])
    if not origen.is_dir():
        print(f"No existe: {origen}", file=sys.stderr)
        return 1

    destino = pathlib.Path("public/img/2025")
    destino.mkdir(parents=True, exist_ok=True)

    manifiesto = []
    for archivo in sorted(origen.glob("*.jpg")):
        img = Image.open(archivo)
        # draft() decodifica ya reducido: mucho mas rapido en originales de 40 MB
        img.draft("RGB", (ANCHO_MAXIMO * 2, ANCHO_MAXIMO * 2))
        img = ImageOps.exif_transpose(img).convert("RGB")

        if img.width > ANCHO_MAXIMO:
            alto = round(img.height * ANCHO_MAXIMO / img.width)
            img = img.resize((ANCHO_MAXIMO, alto), Image.LANCZOS)

        nombre = f"2025-{archivo.stem.lstrip('_').lower()}.jpg"
        img.save(destino / nombre, "JPEG", quality=CALIDAD, optimize=True, progressive=True)
        manifiesto.append(
            {
                "archivo": f"2025/{nombre}",
                "ancho": img.width,
                "alto": img.height,
                "orientacion": "apaisada" if img.width >= img.height else "vertical",
            }
        )

    salida = pathlib.Path("content/fotos-2025.json")
    salida.write_text(json.dumps(manifiesto, indent=2, ensure_ascii=False), encoding="utf-8")

    peso = sum((destino / m["archivo"].split("/")[-1]).stat().st_size for m in manifiesto)
    print(f"{len(manifiesto)} fotos en {destino}  ({peso / 1e6:.0f} MB)")
    apaisadas = sum(1 for m in manifiesto if m["orientacion"] == "apaisada")
    print(f"  apaisadas: {apaisadas}   verticales: {len(manifiesto) - apaisadas}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
