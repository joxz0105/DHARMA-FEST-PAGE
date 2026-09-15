# Programa de beneficios — diseño

Fecha: 2026-09-15 · Rama: `main` · Extiende: `2026-09-09-dharma-fest-v2-design.md`

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
| Dónde | Sección en `/2027` | Ruta propia `/beneficios` |
| Marcas necesarias | 4, como muestra | 12–15 por escrito |
| Qué muestra | El mecanismo + rango de descuento | El catálogo marca por marca |
| Riesgo legal | Real mientras no confirmen | Real, se controla con papel |
| Estado | **Hecho** (maqueta) | Pendiente del cliente |

## 4. Tiempo 1 — «Qué incluye tu entrada» (hecho)

`components/secciones/QueIncluye.tsx`, entre `Actividades` y `Entradas` en `/2027`. Ese orden es
deliberado: primero se construye el valor, después aparece el botón de comprar.

Tres puntos sobre el día del festival: en los stands · por orden de llegada · con el pase
Experiencia. Debajo, un cuarto bloque con el descuento y cuatro logos. Cierra con la línea del
canje y un enlace a `#entradas`. Cuando exista `/beneficios`, ese enlace apunta ahí.

### El descuento va como rango del programa

El diseño original no nombraba marcas ni porcentajes, para que la sección pudiera salir sin
exposición legal. **El cliente pidió lo contrario**, y con razón de negocio: los dueños de Dharma
necesitan ver cómo se vería, y «5%–10% de descuento» es lo concreto que hace la idea vendible.

La forma que se eligió acota el riesgo sin quitarle fuerza: el porcentaje se declara **como rango
del programa** —«entre 5% y 10% en los productos de las marcas aliadas»— y no pegado a cada logo.
Un número junto a una marca es la oferta concreta de esa marca; un rango del programa es una
afirmación de Dharma sobre su propio programa. El desglose por marca llega con `/beneficios`,
donde cada línea carga sus condiciones y su vigencia. Hay un test que vigila que ningún objeto de
`beneficios.json` gane un campo de porcentaje por marca.

**Esto es una maqueta, no material publicable.** Las cuatro marcas de `content/beneficios.json`
—Vita Açaí, Puro Shot, Verti Greens, Sencha Tea— están ahí como ejemplo y llevan
`confirmado: false`. Ninguna ha dicho que sí. Antes de que esta sección sea pública, cada una
tiene que confirmar por escrito; si no, se quitan los logos y queda el rango solo.

Se eligieron esas cuatro por dos razones: son marcas de producto, que es de lo que habla el copy,
y sus logos se leen en blanco a tamaño chico. Los finos —Ceres Orgánica, matcha-lā, Nutriplus,
Ondalina— se lavan sobre la foto. Cambiarlas es editar la lista del JSON y nada más.

Fondo: `2025/2025-dsc9370.jpg`, scrim 48. Es una persona del festival 2025 con el brazalete verde
puesto. En móvil la sección es más alta y el brazalete entra en el recorte; en escritorio no, y
se prefiere el rostro.

Copy en el namespace `beneficios` de `content/copy/{es,en}.json`, para que el Tiempo 2 lo
extienda sin mover nada.

**Pendiente del cliente:** confirmar que las regalías se repiten en 2027. Por eso el copy
describe cómo funciona el festival y no promete marcas ni cantidades.

## 5. Tiempo 2 — `/beneficios`

Pública, sin gate. Una lista abierta de descuentos **vende entradas**; una escondida no vende
ninguna, y el candado no impide que alguien pida el descuento en el local — solo impide que un
comprador real encuentre su beneficio.

Estructura:

1. **Hero** con `FondoFoto`. La bajada aclara la dirección del beneficio, que es el malentendido
   garantizado: *el descuento es en las marcas, no en la entrada.*
2. **Tres pasos** sobre papel: comprás tu entrada → mostrás tu QR o tu brazalete → recibís el
   beneficio.
3. **Bloque «En el festival»** — canje en el stand, beneficios fuertes.
4. **Bloque «Todo el año»** — canje en el local o la web, con vigencia y tope visibles.
5. **Bases y condiciones**, con la fórmula *«cada marca otorga y honra su beneficio»*.
6. **Bloque chico** «¿tenés una marca y querés estar acá?» hacia `/patrocinios`.

