import { notFound } from "next/navigation";

/**
 * Atrapatodo del segmento de idioma.
 *
 * Sin esto, una ruta inexistente cae en la pagina de error interna de Next
 * —fondo blanco, "404: This page could not be found."— en vez de en nuestro
 * not-found.tsx, porque el layout raiz vive dentro de [locale] y Next no lo
 * aplica a rutas que no matchean ningun segmento.
 */
export default function Atrapatodo() {
  notFound();
}
