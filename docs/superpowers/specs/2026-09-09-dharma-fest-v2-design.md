# Dharma Fest CR — sitio v2

Fecha: 2026-09-09 · Rama: `main` (huérfana) · Trabajo anterior: `v1-referencia-retreat`

## 1. Por qué existe esta v2

La v1 (rama `v1-referencia-retreat`) se diseñó sin material del cliente. Se inventó paleta,
tipografía, taxonomía de contenido y copy, tomando `theretreatcostarica.com` como referencia.

El cliente entregó después dos cosas que invalidan esa base:

1. **`DHARMA Fest 2027 - Patrocinios Oficiales.pdf`** (21 láminas), con la identidad real,
   el copy aprobado, las cifras duras, 132 imágenes y los paquetes de patrocinio.
2. **Una nueva referencia: `wanderlust.com/festivals/`** — un sitio de *festival*, no de
   retiro de lujo.

La v2 arranca de cero contra ese material. No se reutiliza código de la v1.

### Qué cambia respecto de la v1

| | v1 (inventado) | v2 (deck real) |
|---|---|---|
| Paleta | verde bosque + naranja copal + lino | rampa de lima sobre negro verdoso |
| Tipografía | Cormorant Garamond + Jost | didone de alto contraste + palo seco |
| Sede | "Campo Lago" | **Camp Lago** (3 salones) — grafía a confirmar |
| Taxonomía | 7 ejes | 5 actividades + 8 temas |
| Entre ediciones | "experiencias Dharma" | **Road to Dharma** |
| Fotos | placeholders generados | 132 imágenes reales del cliente |
| Cifras | ninguna | +4000 · +8/año · 67% · 26K · demografía |
| Patrocinios | no existía | tres paquetes, es el eje del deck |

## 2. Objetivo

Casa de marca bilingüe con **dos audiencias y jerarquía explícita**:

- **Público** (primaria en la home): que conozca el festival, los Road to Dharma y deje su
  correo para la base de comunidad.
- **Marcas** (primaria en `/patrocinios`): que la marca que hoy recibe el PDF entre a una URL,
  vea los beneficios y pida la propuesta.

**Conversión del público:** registro por correo. **Conversión de marcas:** solicitud de propuesta.

No hay venta de entradas. Si el cliente confirma boletería, el CTA de la home cambia.

## 3. Decisiones cerradas

| Decisión | Valor | Nota |
|---|---|---|
| Alcance | Home para público + `/patrocinios` para marcas | Opción C del brainstorming |
| Punto de partida | Rama huérfana, carpeta vacía | Nada de la v1 |
| Idiomas | Español e inglés desde el arranque | Español sin prefijo, inglés en `/en/` |
| Precios de patrocinio | **No se publican** | Beneficios completos + "Solicitá la propuesta" |
| Formularios | Server Actions → `.jsonl` local | Proveedor de correo detrás de un módulo |
| Stack | Next.js App Router | Elección del usuario |
| Despliegue | **Ninguno** | Local; túnel temporal si hay que mostrar |
| Tema | Oscuro fijo, sin conmutador | El deck es oscuro de punta a punta |

## 4. Identidad visual

Extraída por muestreo directo de píxeles del PDF. **Todos los verdes viven en el tono 64-65°.**
Es una sola rampa, no una paleta de colores distintos.

### Tokens de color

| Token | Hex | HSL | Uso |
|---|---|---|---|
| `noche` | `#111211` | 120° 3% 7% | Fondo base. Negro con sesgo verde, nunca `#000` |
| `lima` | `#C6D03F` | 64° 61% 53% | Verde de marca: titulares, cifras, reglas, foco |
| `lima-humo` | `#98A138` | 65° 48% 43% | El lima cuando cae sobre foto oscura |
| `lima-hondo` | `#80872D` | 65° 50% 35% | Display grande sobre foto muy oscura |
| `palido` | `#E4E8AD` | 64° 56% 79% | Titulares sobre foto clara |
| `hueso` | `#FFFFFF` | — | Logo y cuerpo sobre foto |
| `oro` | `#B59F15` | 52° 79% 40% | **Solo** el paquete Oro. Único color fuera de la rampa |

**Regla que no se rompe:** `palido` no es un beige. Es lima al 79% de luz. Sustituirlo por una
crema neutra rompe la cohesión de todo el sistema.

### Tipografía

- **Display:** Bodoni Moda (variable, Google Fonts). Didone de alto contraste. La itálica hace
  el trabajo expresivo, igual que en el deck: *fest*, *en* Crecimiento, *Estilo de vida*,
  *Patrocinador*.
- **Texto:** Archivo (variable, Google Fonts).
- **Logo:** se extrae del PDF como imagen. No se reproduce con tipografía web — la itálica del
  logotipo es probablemente una fuente comercial. Ver §10.

Las fuentes propuestas *se parecen* a las del deck; no son las mismas. Confirmar con el manual
de marca cuando exista.

