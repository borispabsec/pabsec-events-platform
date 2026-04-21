import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateRange(
  start: Date | string,
  end: Date | string,
  locale: string
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}
