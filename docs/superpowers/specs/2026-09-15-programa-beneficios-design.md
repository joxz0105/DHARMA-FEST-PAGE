# Programa de beneficios — diseño

Fecha: 2026-09-15 · Revisada: 2026-09-16, tras la revisión del cliente · Extiende:
`2026-09-09-dharma-fest-v2-design.md`

## 0. Lo que pidió el cliente al verlo (2026-09-16)

Vio la sección de descuentos dentro de `/2027` y pidió tres cosas, por WhatsApp:

1. **Que fuera una pestaña aparte**, no un bloque dentro del festival.
2. **Que se viera con la diagramación del mall de Davivienda** (`compras.davivienda.cr`),
   organizada por categorías. Mandó dos capturas: el menú de categorías desplegado y una página
   de categoría («SALUD», conteo de resultados, «Ordenar», grilla de tarjetas con imagen,
   categoría en versalitas y un título tipo «COSME CLINIC: 30% DTO EN SERVICIOS MÉDICOS»).
3. **Que arriba dijera «Dharma Fest 2027» y a la par «Beneficios Dharma».** Se leyó como la barra
   de navegación, que ya tenía «Dharma Fest 2027» como primer enlace.

Eso adelantó el Tiempo 2 y cambió dos decisiones de esta spec, que quedan registradas abajo: el
porcentaje ahora va **por marca** en cada tarjeta, porque es exactamente el formato de la
referencia; y el filtro por categoría existe desde el día uno, porque es el eje del pedido.

## 1. Qué es

Un programa por el que comprar la entrada a Dharma Fest da acceso a beneficios de las marcas
aliadas. Idea nueva de la agencia, todavía en conversación con el cliente.

Dos productos distintos que la palabra "beneficios" confunde, y que este diseño separa a
propósito:

- **Regalías en el festival** — regalo físico, en el stand, canje con el brazalete. Muere con
  la edición. No hay que negociar casi nada: la marca ya está ahí vendiendo.
- **Descuentos todo el año** — en el local o la web de la marca, con vigencia declarada. Hay
  que negociarlo marca por marca.

Se descartó un tercer producto: un tier pago tipo club de socios. Es otro producto, otro precio
y otra operación; se propone en la renovación de 2028, cuando el programa tenga historial.

## 2. Lo que el material dice, y lo que no

**No hay antecedente de descuentos.** Se revisaron los dos `.docx`, el `.xlsx`, el deck de
patrocinios y todo `content/`: cero menciones a descuento, cupón, código, canje, membresía,
convenio o voucher. Esta pestaña no hereda ninguna promesa.

**Sí hay antecedente de regalías.** `Cronograma.docx` documenta el Mercadito 2025 marca por
marca: Nikkos repartió 1.000 regalías, Brixta para VIP y general, dōTERRA kits para VIP,
Ecomuna para 70 personas. Cantidad limitada, por orden de llegada, escalonado por tipo de pase.
El Tiempo 1 describe **ese** mecanismo, que ya existe y ya funcionó.

**El deck no le pide nada a las marcas hacia el público.** Los 30 beneficios de los tres
paquetes son cosas que Dharma le da a la marca; lo único que la marca entrega es plata. Ninguna
de las 58 está obligada hoy a dar un beneficio: cada una se negocia de cero.

**Las 58 de `marcas.json` no son los patrocinadores de 2027.** Es un muro acumulado de
ediciones pasadas. Nada en el material dice cuáles siguen activas.

## 3. Dos tiempos

El trabajo de verdad no es la página (medio día a tres días) sino conseguir los beneficios por
escrito, y eso es del cliente. Un enfoque que necesite las 58 confirmadas es un enfoque que no
se lanza. De ahí la separación:

| | Tiempo 1 | Tiempo 2 |
|---|---|---|
| Dónde | Sección en `/2027` | Pestaña **Beneficios Dharma**, `/beneficios` |
| Qué muestra | El mecanismo + el rango de descuento | El catálogo por categorías |
| Marcas | Ninguna nombrada | 15, **de ejemplo** |
| Estado | **Hecho** | **Hecho como maqueta**; publicable cuando confirmen |

