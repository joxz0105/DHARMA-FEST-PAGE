import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next 16 renombro middleware.ts a proxy.ts. El archivo DEBE llamarse asi:
// con el nombre viejo, Next lo ignora en silencio y el ruteo bilingue no corre.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|img|.*\..*).*)",
};
