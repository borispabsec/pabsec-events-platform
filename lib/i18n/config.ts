export const locales = ["en", "ru", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  tr: "Türkçe",
};