### Lenguaje de composición

Tomado tal cual del deck:

- Foto a sangre completa con degradado verde encima; palabra display gigante sobre la foto,
  a veces cortada por el borde del lienzo.
- Kicker pequeño arriba a la izquierda (`¿Por qué Dharma?`, `Nuestro público`, `Sobre Dharma`).
- Regla vertical fina separando titular de cuerpo.
- Tarjetas de esquina redondeada con degradado al pie y etiqueta abajo a la izquierda.
- Cifras grandes dentro de caja de contorno lima (`+4000`, `67%`).
- Textura de selva 2400×3600 como fondo recurrente (el deck la repite en 6 láminas).

## 5. Arquitectura técnica

- **Next.js, App Router.** Segmento `[lang]` con `es` como idioma por defecto sin prefijo
  visible y `en` bajo `/en/`.
- **Imágenes:** `next/image`, AVIF/WebP, `sizes` responsivo. Origen: extracción del PDF.
- **Formularios:** Server Actions. Toda la escritura pasa por `lib/leads.ts`, que hoy hace
  *append* a `data/leads.jsonl` (fuera de git). Cambiar de proveedor = cambiar ese módulo.
- **Contenido:** archivos de datos versionados, no literales dentro de componentes.
- **Sin base de datos, sin autenticación, sin CMS.**

### Estructura

```
app/[lang]/                 páginas
components/secciones/       una por sección de página
components/ui/              primitivas (Kicker, TituloDisplay, TarjetaFoto, Cifra…)
content/                    datos (§7)
lib/leads.ts                único punto de escritura de capturas
lib/i18n.ts                 diccionarios y helpers de idioma
public/img/                 imágenes extraídas del PDF
```

## 6. Mapa de páginas

Seis páginas más el 404, cada una en `es` y `en`.

### `/` — Home (público)

1. **Hero** — foto a sangre, logo, `4ta edición · 2 días · Camp Lago`, CTA a comunidad
2. **Quiénes somos** — copy literal del deck
3. **Actividades** — los 5 pilares (equivale al `PRACTICE/LISTEN/EXPLORE/LEARN/TASTE` de wanderlust)
4. **Temas** — grilla de 8, cierra con "una red de más de 100 profesionales del bienestar"
5. **Galería Dharma** — mosaico de fotos reales
6. **Comunidad en cifras** — +4000 · +8 al año · 67% · 26K
7. **Road to Dharma** — adelanto → `/road-to-dharma`
8. **Camp Lago** — la sede y sus tres salones
9. **Impacto social** — las cuatro asociaciones aliadas
10. **Marcas que confían** — muro de ~70 logos
11. **Sumate** — captura de correo con consentimiento (§9)

### `/patrocinios` — reemplaza al PDF (marcas)

El deck en orden, sin precios:

1. Hero — *"No comprés segundos. Comprá presencia."*
2. Nuestro público — perfil, estilo de vida, género, edades
3. Comunidad en crecimiento — cifras y alcance orgánico
4. Plan de medios y difusión
5. Lo que viene — 2 días, 2.000 asistentes, +30 marcas
6. **Los tres paquetes** — beneficios completos en columnas, **sin cifra de inversión**
7. Mercadito — CTA propio para stand (§10, falta información)
8. Marcas que confían
9. **Solicitá la propuesta** — formulario

### `/road-to-dharma`

El concepto que más diferencia a la marca y que el PDF despacha en una lámina. Experiencias de
80 a 200 personas durante todo el año. *"El festival es el encuentro anual; Road to Dharma es
la comunidad todo el año."*

### `/2027`

La 4ta edición en detalle. **Bloqueada parcialmente: no hay fecha** (§10).

### `/nosotros`

Quiénes somos y asociaciones aliadas. **Bloqueada: no se sabe quién está detrás** (§10).

### `/gracias` y `/privacidad`

Confirmación post-formulario (una variante por tipo de captura) y política de privacidad
(maquetada, texto pendiente del cliente).

## 7. Modelo de contenido

Archivos de datos, para que el cliente cambie un dato sin tocar componentes:

- `cifras.json` — +4000 personas · +8 experiencias anuales · 67% crecimiento · 26.000 en base
  de datos · género 68,2% mujeres / 31,8% hombres · edades 25-34 43,1%, 35-44 30,7%,
  18-24 11,0%, 45-54 10,9% · alcance orgánico por post: 20K, 18K, 11K, 6.2K
- `actividades.json` — Movimiento Corporal · Entretenimiento · Talleres y Conferencias ·
  Gastronomía Funcional · Mercadito ProSalud
- `temas.json` — Salud Mental · Higiene del sueño · Amor propio · Medio Ambiente · Yoga ·
  Pilates · Zumba · Terapia de Sonido & Breathwork
