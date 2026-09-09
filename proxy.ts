import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 renombro middleware.ts a proxy.ts. El archivo DEBE llamarse asi:
// con el nombre viejo, Next lo ignora en silencio y el ruteo bilingue no corre.
export default createMiddleware(routing);

export const config = {
  // OJO con el escape: en una cadena de TS, "\." colapsa a "." y el patron
  // pasa a ser ".*..*", que excluye toda ruta de un caracter o mas. El sitio
  // entero devolvia 404 salvo la raiz. El backslash tiene que ir doble.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