Las tarjetas van al molde de `Paquetes.tsx`, con una inversión: **el peso visual lo lleva el
texto del beneficio, no el logo.** No es preferencia estética. Los 58 PNG están recoloreados a un
tono plano `#1C2A14` y la mediana es 324×240 px; no existe versión a color en el repo y escalarlos
da borroso y monocromo. Logos a color es material nuevo que hay que pedirle al cliente.

Filtro por categoría cuando pase de ~20 marcas. Antes no hace falta.

La página declara el número de marcas explícito («15 marcas aliadas, y sumando»). Un contador
honesto se lee como programa en crecimiento; un grid con huecos se lee como abandono.

**Nav:** entra a la barra como quinto enlace. Verificar el desborde horizontal en anchos
intermedios: el test solo corre a 1280 y a 412 px, justo salteándose donde se rompe.

## 6. Modelo de contenido

`content/beneficios.json`, un objeto por beneficio con los ocho campos de la confirmación
escrita. Ese documento es simultáneamente el contenido del JSON, el esquema de Zod y la prueba
legal:

```
marca · logo · categoria · beneficio {es,en} · condiciones {es,en}
donde · nivel ("festival" | "anual") · vigenciaHasta · link
```

Dos reglas que el repo impone y que es fácil romper por copiar el patrón de al lado:

- El getter va **`.min(1)`**, no `.length(n)`. Casi todos los de `lib/contenido.ts` usan cantidad
  exacta; con ese patrón, cada marca que sume el cliente rompe el build.
- El copy en inglés **no puede ser idéntico al español** o falla `tests/unit/copy.test.ts`. Un
  nombre propio bilingüe obliga a sumarlo a `PERMITIDAS`.

**Los beneficios vencidos se filtran al renderizar, y un bloque sin beneficios vivos no se
dibuja.** Eso es lo que separa un catálogo vivo de uno muerto. Se consideró que un vencimiento
tumbara el build y se descartó: rompería en un momento aleatorio, mientras alguien hace otra
cosa. En su lugar, un test unitario falla cuando un bloque entero se queda sin beneficios vivos,
que es exactamente cuándo hay que enterarse.

Nota: el sitio se prerenderiza, así que el filtro se evalúa al construir. Aceptable mientras el
proyecto se corra local; si algún día se despliega, hay que revisarlo.

`beneficios.json` **nunca** se deriva de `marcas.json`. Arranca de cero con las confirmadas.

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

### Bloqueante para publicar el Tiempo 1

Hoy es una maqueta para enseñarle la idea a los dueños de Dharma, y el sitio corre local. Para
que salga a un dominio hacen falta dos cosas:

- **Las cuatro marcas del ejemplo confirman por escrito**, o se quitan los logos y queda el rango
  solo. Publicar el logo de una marca junto a un descuento que no aceptó es lo que el art. 113 b)
  vuelve exigible.
- **Confirmar que las regalías del Mercadito se repiten en 2027.**

### Bloqueante para el Tiempo 2

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
lo arma cada página llamando `alternativas()` a mano, y hay **cuatro listas de rutas
hardcodeadas** en los tests e2e:

- `tests/e2e/legibilidad.spec.ts:16`
- `tests/e2e/paginas.spec.ts:4` y `:59`
- `tests/e2e/seo.spec.ts:35` y `:48`

Agregar la ruta sin editarlas a mano no rompe nada, y ese es el peligro: la página nace sin
cobertura de accesibilidad, h1, título ni versión en inglés, y los tests siguen en verde.

`legibilidad.spec.ts` además **falla** si se agrega la ruta a su lista y la página no tiene
ninguna sección con `data-fondo="verde"`. Es una decisión de diseño forzada por el test: o la
página lleva hero con foto, o no entra a esa lista.

Guardas ya puestas (Tiempo 1):

- `beneficios.json` no puede inventar marcas: nombre y logo tienen que coincidir con
  `marcas.json`.
- Los logos referenciados existen en disco.
- El rango es coherente (`min < max`, `max <= 100`).
- Ningún objeto de `marcas` gana un campo de porcentaje propio — el porcentaje va como rango del
  programa, no pegado a una marca.

Guardas pendientes (Tiempo 2):

- Un bloque sin beneficios vivos no se dibuja (test unitario).
- Ningún beneficio vencido se renderiza.

## 12. Fuera de alcance

- Pase digital, verificación contra la lista de compradores, reporte de canjes. Es el enfoque
  «Club Dharma», descartado por ahora, no para siempre.
- Integración con la tiquetera.
- Cobrar por entrar al programa.