- `paquetes.json` — los tres tiers con sus beneficios en tres grupos (Presencia Dharma Fest
  2027 / Visibilidad y Comunidad / Captación de Clientes). **El precio se guarda en el archivo
  pero no se renderiza**, para que esté a mano el día que el cliente decida publicarlo:
  Oficial US$7.000, Oro US$4.000, Plata US$2.000 (+IVA)
- `marcas.json` — ~70 marcas con su logo
- `asociaciones.json` — Guiare · Transformación en Tiempos Violentos · Green Wolf Costa Rica ·
  Mar y Cielo
- `espacios.json` — Salón La Casita · Salón Terraza 360 · Salón Higuerón
- `medios.json` — canales del plan de difusión

## 8. Copy

- **Literal del deck** donde el deck lo tiene. Es copy aprobado por el cliente y suena a él.
- **Borrador marcado como borrador** donde no lo tiene: cuerpo de `/road-to-dharma`, `/2027`,
  `/nosotros`. Se entrega señalado para que el cliente lo apruebe y no se le cuele voz ajena.
- **Inglés:** traducción propia, marcada para revisión. *"No comprés segundos. Comprá
  presencia."* no se traduce literal — el voseo y el juego con "segundos de atención" no
  sobreviven. Necesita transcreación.

## 9. Datos personales

El sitio alimenta una base que ya tiene 26.000 personas. En Costa Rica eso cae bajo la
**Ley 8968** (Protección de la Persona frente al tratamiento de sus datos personales).

El sitio se implementa con:

- Casilla de consentimiento explícita, no premarcada, en ambas capturas.
- Declaración de finalidad junto al formulario.
- Enlace a `/privacidad` y una vía de baja.
- `data/leads.jsonl` fuera de git.

**El texto legal y la identidad del responsable del tratamiento los provee el cliente.**

## 10. Falta del cliente

### Bloqueante

1. **Fecha del Dharma Fest 2027.** No aparece en el deck. Sin ella no hay cuenta regresiva,
   ni "save the date", ni `schema.org/Event`, y `/2027` pierde su dato principal.
2. **Quién está detrás de la marca** (fundadora, equipo). Bloquea `/nosotros`.
3. **Relación Dharma ↔ Camp Lago.** El logo pone *Camp Lago* sobre *Dharmafest*; los paquetes
   hablan de "redes de Dharma y Campo Lago" como dos cuentas. ¿Sede, productor o socios?
   Además el deck usa las dos grafías: **Camp Lago** en el logo, **Campo Lago** en el texto.
4. **Mercadito: precio y condiciones del stand.** Son +30 marcas, un producto distinto y más
   barato que los tres paquetes, sin ninguna condición documentada.
5. **Política de privacidad y responsable del tratamiento de datos** (§9).

### No bloqueante

6. ¿Hay venta de entradas? Precio y fecha de apertura. Cambiaría el CTA de la home.
7. Logo vectorial y manual de marca. Hoy se usa el PNG extraído del PDF.
8. Handles de Facebook y TikTok. Solo se tiene `@dharma_festcr`.
9. Confirmación del dominio (se asume `dharmafestcr.com` por el correo `info@dharmafestcr.com`).
10. Número de WhatsApp, para el atajo de contacto de marcas.

## 11. Accesibilidad y rendimiento

Contraste medido (WCAG 2.1) de cada tono sobre `noche #111211`:

| Sobre `noche` | Ratio | |
|---|---|---|
| `hueso` `#FFFFFF` | 18.78:1 | AA texto |
| `palido` `#E4E8AD` | 14.70:1 | AA texto |
| `lima` `#C6D03F` | 11.17:1 | AA texto |
| `oro` `#B59F15` | 7.09:1 | AA texto |
| `lima-humo` `#98A138` | 6.70:1 | AA texto |
| `lima-hondo` `#80872D` | 4.85:1 | AA texto |
| `lima` sobre **blanco** | **1.68:1** | **falla** |

De ahí la regla: **el lima nunca se usa como texto sobre fondo claro.** Sobre el fondo de marca
toda la rampa tiene margen de sobra.
- Toda foto con texto encima lleva degradado suficiente para sostener el contraste.
- Navegación por teclado completa, foco visible en `lima`, `skip link`.
- `prefers-reduced-motion` respetado en todas las animaciones de entrada.
- Jerarquía de encabezados sin saltos; un solo `h1` por página.
- Las fotos del deck son pesadas (hasta 20 MB): se redimensionan y comprimen al ingresarlas,
  no se sirven crudas.

## 12. Pruebas

- **Unitarias (Vitest):** helpers de i18n, carga y validación de los archivos de contenido,
  `lib/leads.ts`, utilidades de color.
- **E2E (Playwright + axe):** una por página, más el recorrido completo de ambos formularios
  (validación, error, éxito, página de gracias) y el conmutador de idioma.

## 13. Fuera de alcance

Venta de entradas · panel de leads · CMS · blog · cuentas de usuario · conmutador de tema ·
integración con proveedor de correo · despliegue.