## 4. Tiempo 1 — «Qué incluye tu entrada» (hecho)

`components/secciones/QueIncluye.tsx`, entre `Actividades` y `Entradas` en `/2027`. Ese orden es
deliberado: primero se construye el valor, después aparece el botón de comprar.

Tres puntos sobre el día del festival: en los stands · por orden de llegada · con el pase
Experiencia. Debajo, un bloque que anuncia los descuentos con su rango y un botón **«Ver
Beneficios Dharma»**. Cierra con la línea del canje y un enlace a `#entradas`.

Los cuatro logos que tuvo este bloque en su primera versión **se sacaron**: el cliente pidió que
el catálogo viviera aparte. Hay un test que vigila que no vuelvan.

El «entre X% y Y%» **no se escribe a mano**: `getRangoDescuento()` lo calcula del catálogo. Si
alguien cambia un porcentaje, el anuncio no puede quedarse prometiendo otro número.

Fondo: `2025/2025-dsc9370.jpg`, scrim 48. Es una persona del festival 2025 con el brazalete verde
puesto. En móvil la sección es más alta y el brazalete entra en el recorte; en escritorio no, y
se prefiere el rostro.

**Pendiente del cliente:** confirmar que las regalías se repiten en 2027. Por eso el copy
describe cómo funciona el festival y no promete marcas ni cantidades.

## 5. Tiempo 2 — Beneficios Dharma (hecho como maqueta)

Pública, sin gate. Una lista abierta de descuentos **vende entradas**; una escondida no vende
ninguna, y el candado no impide que alguien pida el descuento en el local — solo impide que un
comprador real encuentre su beneficio.

### Navegación

«Beneficios Dharma» va en la barra **justo después de «Dharma Fest 2027»**, como pidió el
cliente: son las dos caras de la misma entrada. Es el quinto enlace. Se midió a 1024, 1100 y
1180 px en los dos idiomas: entra en una sola fila, sin partir ningún enlace y sin montarse
sobre el selector de idioma. Hay un test que lo vigila en esos tres anchos, que son los que el
test de desborde de la home (1280 px) se saltaba.

No se replicó el menú desplegable de categorías que tiene Davivienda en la barra. Las categorías
viven en la página, que es donde el pedido las puso («verse … por categorías»); un desplegable
en la cabecera es un paso siguiente si el cliente lo pide.

### Rutas

- `/beneficios` — todos los beneficios.
- `/beneficios/[categoria]` — una por categoría del JSON, generadas al construir. Una categoría
  que no existe da la 404 propia del sitio.

Cada categoría es **una página, no un filtro en el navegador**: el enlace de «Movimiento» se
puede mandar por WhatsApp y abre ya filtrado, y Google lo indexa. Entran solas al sitemap.

### Estructura, al molde de Davivienda

1. **Encabezado con foto**, más bajo que el resto del sitio (es un catálogo; quien entra quiere
   llegar a las tarjetas). En la página general dice «Beneficios Dharma»; en cada categoría, el
   nombre de la categoría, con su propia foto del 2025.
2. **Caja de categorías** a la izquierda, con el conteo de cada una y la activa en verde y con
   `aria-current="page"`. En móvil se vuelve una fila de pastillas que se acomoda en varias
   líneas, sin scroll lateral.
3. **Conteo de resultados y «Ordenar»**: relevancia (el orden del JSON), mayor descuento, marca
   A–Z. Es lo único del catálogo que corre en el navegador.
4. **Grilla de tarjetas**, tres columnas en escritorio: el logo sobre fondo pálido con una
   insignia «-10%», la categoría en versalitas y el título «MARCA: 10% DE DESCUENTO EN …».
5. **Cómo usar tus beneficios**: tres pasos, la condición *«cada marca otorga y honra su propio
   beneficio»*, el botón a entradas y, al pie y chico, el anzuelo para marcas hacia
   `/patrocinios#propuesta`.

