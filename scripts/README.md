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

## `recolorear_logos.py`

Los 61 logos de marcas y los 4 de asociaciones vienen **blancos** del deck,
porque ahí viven sobre láminas oscuras. El sitio es claro: sobre papel blanco
desaparecen por completo.

Este script les cambia el color a `--color-tinta` conservando el canal alfa.
Es idempotente, así que se puede correr las veces que haga falta.

```
python scripts/recolorear_logos.py
```

Se corre **después** de `extraer_imagenes.py`. La salida está commiteada.

## `recortar_logos.py`

Los PNG del deck traen mucho margen transparente: Cuarzo Rosa ocupa el 10% de su
archivo. Con `object-contain` el navegador escala la caja entera, margen incluido,
y en las tarjetas de Beneficios Dharma esos logos salían diminutos.

Este script escribe copias recortadas en `public/img/logos-recortados/`, para
**todas** las marcas de `content/marcas.json`, así una marca que se sume al
catálogo ya tiene la suya. No pisa los originales: el muro de logos de
`/patrocinios` ya está aprobado como se ve, y `extraer_imagenes.py` los
regeneraría.

```
python scripts/recortar_logos.py
```

Se corre **después** de `recolorear_logos.py`, porque recorta los logos ya
pasados a tinta. La salida está commiteada. Si una marca nueva no tiene su copia,
`tests/unit/contenido.test.ts` lo avisa.

### Si cambiás una imagen y el navegador sigue mostrando la vieja

Next 16 cachea las imágenes ya optimizadas en **`.next/dev/cache/images`** —
no en `.next/cache/images`, que es donde uno las busca primero. Ahí guarda
también las variantes AVIF, que son las que sirve al navegador aunque `curl`
reciba el PNG.

Para verlo actualizado hay que **apagar el servidor**, borrar esa carpeta y
volver a levantarlo. Borrarla con el servidor corriendo no alcanza: la vuelve
a escribir al salir.

```
rm -rf .next/dev/cache/images
```

No afecta a las pruebas: los e2e corren contra un build de producción en
`.next-test`, que se genera de cero en cada corrida.
