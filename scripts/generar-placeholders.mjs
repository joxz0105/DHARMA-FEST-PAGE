import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const LINO = '#F6F2E9';
const BOSQUE = '#1E3527';

/** Cada entrada es una imagen que el cliente debe reemplazar. */
const IMAGENES = [
  { ruta: 'hero.jpg', w: 2400, h: 1350, etiqueta: 'HERO' },
  { ruta: 'filosofia.jpg', w: 1400, h: 1600, etiqueta: 'FILOSOFIA' },
  { ruta: 'campo-lago.jpg', w: 1600, h: 1400, etiqueta: 'CAMPO LAGO' },
  { ruta: 'equipo.jpg', w: 1400, h: 1400, etiqueta: 'EQUIPO' },
  { ruta: 'ejes/charlas.jpg', w: 1200, h: 1200, etiqueta: 'CHARLAS' },
  { ruta: 'ejes/artistas.jpg', w: 900, h: 900, etiqueta: 'ARTISTAS' },
  { ruta: 'ejes/mercadito.jpg', w: 900, h: 900, etiqueta: 'MERCADITO' },
  { ruta: 'ejes/actividades.jpg', w: 900, h: 900, etiqueta: 'ACTIVIDADES' },
  { ruta: 'ejes/gastronomia.jpg', w: 900, h: 900, etiqueta: 'GASTRONOMIA' },
  { ruta: 'ejes/asociaciones.jpg', w: 1200, h: 700, etiqueta: 'ASOCIACIONES' },
  { ruta: 'ejes/entretenimiento.jpg', w: 1200, h: 700, etiqueta: 'ENTRETENIMIENTO' },
  { ruta: 'experiencias/conecta-con-tu-piel.jpg', w: 1200, h: 900, etiqueta: 'EXPERIENCIA 1' },
  { ruta: 'experiencias/sesion-respiracion.jpg', w: 1200, h: 900, etiqueta: 'EXPERIENCIA 2' },
  { ruta: 'experiencias/proxima.jpg', w: 1200, h: 900, etiqueta: 'PROXIMA' },
];

const DESTINO = 'src/assets/img';

function svgEtiqueta(w, h, texto) {
  const tam = Math.round(Math.min(w, h) / 14);
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
       <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
             font-family="Georgia, serif" font-size="${tam}" fill="${LINO}"
             letter-spacing="${Math.round(tam / 5)}">${texto}</text>
       <text x="50%" y="${h / 2 + tam * 1.6}" text-anchor="middle"
             font-family="Georgia, serif" font-size="${Math.round(tam / 2.4)}"
             fill="${LINO}" opacity="0.55">${w} x ${h} · reemplazar</text>
     </svg>`,
  );
}

for (const { ruta, w, h, etiqueta } of IMAGENES) {
  const salida = resolve(DESTINO, ruta);
  await mkdir(dirname(salida), { recursive: true });

  await sharp({ create: { width: w, height: h, channels: 3, background: BOSQUE } })
    .composite([{ input: svgEtiqueta(w, h, etiqueta), top: 0, left: 0 }])
    .jpeg({ quality: 80 })
    .toFile(salida);

  console.log(`generado ${ruta} (${w}x${h})`);
}

const manifiesto = [
  '# Imágenes que debe entregar el cliente',
  '',
  'Cada archivo de esta lista es hoy un marcador generado por `npm run placeholders`.',
  'Reemplazar conservando **la misma ruta y la misma proporción**; el sitio se encarga',
  'del recorte, los formatos AVIF/WebP y los tamaños.',
  '',
  'Formato: JPG o PNG, a la resolución indicada o mayor. Sin texto quemado en la imagen.',
  '',
  '| Ruta en el repo | Tamaño mínimo | Dónde aparece |',
  '| --- | --- | --- |',
  ...IMAGENES.map(({ ruta, w, h, etiqueta }) =>
    `| \`src/assets/img/${ruta}\` | ${w} × ${h} | ${etiqueta} |`),
  '',
  '## Además hace falta',
  '',
  '- Logo de Dharma Fest en **SVG**, versión clara y versión oscura.',
  '- Logos de las marcas aliadas, en SVG o PNG con fondo transparente.',
  '- Galería del recap 2025: entre 8 y 12 fotos horizontales.',
  '- Opcional: video del hero, 10-15 s, sin audio, en MP4 (H.264) y WebM.',
].join('\n');

await mkdir('public/img', { recursive: true });
await writeFile('public/img/MANIFEST.md', manifiesto + '\n', 'utf8');
console.log('escrito public/img/MANIFEST.md');
