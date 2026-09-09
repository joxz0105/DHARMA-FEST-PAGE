# Scripts

## `extraer_imagenes.py`

Saca las imágenes del deck de patrocinios del cliente, las redimensiona a un máximo
de 2000px de ancho y escribe `content/manifiesto-imagenes.json`.

Se corre **una sola vez**; la salida está commiteada. Solo hace falta volver a
correrlo si el cliente entrega un deck nuevo.

```
python -m pip install pymupdf pillow
python scripts/extraer_imagenes.py "ruta/al/deck.pdf"
```

El PDF **no** está en el repositorio: pesa 185 MB y es material del cliente.

### Por qué reconstruye el canal alfa

Los logos del deck son recortes con transparencia, pero un PDF guarda el color y la
máscara alfa como dos objetos separados. `extract_image()` devuelve solo el color:
si uno se queda con eso, los 61 logos de marcas salen con un rectángulo de fondo
que se ve fatal sobre el verde de marca. `abrir_con_alfa()` vuelve a unir ambos.

Hay un test que lo vigila: `tests/unit/manifiesto.test.ts` falla si algún logo
quedó como JPEG.

### Lo que el script NO puede decidir

Clasifica por tamaño, y eso alcanza para separar fotos de logos, pero **no** para
saber qué foto corresponde a cuál actividad o tema. Ese pareo se hizo mirando las
imágenes y está escrito a mano en `content/actividades.json` y `content/temas.json`.
Si se vuelve a correr el script con un deck nuevo, hay que revisar ese pareo.