### Por qué la imagen de la tarjeta es el logo y no una foto

Davivienda usa fotos promocionales. Aquí no hay fotos de producto de ninguna marca, y poner una
del festival sugeriría algo que no es. El logo va sobre `palido`: los 58 PNG están recoloreados a
tinta, que es justo lo que se lee sobre ese fondo.

Los PNG del deck traían mucho margen transparente —Cuarzo Rosa ocupa el 10% de su archivo— y
con `object-contain` esos logos salían diminutos. `scripts/recortar_logos.py` escribe copias
recortadas en `public/img/logos-recortados/`, para las 58 marcas, sin tocar los originales que
usa el muro de `/patrocinios`.

### El porcentaje ahora va por marca

La versión del 2026-09-15 declaraba el porcentaje solo como rango del programa y tenía un test
que impedía pegarlo a una marca. **El pedido del cliente lo contradice**: la referencia es
exactamente «MARCA: X% DTO EN …». Se siguió la referencia y se reemplazó ese test.

La consecuencia es la que ya estaba escrita en §8: cada tarjeta es la oferta concreta de un
tercero, exigible si se publica. Por eso el catálogo es **maqueta** hasta que cada marca confirme
por escrito, y por eso la condición de la página dice que cada marca otorga y honra su beneficio.

### Las 15 marcas del ejemplo

Cuatro categorías. Las de Movimiento y las de Cuidado personal tienen respaldo en el
`Cronograma.docx` del cliente (listas de Movimiento y del Mercadito); la de Vita Açaí, Puro Shot
y Verti Greens es inferida del nombre. Los porcentajes, entre 5% y 10%, son los que dio el
usuario para la demo; cuál marca tiene cuál es invención.

| Categoría | Marcas | Foto |
|---|---|---|
| Alimentación | Vita Açaí, Puro Shot, Verti Greens, Sencha Tea | bandejas de microvegetales |
| Movimiento | Spinning Center, Doer Fitness, Pranayama Costa Rica, Circl Mobility | clase de yoga |
| Salud y bienestar | Piel y Mente, AllRecovery, Aquí y Ahora | meditación |
| Cuidado personal | Oleana, Cuarzo Rosa, nipskin, Brixta | puesto del Mercadito |

## 6. Modelo de contenido

`content/beneficios.json` tiene dos listas:

```
categorias: slug · nombre {es,en} · descripcion {es,en} · foto · scrim · posicion
beneficios: marca · logo · categoria · descuento · sobre {es,en} · confirmado
```

El título de cada tarjeta se arma con el copy (`{marca}: {descuento}% de descuento {sobre}`), no
concatenando en el código, para que el inglés pueda cambiar el orden («{marca}: {descuento}% off
{sobre}»).

**La referencia cruzada se valida en el esquema, no solo en los tests.** Un beneficio que apunta
a una categoría mal escrita, dos categorías con el mismo slug, o una categoría sin beneficios
tumban el build con un mensaje que dice cuál. Una categoría vacía sería una página en blanco.

`confirmado` no se renderiza. Existe para que se vea de un vistazo quién dio el sí por escrito.
Hoy las 15 están en `false`, y un test lo fija: el día que llegue la primera confirmación, ese
test se actualiza a propósito y el cambio se ve en el diff.

Reglas que el repo impone y que es fácil romper por copiar el patrón de al lado:

- El getter va **sin cantidad exacta**. Casi todos los de `lib/contenido.ts` usan `.length(n)`;
  con ese patrón, cada marca que sume el cliente rompería el build.
- El copy en inglés **no puede ser idéntico al español** o falla `tests/unit/copy.test.ts`.

**Quedó fuera, a propósito:** condiciones y vigencia por beneficio, y el filtro de vencidos que
proponía la primera versión. No hay ni un dato de vigencia todavía, y un campo que todas las
tarjetas dejan vacío no protege nada. Entran con la primera confirmación escrita, que es la que
trae esos datos.

## 7. Mecánica de canje

