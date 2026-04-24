import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./lib/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Exclude /admin, /api/*, _next assets, _vercel, and static files (.*\..*)
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};
