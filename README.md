# Dharma Fest CR — sitio

Casa de marca bilingüe para **Dharma Fest Costa Rica**, festival de bienestar en Camp Lago.
La home habla al público; `/patrocinios` reemplaza al PDF de patrocinios que hoy se manda a
las marcas.

Construido contra el material real del cliente: el deck *DHARMA Fest 2027 — Patrocinios
Oficiales* (21 láminas), de donde salen la identidad visual, el copy aprobado, las cifras y
las 125 imágenes del sitio.

## Arrancar

```bash
npm install
npm run dev
```

Español en `http://localhost:3000`, inglés en `http://localhost:3000/en`.

## Pruebas

```bash
npm run verificar
```

Encadena las tres: unitarias (Vitest), build y end-to-end (Playwright + axe).
Por separado: `npm test`, `npm run build`, `npm run test:e2e`.

Los e2e levantan **su propio servidor de producción en el puerto 3100**, con su propio
directorio de build. No pisan el `npm run dev` que tengas abierto.

## Despliegue

El sitio **está en Vercel**, en el proyecto `dharma-fest-page`, enlazado a este repo:

- Producción: <https://dharma-fest-page.vercel.app> — sale de `main`
- Cada rama y cada PR generan su propio preview

**Mergear a `main` publica.** No hay paso manual intermedio.

Para mostrar algo sin publicarlo, sirve el preview de la rama, o un túnel temporal:

```bash
cloudflared tunnel --url http://localhost:3000
```

### El dominio

`SITIO`, en `lib/rutas.ts`, es el origen de canónicas, hreflang, sitemap y robots. **No se
escribe a mano.** Sale, en este orden, de `NEXT_PUBLIC_SITIO`, del dominio de producción que
Vercel expone solo, o de localhost.

Cuando Dharma pase el dominio real se agrega en Vercel y esto lo toma sin tocar código.

### Antes de publicar

`content/beneficios.json` lleva cuatro marcas con `confirmado: false`. Están como ejemplo para
enseñar la idea: ninguna aceptó dar un descuento. Publicar el logo de una marca junto a una
oferta que no aceptó convierte a Dharma en anunciante y la vuelve exigible (art. 113 b) del
reglamento 37899-MEIC a la Ley 7472). O confirman por escrito, o se quitan los logos y queda el
rango del programa solo.

## Cómo está armado

| | |
|---|---|
| `app/[locale]/` | Páginas. El layout raíz vive acá dentro para que `next/root-params` exponga el idioma |
| `components/secciones/` | Una por sección de página |
| `components/ui/` | Primitivas del lenguaje visual del deck |
| `content/` | Datos en JSON, validados con Zod al cargarlos |
| `lib/leads.ts` | **Único** punto de escritura de datos personales |
| `proxy.ts` | Ruteo bilingüe. En Next 16 el archivo se llama así, no `middleware.ts` |
| `scripts/` | Extracción de las imágenes del deck. Ver `scripts/README.md` |

**El contenido no vive en el código.** Para cambiar una cifra, sumar una marca o ajustar un
beneficio de patrocinio se toca un JSON en `content/`, no un componente.

## Datos de personas

El sitio alimenta una base que ya tiene 26.000 personas, así que cae bajo la **Ley 8968** de
Costa Rica. Los formularios llevan casilla de consentimiento explícita —nunca premarcada—,
declaran la finalidad al lado del campo y enlazan a `/privacidad`.

Las capturas se escriben en `data/leads.jsonl`, **fuera de git**. El día que el cliente elija
proveedor de correo se cambia `lib/leads.ts` y ningún otro archivo.

## Reglas que hay tests vigilando

Estas no dependen de que alguien se acuerde:

- **Los precios de patrocinio no se publican.** Están en `content/paquetes.json` para tenerlos
  a mano, pero un test recorre `/patrocinios` y falla si aparece un monto o un `US$`.
- **El lima nunca va sobre fondo claro.** Da 1.68:1. Hay un test de contraste WCAG sobre toda
  la paleta.
- **`palido` (`#E4E8AD`) no es un beige**, es lima al 79% de luz. Un test comprueba que
  comparte tono con el lima.
- **La casilla de consentimiento no viene premarcada.**
- **Los logos son PNG con transparencia.** En JPEG salen con un rectángulo de fondo.

## Falta del cliente

Lo que bloquea trabajo, en orden:

1. **La fecha del Dharma Fest 2027.** No está en el deck. Sin ella no hay cuenta regresiva ni
   `schema.org/Event`, y `/2027` pierde su dato principal.
2. **Quién está detrás de la marca.** `/nosotros` queda corta hasta saberlo.
3. **Qué es Camp Lago respecto de Dharma** —¿sede, productor, socios?— y si se escribe
   *Camp* o *Campo*: el deck usa las dos.
4. **Precio y condiciones del stand del Mercadito.**
5. **La política de privacidad** y la identidad del responsable del tratamiento.

No bloquea, pero mejora el sitio: si hay venta de entradas, logo vectorial y manual de marca,
handles de Facebook y TikTok, confirmación del dominio, y el número de WhatsApp.

Además, dos logos del deck (`marcas-51` y `marcas-52`) no tienen texto legible y quedaron
fuera de `content/marcas.json`: hay que preguntarle al cliente de qué marcas son.

## Documentos

- Diseño: `docs/superpowers/specs/2026-09-09-dharma-fest-v2-design.md`
- Plan de implementación: `docs/superpowers/plans/2026-09-09-dharma-fest-v2.md`

El trabajo anterior, hecho sin material del cliente, quedó como registro en la rama
`v1-referencia-retreat`.