**Mostrar la entrada.** Disuelve el problema en vez de resolverlo y deja la página pública.

La aritmética: ~2.000 asistentes × ~15% de canje repartido entre 58 marcas son ~5 canjes por
marca. Construir infraestructura antifraude —códigos únicos, integración con 58 comercios,
despliegue permanente— para proteger eso está desproporcionado en dos órdenes de magnitud.

**El riesgo dominante no es el colado: es la marca que no honra el beneficio** y el reclamo le
llega a Dharma. Eso se blinda con confirmación escrita por marca y la promesa de bajarla de la
página en 24–48 h, no con código.

Encima, gratis: un código de atribución **por marca** (`DHARMA-SALT`), que no mejora la
verificación ni un gramo pero le da a Dharma el dato que va a querer el lunes siguiente — qué
marca convirtió.

Se descarta el gate por costo, no por «el sitio es estático»: `lib/acciones.ts` ya tiene Server
Actions y `lib/leads.ts` escribe a disco. Es posible; es caro y contraproducente.

Nunca pasarle la lista de compradores a las marcas para que verifiquen: es cesión de datos
personales sin base de legitimación y hace estallar el consentimiento que los formularios hoy
recogen bien.

## 8. Marco legal

No es asesoría legal; es lo que obliga a revisar con quien corresponda antes de publicar el
Tiempo 2.

Al publicar el descuento de un tercero, Dharma actúa como **anunciante** según el reglamento
37899‑MEIC a la Ley 7472:

- **Art. 113 b)** — lo que dice la página es exigible por el consumidor aunque la marca diga otra
  cosa.
- **Art. 113 h)** y **art. 117** — hay que informar vigencia, duración, objeto, restricciones y
  ante quién se reclama, y garantizar que exista lo prometido durante la vigencia.
- **Art. 119** — la carga de la prueba es de quien anuncia.

Dos formulaciones que importan:

- **Nunca escribir «Dharma garantiza».** Convierte a Dharma en obligado directo. La fórmula es
  *«cada marca otorga y honra su beneficio»*: acota, no borra.
- **No encuadrar los beneficios como parte de lo que se compra con la entrada.** Eso los acerca a
  condición esencial del boleto y arrastra el art. 138, con discusión de devoluciones incluida.
  Cortesía de las marcas aliadas, revocable, es más seguro y no le quita fuerza comercial.

## 9. Falta del cliente

### Bloqueante para mostrarlo al público

Hoy es una maqueta para enseñarle la idea a los dueños de Dharma. El sitio **sí** está en Vercel
(`dharma-fest-page`, sale de `main`), así que mergear publica. Antes de que el público lo vea:

- **Cada una de las 15 marcas confirma por escrito** su beneficio, condiciones y vigencia, o sale
  de `beneficios.json`. Una tarjeta con el logo de una marca y un porcentaje que no aceptó es lo
  que el art. 113 b) vuelve exigible.
- **Confirmar que las regalías del Mercadito se repiten en 2027.**

### Bloqueante para que el programa funcione

- **12–15 confirmaciones por escrito**, con los ocho campos. Orden de ataque: los ~9 estudios y
  gimnasios y los ~9 servicios de salud primero, que pueden decir que sí sin consultar a un
  distribuidor. Las 5 de canal profesional (Sesderma, dōTERRA, FuXion, Hipertin, Termix) no
  controlan el precio final: su beneficio natural es muestra, no porcentaje.
- **Fecha del festival.** Sin fecha no hay «válido hasta».
- **Link de la tiquetera.** Una página que promete beneficios por comprar una entrada que no se
  puede comprar es peor que no publicarla. Orden correcto: fecha y link → confirmaciones → página.
- **Qué permite Starticket** (la tiquetera de 2025): si el correo de confirmación admite texto
  propio del organizador. Si sí, la activación del programa es una línea que diga *«tu entrada
  también es tu pase de beneficios»* con el link. Nadie le ha preguntado.
