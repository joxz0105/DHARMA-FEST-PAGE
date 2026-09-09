"""Extrae las imagenes del deck de patrocinios a public/img/.

Uso:
    python scripts/extraer_imagenes.py "ruta/al/deck.pdf"

Requiere: pip install pymupdf pillow
Se corre una sola vez; la salida se commitea.
"""
import io
import json
import pathlib
import sys

import pymupdf
from PIL import Image

# Como se llama cada lamina del deck. Da el prefijo del nombre de archivo.
# El grupo NO sale de aqui: lo decide clasificar(), que mira el tamano real.
LAMINAS = {
    1: "portada",
    2: "quienes-somos",
    3: "por-que-dharma",
    4: "perfil-publico",
    5: "actividades",
    6: "temas",
    7: "galeria-1",
    8: "galeria-2",
    9: "galeria-3",
    10: "comunidad-cifras",
    11: "road-to-dharma",
    12: "espacios",
    13: "salones",
    14: "mercadito",
    15: "impacto-social",
    16: "plan-de-medios",
    17: "tier-oficial",
    18: "tier-oro",
    19: "tier-plata",
    20: "marcas",
    21: "contacto",
}

ANCHO_MAXIMO = 2000  # ninguna foto del sitio necesita mas
CALIDAD = 82


def clasificar(pagina: int, ancho: int, alto: int) -> str:
    """Un logo es una imagen pequena; el fondo es la textura de selva repetida."""
    if ancho < 900:
        if pagina == 15:
            return "logo-asociacion"
        if pagina == 20:
            return "logo-marca"
        if pagina in (1, 13, 21):
            return "logo-dharma"
        return "otro"
    if ancho == 2400 and alto == 3600:
        return "fondo"
    return "foto"


def abrir_con_alfa(doc, xref: int, smask: int, crudo: bytes) -> tuple[Image.Image, bool]:
    """Devuelve la imagen con su transparencia, y si la tiene.

    Los logos del deck son PNG recortados, pero el PDF guarda el color y el alfa
    por separado. Sin volver a unirlos, cada logo sale con un rectangulo de fondo.
    """
    if smask:
        try:
            base = pymupdf.Pixmap(doc, xref)
            mascara = pymupdf.Pixmap(doc, smask)
            if base.alpha:  # ya trae alfa: no se le puede aplicar otra mascara
                base = pymupdf.Pixmap(base, 0)
            unida = pymupdf.Pixmap(base, mascara)
            return Image.open(io.BytesIO(unida.tobytes("png"))), True
        except (ValueError, RuntimeError):
            pass  # formato raro: mejor la base sin alfa que reventar

    img = Image.open(io.BytesIO(crudo))
    return img, img.mode in ("RGBA", "LA", "P")


def main() -> int:
    if len(sys.argv) < 2:
        print("Falta la ruta del PDF", file=sys.stderr)
        return 1

    pdf = pathlib.Path(sys.argv[1])
    if not pdf.exists():
        print(f"No existe: {pdf}", file=sys.stderr)
        return 1

    salida = pathlib.Path("public/img")
    salida.mkdir(parents=True, exist_ok=True)

    doc = pymupdf.open(pdf)
    manifiesto = []
    vistos = set()
    contadores: dict[str, int] = {}

    for indice in range(doc.page_count):
        pagina = indice + 1
        nombre_lamina = LAMINAS.get(pagina, f"pagina-{pagina}")

        for imagen in doc[indice].get_images(full=True):
            xref = imagen[0]
            if xref in vistos:
                continue
            vistos.add(xref)

            # imagen[1] es el xref de la mascara alfa (smask), 0 si no tiene.
            # extract_image() devuelve SOLO la imagen base: si nos quedamos con
            # eso, los logos recortados salen con un rectangulo de fondo.
            smask = imagen[1]
            crudo = doc.extract_image(xref)
            grupo = clasificar(pagina, crudo["width"], crudo["height"])

            # La textura de fondo se repite en seis laminas; basta con una copia.
            if grupo == "fondo" and any(m["grupo"] == "fondo" for m in manifiesto):
                continue

            contadores[nombre_lamina] = contadores.get(nombre_lamina, 0) + 1
            base = f"{nombre_lamina}-{contadores[nombre_lamina]:02d}"

            img, transparente = abrir_con_alfa(doc, xref, smask, crudo["image"])

            if img.width > ANCHO_MAXIMO:
                alto_nuevo = round(img.height * ANCHO_MAXIMO / img.width)
                img = img.resize((ANCHO_MAXIMO, alto_nuevo), Image.LANCZOS)

            if transparente:
                archivo = f"{base}.png"
                img.convert("RGBA").save(salida / archivo, "PNG", optimize=True)
            else:
                archivo = f"{base}.jpg"
                img.convert("RGB").save(
                    salida / archivo, "JPEG", quality=CALIDAD, optimize=True, progressive=True
                )

            manifiesto.append(
                {
                    "archivo": archivo,
                    "ancho": img.width,
                    "alto": img.height,
                    "pagina": pagina,
                    "grupo": grupo,
                }
            )

    destino = pathlib.Path("content/manifiesto-imagenes.json")
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(manifiesto, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"{len(manifiesto)} imagenes en {salida}")
    for grupo in sorted({m["grupo"] for m in manifiesto}):
        print(f"  {grupo}: {sum(1 for m in manifiesto if m['grupo'] == grupo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
