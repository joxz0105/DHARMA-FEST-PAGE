# Dharma Fest CR — Sitio web · Especificación de diseño

- **Fecha:** 2026-09-08
- **Cliente:** Dharma Fest Costa Rica ([@dharma_festcr](https://www.instagram.com/dharma_festcr/))
- **Referencia aprobada por el cliente:** [The Retreat Costa Rica](https://www.theretreatcostarica.com/es)
- **Estado:** aprobado en brainstorming (dirección visual y orden de secciones)

---

## 1. Contexto

Dharma Fest es un festival de bienestar en Costa Rica. Su sede recurrente es Campo Lago
(`@campolagocr`), a la que la marca se refiere como "nuestra casa, el lugar donde siempre
sucede la magia". La edición grande de 2025 se celebró el 1 de septiembre de 2025 y reunió
siete ejes de contenido: charlas, artistas, mercadito de marcas locales, actividades,
gastronomía, asociaciones y entretenimiento.

La próxima edición grande es **Dharma Fest 2027**. Entre ediciones, la marca sostiene la
comunidad con **experiencias Dharma**: encuentros más pequeños y temáticos (por ejemplo
"Conectá con tu piel", agosto 2026, y sesiones de respiración).

Hoy la marca vive solo en Instagram: 4 493 seguidores, 182 publicaciones, sin sitio web y
sin base de datos propia de su comunidad.

**La tensión central del proyecto:** la referencia que el cliente aprobó es *wellness de lujo
exclusivo*; Dharma es *comunidad accesible*. El sitio debe verse tan cuidado como The Retreat
sin sonar caro ni distante.

## 2. Objetivo

Construir la **casa de marca** de Dharma Fest: un sitio permanente que explique qué es Dharma,
sostenga la marca durante 2026 (cuando no hay festival grande) y **convierta visitantes en
comunidad propia** — correo, no seguidores prestados.

### Métrica de éxito
Registros a la comunidad. Todo lo demás es soporte.

### Objetivos secundarios
1. Dar credibilidad ante marcas y patrocinadores para la edición 2027.
2. Servir de archivo del 2025 y de las experiencias intermedias.
3. Alimentar Instagram, no competirle.

### No-objetivos (fuera de alcance de esta versión)
- Venta de entradas, pasarela de pago o cuentas de usuario.
- CMS con panel de edición. El contenido se edita en Markdown; se puede agregar después.
- Blog.
- Despliegue a producción. El cliente aún no lo autoriza: se trabaja **local**, y para mostrar
  avances se abre un túnel temporal.

## 3. Audiencias

| Audiencia | Qué busca | Qué le damos |
|---|---|---|
| Asistente potencial | Qué es esto, cuándo es la próxima, cómo se siente | Hero, filosofía, ejes, experiencias, registro |
| Comunidad actual | Cuándo es lo próximo | Sección de experiencias + registro |
| Marca / expositor | Alcance, público, seriedad | 2025 en números, marcas aliadas, `/marcas` |
| Prensa | Qué es, quién está detrás, material | `/nosotros`, recap 2025 |

## 4. Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Tipo de sitio | Casa de marca | Debe estar vivo en 2026, no solo alrededor del 2027 |
| Conversión principal | Unirse a la comunidad (correo) | Base de datos propia, independiente de Instagram |
| Dirección visual | "A · Selva editorial" | Estructura editorial de la referencia, paleta de la marca |
| Arquitectura | Home editorial larga + páginas de apoyo | Reproduce la sensación aprobada; tolera falta de contenido |
| Stack | Astro + Tailwind | Estático, rápido, contenido en Markdown, SEO |
| Despliegue | Local, sin Vercel | Decisión explícita del cliente |
| Idiomas | Español + inglés | Público tico + turismo de bienestar y marcas internacionales |

## 5. Dirección visual — "Selva editorial"

Se conserva de The Retreat: serif display grande con itálicas, kickers en mayúsculas muy
espaciadas, mucho aire vertical, fotografía a sangre completa, marquee horizontal, grids
bento asimétricos, animaciones sutiles. Se reemplaza su paleta de hotel (hueso/arena/dorado)
por la paleta de Dharma.

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--dh-bosque` | `#1E3527` | Fondo de secciones oscuras, texto sobre claro |
| `--dh-bosque-deep` | `#16281D` | Bloque de recap 2025, contraste dentro de lo oscuro |
| `--dh-salvia` | `#4A5B4F` | Texto de párrafo sobre claro |
| `--dh-lino` | `#F6F2E9` | Fondo base del sitio |
| `--dh-arena` | `#D9CFBB` | Bordes, separadores, texto sobre oscuro |
| `--dh-piedra` | `#61563E` | Kickers sobre claro, texto terciario |
| `--dh-copal` | `#E38B4A` | Acento: botones, subrayados, cifras, kickers sobre oscuro |
| `--dh-copal-ink` | `#854417` | **Obligatorio** para texto pequeño color acento sobre fondo claro |

**Regla de contraste:** sobre fondo claro, `--dh-copal` **nunca se usa como texto, a ningún
tamaño**. Da 2.33:1 sobre lino y 1.69:1 sobre arena, así que no llega ni al mínimo de 3:1 de
texto grande. Sobre claro solo vale como relleno de botón con texto `--dh-bosque` encima
(5.06:1) o como elemento decorativo. Todo texto de acento sobre claro usa `--dh-copal-ink`.
Sobre fondos oscuros, `--dh-copal` es válido en cualquier tamaño (5.06:1 sobre bosque).

Matriz verificada, todos los pares que el diseño realmente usa, mínimo AA 4.5:1:

| | sobre `lino` | sobre `arena` | sobre `bosque` | sobre `bosque-deep` |
|---|---|---|---|---|
| `bosque` | 11.79 | 8.53 | — | — |
| `salvia` | 6.48 | 4.69 | — | — |
| `piedra` | 6.46 | 4.67 | — | — |
| `copal-ink` | 6.63 | 4.79 | — | — |
| `lino` | — | — | 11.79 | 13.87 |
| `arena` | — | — | 8.53 | 10.03 |
| `copal` | ✗ 2.33 | ✗ 1.69 | 5.06 | 5.95 |

Botones: `bosque` sobre `copal` 5.06 · `lino` sobre `copal-ink` 6.63.

> **Corrección del 2026-09-08.** La primera versión de esta paleta daba `piedra` en `#8A7B5F` y
> `copal-ink` en `#A85A24`, y afirmaba que `copal` servía para texto grande sobre claro. Los tres
> puntos eran falsos: `piedra` daba 3.70:1 sobre lino, `copal-ink` fallaba sobre arena (3.27:1) y
> `copal` no alcanza 3:1 sobre ningún fondo claro. Se corrigió al implementar, cuando los tests de
> contraste de la Tarea 1 lo delataron. Los valores de arriba están verificados uno por uno.

> **Pendiente de validar:** esta paleta se derivó del Instagram, no de un manual de marca. Si
> el cliente entrega códigos oficiales, se sustituyen los tokens — pero hay que volver a correr
> la matriz de contraste, porque un verde o un naranja de marca pueden fallar igual que estos.

### Tipografía

- **Display:** Cormorant Garamond — 300 y 400, con itálica. Titulares y citas.
- **Interfaz y texto:** Jost — 300, 400 y 500. Kickers, navegación, párrafos, botones.
- Ambas **auto-hospedadas** vía `@fontsource-variable`. Nada de peticiones a Google Fonts en
  producción: menos latencia y sin dependencia externa.

Escala:

| Rol | Tamaño | Notas |
|---|---|---|
| Hero | `clamp(2.75rem, 7vw, 6rem)` | Cormorant 300, `line-height: 1.03` |
| Título de sección | `clamp(2rem, 4.5vw, 3.5rem)` | Cormorant 300 |
| Subtítulo | `1.5rem` | Cormorant 400 |
| Cuerpo | `1rem / 1.75` | Jost 300, ancho máximo 60ch |
| Kicker | `0.6875rem` | Jost 400, `letter-spacing: .30em`, mayúsculas |

### Ritmo y movimiento

- Base de espaciado de 8 px. Padding vertical de sección: `clamp(5rem, 12vh, 10rem)`.
- Ancho máximo de contenido: 1280 px, con secciones a sangre cuando llevan fotografía.
- Entrada al hacer scroll: opacidad 0→1 con desplazamiento de 24 px, 600 ms,
  `cubic-bezier(.22, 1, .36, 1)`, vía `IntersectionObserver`.
- Marquee en CSS puro, sin librería.
- **Todo el movimiento se desactiva bajo `prefers-reduced-motion: reduce`**, incluido el marquee.

## 6. Arquitectura de información

### Home — 13 secciones en orden

| # | Sección | Contenido | Nota |
|---|---|---|---|
| 01 | Hero | Foto o video a sangre. Titular: *"El bienestar no tiene una sola forma"*. CTA: Sumate a la comunidad | Titular textual de la marca |
| 02 | Marquee | Los 7 ejes en loop infinito | Dice qué es esto en 3 segundos |
| 03 | Filosofía | "¿Qué significa Dharma?" — texto + foto a dos columnas | Copy casi literal de su post |
| 04 | Los siete ejes | Grid bento asimétrico | Equivale a "Habitaciones & Residencias" |
| 05 | Campo Lago | Foto + bloque oscuro. "Nuestra casa" | Da lugar físico y permanencia |
| 06 | Experiencias Dharma | 3 tarjetas; la primera siempre es la próxima | **Motor del sitio en 2026** |
| 07 | Dharma Fest 2027 | Bloque oscuro centrado, cuenta regresiva opcional, CTA | Respiro visual a mitad de scroll |
| 08 | 2025 en números | Cifras + galería del recap | Prueba social |
| 09 | Marcas aliadas | Grid silencioso de logos | Honra aliados y atrae nuevos |
| 10 | Voces | 3 testimonios reales de Instagram | Más creíble que copy inventado |
| 11 | Quiénes somos | Cita de la marca + foto de equipo | Ver riesgo abierto §12 |
| 12 | Sumate | CTA principal a ancho completo con formulario | Sin popups |
| 13 | Footer | Navegación, Instagram, WhatsApp, correo, legal | Instagram bien visible |

### Rutas

| Ruta | Contenido |
|---|---|
| `/` | Home en español |
| `/experiencias` | Listado: próximas arriba, archivo abajo |
| `/experiencias/[slug]` | Detalle: galería, aliados, CTA |
| `/2027` | Dharma Fest 2027: qué fue el 2025, qué viene, registro |
| `/marcas` | Aliados + formulario para aplicar |
| `/nosotros` | Historia, filosofía, equipo, Campo Lago |
| `/gracias` | Confirmación de registro |
| `/404` | Error |
| `/en/...` | Espejo completo en inglés |

**Cambio respecto a la maqueta aprobada:** el español vive en la raíz (`/`) y no en `/es`. En la
pantalla del navegador se mostró `/es · /en`; se simplifica porque el público primario es
costarricense y así se evita un salto de redirección en la ruta más visitada. El inglés
mantiene su prefijo `/en`. Si el cliente prefiere simetría `/es` + `/en`, es un cambio de una
línea en la configuración de Astro.

Cada página emite `hreflang` para ambos idiomas más `x-default` apuntando al español.

## 7. Modelo de contenido

Colecciones de contenido de Astro con esquemas validados por Zod. Todo el contenido editable
vive en `src/content/`, nunca dentro de componentes.

```
src/content/
  experiencias/   es/*.md   en/*.md
  marcas/         *.json
  ejes/           es.json   en.json
  testimonios/    *.json
  sitio/          es.json   en.json    # textos de secciones fijas
```

### `experiencias`
| Campo | Tipo | Notas |
|---|---|---|
| `titulo` | string | |
| `fecha` | date | Ordena el listado |
| `estado` | `"proxima" \| "pasada"` | Deriva la etiqueta de la tarjeta |
| `lugar` | string | Por defecto "Campo Lago" |
| `resumen` | string | Máx. 200 caracteres |
| `portada` | image | Requerida |
| `portadaAlt` | string | **Requerida** — el esquema falla el build sin texto alternativo |
| `galeria` | array de `{ src, alt }` | Opcional |
| `aliados` | array de referencias a `marcas` | Opcional |
| `ctaUrl` | url | Opcional: inscripción externa |
| `destacada` | boolean | Fija la tarjeta en la home |

### `marcas`
`nombre`, `logo`, `url`, `instagram`, `categoria` (uno de los 7 ejes), `ediciones` (array de años).
Se siembra con los ~60 handles del post de agradecimiento del 2025.

### `testimonios`
`cita`, `autor`, `handle`, `permiso` (boolean). **Los testimonios con `permiso: false` no se
renderizan.** Ver §12.

## 8. Stack e implementación

- **Astro 5** con salida estática, **Tailwind CSS 4**, **TypeScript** en modo estricto.
- Sin framework de UI. La interactividad (menú móvil, marquee, cuenta regresiva, animaciones de
  scroll, validación de formulario) se resuelve con JavaScript nativo en islas pequeñas.
- Imágenes vía `astro:assets` → AVIF y WebP, `srcset` responsivo, `loading="lazy"` bajo el
  pliegue, precarga solo del hero.
- Fuentes auto-hospedadas con `@fontsource-variable`, `font-display: swap`.
- Desarrollo local: `npm run dev`. Para mostrarle avances al cliente se abre un túnel temporal;
  **no se despliega a Vercel** hasta que el cliente lo autorice.

### Estructura

```
src/
  components/
    layout/      Header, Footer, LanguageSwitcher, SkipLink
    sections/    Hero, Marquee, Filosofia, Ejes, CampoLago,
                 Experiencias, Fest2027, Numeros2025, Marcas,
                 Voces, Nosotros, Sumate            # una por sección de la home
    ui/          Kicker, TituloSeccion, Boton, Tarjeta, Bento, Galeria
  content/       (§7)
  layouts/       Base.astro, Pagina.astro
  lib/
    i18n.ts      diccionarios, rutas, hreflang
    subscribe.ts adaptador de suscripción (ver abajo)
  pages/         es en raíz, en/ para inglés
  styles/        tokens.css  (todas las variables de §5)
public/img/      MANIFEST.md + placeholders
```

Una sección de la home = un componente. Ninguno conoce a los demás; todos reciben su contenido
por props desde la colección correspondiente. Así se puede reordenar la home moviendo líneas
en `index.astro`.

### Formulario de comunidad

El sitio es estático y aún no hay decisión de proveedor de correo. Se implementa
`src/lib/subscribe.ts` como **adaptador con una sola función** `subscribe(email, lang)`:

- Adaptador por defecto en desarrollo: registra en consola y devuelve éxito, para poder probar
  el flujo completo hasta `/gracias`.
- Adaptadores documentados y listos para conectar: Mailchimp, Brevo o una tabla de Supabase.
- **Ningún componente sabe qué proveedor hay detrás.** Cambiar de proveedor toca un archivo.

Esto es una brecha consciente: **hasta que el cliente elija proveedor, el formulario no guarda
nada en ningún lado.** Queda documentado en el README.

## 9. Accesibilidad

- Contraste AA en todo texto (ver la regla de `--dh-copal` en §5).
- `alt` obligatorio por esquema en toda imagen de contenido — el build falla si falta.
- Foco visible en todo elemento interactivo; enlace "saltar al contenido".
- Navegación completa por teclado, incluido el menú móvil.
- Un solo `h1` por página; jerarquía de encabezados sin saltos.
- `prefers-reduced-motion` respetado en todo el movimiento.
- El marquee es decorativo: `aria-hidden`, con los siete ejes también presentes como texto real
  en la sección 04.

## 10. Rendimiento

Objetivos en móvil, 4G simulada: LCP < 2.5 s, CLS < 0.05, sin JavaScript bloqueante.
Presupuesto: < 150 KB de JS y < 100 KB de CSS, ambos comprimidos.

## 11. Verificación

| Qué | Cómo |
|---|---|
| Tipos y contenido | `astro check` sin errores |
| Build | `npm run build` sin advertencias |
| Humo (Playwright) | Home carga en ambos idiomas; navegación funciona; el conmutador de idioma preserva la página; el formulario valida correo inválido; una experiencia renderiza desde Markdown; 404 responde |
| Accesibilidad | axe-core sobre home, `/experiencias` y `/marcas` — cero violaciones críticas |
| Contraste | Verificación manual de cada par de la tabla de paleta |
| Responsivo | 375 px, 768 px, 1440 px |

## 12. Riesgos y decisiones abiertas

1. **No hay material de marca.** No hay fotos, logo vectorial ni manual. Todo se construye con
   placeholders. Se entrega `public/img/MANIFEST.md` con cada imagen requerida, sus dimensiones
   y en qué sección aparece, para que el cliente las sustituya sin tocar código.
   *Consecuencia honesta: hasta que lleguen las fotos reales, el sitio no se va a ver como la
   referencia. La sección 04 (bento) es la que más lo va a sufrir.*
2. **Sección 11 sin personas.** The Retreat apoya la mitad de su credibilidad en Diana Stobo,
   con nombre y cara. En el Instagram de Dharma no queda claro quién está detrás. Si hay
   fundadora, dupla o equipo visible, esta sección mejora mucho. **Pregunta pendiente al cliente.**
3. **Testimonios de terceros.** Las citas de la sección 10 son comentarios reales de
   `@laparcecr`, `@jessteinspira` y `@naturezasaladbar`. Son personas y negocios reales.
   **No se publican sin permiso.** El campo `permiso` del esquema arranca en `false` y los
   testimonios sin permiso no se renderizan; la sección se oculta si no hay ninguno aprobado.
   Lo mismo aplica a los ~60 logos de marcas de la sección 09.
4. **Cifras del 2025.** Los números de la sección 08 se contaron de la lista de agradecimientos
   del post del 1 de septiembre de 2025. **Falta el dato más importante: cuántas personas
   asistieron.** Solo el cliente lo tiene.
5. **Fecha del 2027 desconocida.** La cuenta regresiva de la sección 07 se muestra únicamente si
   el cliente confirma una fecha. Sin fecha, el bloque se renderiza sin contador.
6. **Sin proveedor de correo.** Ver §8. El formulario no persiste hasta que se elija uno.
7. **Paleta sin validar** contra un manual de marca oficial. Ver §5.

## 13. Preguntas para el cliente

1. ¿Quién está detrás de Dharma? ¿Hay fundadora o equipo que quiera aparecer con nombre y cara?
2. ¿Cuántas personas asistieron al Dharma Fest 2025?
3. ¿Hay fecha, aunque sea tentativa, para el Dharma Fest 2027?
4. ¿Tienen banco de fotos del 2025 y de las experiencias? ¿Logo en vectorial? ¿Manual de marca?
5. ¿Con qué herramienta quieren manejar la lista de correo?
6. ¿Autorizan usar los comentarios de Instagram como testimonios, con handle?
7. ¿Hay dominio comprado?

---

## Próximo paso

Plan de implementación detallado (skill `writing-plans`).