- **Una persona nombrada dueña de la lista**, y mantenimiento cotizado aparte. Mantener 58
  beneficios vivos es tarea recurrente; sin dueño el programa se pudre solo en seis meses.

### No bloqueante

- Decidir si el programa sobrevive entre ediciones o muere con cada festival.
- **Resolver la contradicción de cifras**, que esta página amplifica: el encargo habla de 2.000
  asistentes y `content/cifras.json` dice 4.000. Son cosas distintas (asistentes de una edición
  contra acumulado de todas las experiencias), pero el sitio las publica sin distinguirlas.
- Logos a color, si se quiere un grid con más peso de marca.
- Cerrar el inventario de marcas: recuperar VIDA e identificar los dos isotipos sueltos. El muro
  de logos disimula esos huecos porque van juntos y pequeños; una página de beneficios expone el
  nombre de cada marca en grande y ya no puede.

## 10. Impacto en `/patrocinios`

Los 30 beneficios de los paquetes se agrupan en Presencia, Visibilidad y Captación. **Captación
es el más flaco justo en Oro y Plata**, que son los que más se venden. Un renglón nuevo —*«tu
marca entra al programa de beneficios de la comunidad Dharma»*— es captación medible: tráfico con
código trazable, no impresiones.

El número que le importa a la marca no es 2.000 asistentes: son los **26.000 de la base de datos**
y las 4.000 personas que ya vivieron una experiencia Dharma, 68,2% mujeres y 73,8% entre 25 y 44
— el perfil que compra dermocosmética, clases de movimiento y servicios de bienestar.

Tres movimientos, **ninguno ejecutado**: requieren decisión del cliente porque desactualizan el
PDF que las marcas ya tienen impreso.

1. Agregar el renglón al grupo Captación de `paquetes.json`.
2. El código de atribución por marca, que es el único dato duro para la mesa de renovación 2028.
3. Agregar «¿qué beneficio le das a la comunidad Dharma?» al formulario de captación de marcas
   que el cliente ya diseñó. Hay demanda entrante; así la página se alimenta sola en vez de
   perseguir 58 correos.

**Ojo con la jerarquía.** La spec v2 fija dos audiencias separadas (público en la home, marcas en
`/patrocinios`) y esta es la primera página que le habla a las dos. De cara al público, con el
anzuelo para marcas como un bloque al pie, no como sección de igual peso.

## 11. Pruebas

`lib/rutas.ts` **no es la fuente de verdad**: `RUTAS` solo alimenta `app/sitemap.ts`. El hreflang
lo arma cada página llamando `alternativas()` a mano, y hay **listas de rutas hardcodeadas** en
los tests e2e (`legibilidad`, `paginas`, `seo`). Agregar una ruta sin editarlas no rompe nada, y
ese es el peligro: la página nace sin cobertura. `/beneficios` y sus categorías están en las
tres.

### El test de legibilidad nunca había medido bien en móvil

Al sumar las categorías, `legibilidad.spec.ts` falló en móvil con fondos casi blancos
(luminancia 0.91) donde había una foto oscura. La causa no estaba en la página: el test captura
la pantalla a la densidad del dispositivo emulado —el Pixel 7 tiene 2.625— y la recorría con
coordenadas CSS. En móvil medía en otro lugar de la página, 2.6 veces más arriba.

Aprobaba las páginas viejas **por casualidad**: donde caía, había un encabezado oscuro. En
Beneficios caía en el catálogo claro.

Se corrigió capturando en píxeles CSS (`scale: "css"`) y con una guarda que falla si la captura y
las coordenadas no están en la misma escala. Para comprobar que el test ahora detecta algo, se
oscureció a propósito un título sobre la foto y falló en escritorio y en móvil, midiendo el fondo
real (luminancia 0.06 y 0.15).

### Y tampoco medía los textos con opacidad

La revisión del cambio encontró un segundo agujero, más grande. Tailwind 4 escribe
`text-hueso/80` como `oklab(…)`, y el test leía el color con una expresión regular pensada para
`rgb()`: salía una luminancia de millones y **el texto aprobaba siempre, sin medirse**. Además
ignoraba el alfa. En `/beneficios`, 7 de 10 textos sobre foto nunca se habían medido; en el resto
del sitio, lo mismo.

