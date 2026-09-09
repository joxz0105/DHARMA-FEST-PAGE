# Sitio de Dharma Fest Costa Rica

Casa de marca de Dharma Fest. Sitio estático bilingüe hecho con Astro.

## Correr el proyecto

    npm install
    npm run placeholders   # genera las imágenes marcadoras
    npm run dev            # http://localhost:4321

## Verificar antes de mostrar

    npm run verificar

Corre, en orden, el chequeo de tipos, los tests unitarios, el build y los
tests end-to-end (incluida la auditoría de accesibilidad con axe). Es la
única puerta que debe pasar antes de mostrarle el sitio al cliente.

Los tests end-to-end corren contra un build real servido con
`astro preview`, no contra `astro dev`: el sitemap solo existe después de un
build, y el status del 404 solo se comporta bien contra el sitio estático
real. Si corrés `npm run test:e2e` a mano y ves
"Process from config.webServer exited early", volvé a correr el comando; el
servidor normalmente ya quedó arriba.

## Cómo agregar una experiencia

1. Crear `src/content/experiencias/es/<nombre>.md` y
   `src/content/experiencias/en/<nombre>.md`. **Los dos archivos deben llamarse
   igual**, o el enlace entre idiomas apunta a una página que no existe.
2. Poner la portada en `src/assets/img/experiencias/<nombre>.jpg`.
3. Llenar el frontmatter. `portadaAlt` es obligatorio: sin él, el build falla.
4. `estado: proxima` la manda al inicio del listado; `pasada`, al archivo.

## Cómo cambiar textos

Todo el texto de las secciones fijas vive en `src/content/sitio/es.json` y
`en.json`. Los dos archivos deben tener exactamente las mismas claves; hay un
test que lo verifica.

## Accesibilidad

`tests/e2e/accesibilidad.spec.ts` corre axe-core contra `/`, `/experiencias`,
`/marcas`, `/nosotros`, `/2027` y `/en/`, y falla si aparece cualquier
violación con impacto `critical` o `serious`. El umbral no se toca: si algo
falla ahí, es un problema de contraste, orden de encabezados o landmarks que
hay que corregir en el componente, no en el test.

El escaneo emula `prefers-reduced-motion: reduce` antes de navegar. Las
secciones animadas (`<Reveal>`) hacen una transición de opacidad de ~600ms al
entrar en pantalla; sin emular movimiento reducido, axe puede escanear a
mitad de esa transición y medir un contraste que no existe en reposo. Con
movimiento reducido, `<Reveal>` salta directo al estado final (el mismo
camino que ya toma para quien pide menos movimiento en su sistema), así que
axe mide los colores reales del diseño.

## Presupuesto de peso

    npm run build
    find dist -name "*.js" -exec gzip -c {} \; | wc -c
    find dist -name "*.css" -exec gzip -c {} \; | wc -c

Restricción global: JS por debajo de 150 000 bytes comprimidos, CSS por
debajo de 100 000. El sitio no emite archivos `.js` separados — Astro en
`output: 'static'` inlinea los pocos scripts de cada página (menú móvil,
`<Reveal>`, validación del formulario) directo en el HTML, así que ese
`find` da 0. La página más pesada en JavaScript inline es la portada, con
~1.7 KB sin comprimir (~0.9 KB con gzip). El único CSS del sitio pesa
19 823 bytes sin comprimir y 4 910 con gzip. Ambos números están muy por
debajo del presupuesto.

## Estado del proyecto: lo que falta del cliente

Estas cosas están construidas pero apagadas, esperando material o permiso:

- **Fotos.** Todo lo que se ve son marcadores. La lista completa de lo que hace
  falta está en `public/img/MANIFEST.md`.
- **Correos.** El formulario funciona de punta a punta pero **no guarda nada**.
  Para conectarlo, escribir un `Proveedor` en `src/lib/subscribe.ts` y cambiar
  la constante `PROVEEDOR`. Ningún componente más se toca.
- **Testimonios y marcas.** Están en el repo con `"permiso": false`, así que sus
  secciones no se renderizan. Cambiar a `true` solo con autorización del cliente.
- **Fecha del 2027.** Sin fecha, el bloque va sin cuenta regresiva. Para
  activarla, pasarle `fechaObjetivo` a `<Fest2027>`. Esa cuenta regresiva se
  calcula una sola vez, en el momento del build (el sitio es estático): no se
  actualiza minuto a minuto en el navegador. Quien la active debe saberlo
  antes de prometer un contador en vivo.
- **Dominio.** `astro.config.mjs` y `public/robots.txt` usan
  `https://dharmafest.cr` como provisional; el cliente todavía no confirmó
  dominio.
- **Equipo.** La sección "Quiénes somos" no nombra a nadie porque no sabemos
  quién está detrás de la marca.

## Despliegue

No hay. Por decisión explícita del cliente el proyecto es local; para mostrar
avances se abre un túnel temporal.
