import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTH_NAMES: Record<string, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
};

// Nominative forms for flexible date labels (e.g. "Ноябрь / Декабрь 2026")
const MONTH_NAMES_NOMINATIVE: Record<string, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
};

const EN_MONTHS = MONTH_NAMES_NOMINATIVE.en;

export function translateFlexibleDate(text: string, locale: string): string {
  if (locale === "en") return text;
  const names = MONTH_NAMES_NOMINATIVE[locale];
  if (!names) return text;
  let result = text;
  for (let i = 0; i < EN_MONTHS.length; i++) {
    if (result.includes(EN_MONTHS[i])) {
      result = result.split(EN_MONTHS[i]).join(names[i]);
    }
  }
  return result;
}

function formatSingleDate(date: Date, locale: string): string {
  const d = date.getUTCDate();
  const mon = (MONTH_NAMES[locale] ?? MONTH_NAMES.en)[date.getUTCMonth()];
  const y = date.getUTCFullYear();
  if (locale === "ru") return `${d} ${mon} ${y} г.`;
  if (locale === "tr") return `${d} ${mon} ${y}`;
  return `${mon} ${d}, ${y}`;
}

export function formatDate(date: Date | string, locale: string): string {
  return formatSingleDate(new Date(date), locale);
}

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: string
): string {
  return `${formatSingleDate(new Date(start), locale)} – ${formatSingleDate(new Date(end), locale)}`;
}