Ahora el color se normaliza pintándolo en un canvas, se mezcla con el fondo real según su alfa,
y un color que no se pueda leer hace fallar el test. También mide enlaces, etiquetas y texto en
línea: la etiqueta del consentimiento vive en un `span` y quedaba fuera. Se comprobó con una
mutación (el texto de condiciones al 40%): falla en los dos anchos leyendo alfa 0.40.

**Con el test corregido aparecieron fallas reales en páginas que ya estaban publicadas**, y se
arreglaron en este mismo cambio:

| Dónde | Qué pasaba | Arreglo |
|---|---|---|
| Home, `#sumate` | Etiquetas, casilla y aviso de la Ley 8968 en tinta sobre la foto: el aviso daba 2.2:1 | El formulario va en un panel claro |
| Todos los formularios | Borde de campo en tinta al 25%: 1.7:1 | Tinta al 55% (3:1) |
| Home, Road to Dharma | Cuerpo a 3.47:1 y el enlace a 4.32:1 sobre la pared clara | Oscurecido de 0.55 a 0.68 y cuerpo en hueso pleno |
| `/patrocinios`, hero | «¿Por qué Dharma?» sobre el cielo: 2.55:1 | Refuerzo lateral, como el de `FondoFoto` |
| `/patrocinios`, Mercadito | La foto era un salón blanco: caja gris plana y cuerpo a 3.47:1 | Foto de un puesto del 2025 con `FondoFoto` |
| `Kicker`, en todo el sitio | Al 80% se caía en fondos apenas claros | Hueso pleno |
| Beneficios, cierre | Condiciones y anzuelo de marcas al 80–85% | Hueso pleno |

La misma revisión encontró que el anillo de foco (verde de texto) no llegaba a 3:1 sobre las
fotos. Ahí ahora es pálido, en las secciones con foto y en la cabecera, salvo el menú móvil, que
es claro.

### Guardas de Beneficios Dharma

Unitarias:

- No inventa marcas: nombre y logo coinciden con `marcas.json`, y ninguna se repite.
- Cada beneficio cae en una categoría que existe, y ninguna categoría queda vacía; una categoría
  mal escrita tumba la validación.
- El rango de `/2027` es el del catálogo, y si todas las marcas dan lo mismo no dice «entre 10% y
  10%».
- Cada marca de `marcas.json` tiene su logo recortado.
- Mientras sea maqueta, ninguna marca figura como confirmada.
- El anillo de foco llega a 3:1 en claro y sobre foto, y la regla está en el CSS.

End-to-end (`tests/e2e/beneficios.spec.ts`), con los conteos leídos del JSON:

- Lista todos los beneficios y dice cuántos son.
- Cada categoría lleva a su página, con sus tarjetas y marcada como actual.
- Cada tarjeta dice marca, porcentaje y sobre qué aplica, en español y en inglés.
- Los dos órdenes funcionan, con guardas para que una lista vacía no «esté ordenada».
- Una categoría inexistente da la 404 propia.
- El cuerpo no se desborda, y a 320 px ningún título de categoría se corta (el hero tiene
  `overflow-hidden`, así que un título ancho se recortaba en silencio).
- Las rutas de categoría de `legibilidad` y del sitemap se leen del JSON o se comparan con la URL
  completa.
- `/2027` anuncia el rango del catálogo, ya no lleva logos y manda a Beneficios Dharma.
- En la cabecera, Beneficios Dharma va justo después de Dharma Fest 2027, en escritorio y en el
  menú móvil.
- La cabecera entra en una fila a 1024, 1100 y 1180 px, en los dos idiomas.

## 12. Fuera de alcance

- Pase digital, verificación contra la lista de compradores, reporte de canjes. Es el enfoque
  «Club Dharma», descartado por ahora, no para siempre.
- Integración con la tiquetera.
- Cobrar por entrar al programa.
