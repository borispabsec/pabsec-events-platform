export type AssemblyLocale = "en" | "ru" | "tr";
type L = Record<AssemblyLocale, string>;

export type Assembly = {
  session: L;
  title: L;
  location: L;
  date: L;
  flipId: number | null; // null → use legacyUrl
  legacyUrl?: string;
};

export const PAST_ASSEMBLIES: Assembly[] = [
  {
    session: { en: "66th", ru: "66-я", tr: "66." },
    title: {
      en: "66th PABSEC General Assembly",
      ru: "66-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 66. Genel Kurul Oturumu",
    },
    location: {
      en: "Sofia, Bulgaria",
      ru: "София, Болгария",
      tr: "Sofya, Bulgaristan",
    },
    date: {
      en: "23–25 November 2025",
      ru: "23–25 ноября 2025",
      tr: "23–25 Kasım 2025",
    },
    flipId: 18,
  },
  {
    session: { en: "65th", ru: "65-я", tr: "65." },
    title: {
      en: "65th PABSEC General Assembly",
      ru: "65-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 65. Genel Kurul Oturumu",
    },
    location: {
      en: "Baku, Azerbaijan",
      ru: "Баку, Азербайджан",
      tr: "Bakü, Azerbaycan",
    },
    date: {
      en: "17–19 June 2025",
      ru: "17–19 июня 2025",
      tr: "17–19 Haziran 2025",
    },
    flipId: 17,
  },
  {
    session: { en: "64th", ru: "64-я", tr: "64." },
    title: {
      en: "64th PABSEC General Assembly",
      ru: "64-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 64. Genel Kurul Oturumu",
    },
    location: {
      en: "Yerevan, Armenia",
      ru: "Ереван, Армения",
      tr: "Erivan, Ermenistan",
    },
    date: {
      en: "10–12 December 2024",
      ru: "10–12 декабря 2024",
      tr: "10–12 Aralık 2024",
    },
    flipId: 16,
  },
  {
    session: { en: "63rd", ru: "63-я", tr: "63." },
    title: {
      en: "63rd PABSEC General Assembly",
      ru: "63-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 63. Genel Kurul Oturumu",
    },
    location: {
      en: "Tirana, Albania",
      ru: "Тирана, Албания",
      tr: "Tiran, Arnavutluk",
    },
    date: {
      en: "13–15 May 2024",
      ru: "13–15 мая 2024",
      tr: "13–15 Mayıs 2024",
    },
    flipId: 15,
  },
  {
    session: { en: "62nd", ru: "62-я", tr: "62." },
    title: {
      en: "62nd PABSEC General Assembly",
      ru: "62-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 62. Genel Kurul Oturumu",
    },
    location: {
      en: "Kyiv, Ukraine",
      ru: "Киев, Украина",
      tr: "Kiev, Ukrayna",
    },
    date: {
      en: "16–17 November 2023",
      ru: "16–17 ноября 2023",
      tr: "16–17 Kasım 2023",
    },
    flipId: 13,
  },
  {
    session: { en: "61st", ru: "61-я", tr: "61." },
    title: {
      en: "61st PABSEC General Assembly",
      ru: "61-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 61. Genel Kurul Oturumu",
    },
    location: {
      en: "Ankara, Türkiye",
      ru: "Анкара, Турция",
      tr: "Ankara, Türkiye",
    },
    date: {
      en: "4–5 May 2023",
      ru: "4–5 мая 2023",
      tr: "4–5 Mayıs 2023",
    },
    flipId: 12,
  },
  {
    session: { en: "60th", ru: "60-я", tr: "60." },
    title: {
      en: "60th PABSEC General Assembly",
      ru: "60-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 60. Genel Kurul Oturumu",
    },
    location: {
      en: "Belgrade, Serbia",
      ru: "Белград, Сербия",
      tr: "Belgrad, Sırbistan",
    },
    date: {
      en: "6–8 December 2022",
      ru: "6–8 декабря 2022",
      tr: "6–8 Aralık 2022",
    },
    flipId: 10,
  },
  {
    session: { en: "58th", ru: "58-я", tr: "58." },
    title: {
      en: "58th PABSEC General Assembly",
      ru: "58-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 58. Genel Kurul Oturumu",
    },
    location: {
      en: "Videoconference",
      ru: "Видеоконференция",
      tr: "Video Konferans",
    },
    date: {
      en: "22 November 2021",
      ru: "22 ноября 2021",
      tr: "22 Kasım 2021",
    },
    flipId: null,
    legacyUrl: "https://www.pabsec.org/page-detail/pabsec-general-assemblies/8",
  },
  {
    session: { en: "57th", ru: "57-я", tr: "57." },
    title: {
      en: "57th PABSEC General Assembly",
      ru: "57-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 57. Genel Kurul Oturumu",
    },
    location: {
      en: "Videoconference",
      ru: "Видеоконференция",
      tr: "Video Konferans",
    },
    date: {
      en: "22 June 2021",
      ru: "22 июня 2021",
      tr: "22 Haziran 2021",
    },
    flipId: null,
    legacyUrl: "https://www.pabsec.org/page-detail/pabsec-general-assemblies/8",
  },
  {
    session: { en: "56th", ru: "56-я", tr: "56." },
    title: {
      en: "56th PABSEC General Assembly",
      ru: "56-я сессия Генеральной Ассамблеи ПАЧЭС",
      tr: "KEİPA 56. Genel Kurul Oturumu",
    },
    location: {
      en: "Videoconference",
      ru: "Видеоконференция",
      tr: "Video Konferans",
    },
    date: {
      en: "24 November 2020",
      ru: "24 ноября 2020",
      tr: "24 Kasım 2020",
    },
    flipId: null,
    legacyUrl: "https://www.pabsec.org/page-detail/pabsec-general-assemblies/8",
  },
];
