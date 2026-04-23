import { unstable_cache } from "next/cache";
import * as cheerio from "cheerio";
import { PAST_ASSEMBLIES, type Assembly } from "@/lib/data/archive";

const PABSEC_BASE = "https://www.pabsec.org";
const ASSEMBLIES_URL = `${PABSEC_BASE}/page-detail/pabsec-general-assemblies/8`;
const CALENDAR_URL = `${PABSEC_BASE}/calendar`;

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

async function getLocaleCookie(locale: string): Promise<string> {
  try {
    const res = await fetch(`${PABSEC_BASE}/setlocale/${locale}`, {
      redirect: "manual",
      headers: FETCH_HEADERS,
    });
    const cookie = res.headers.get("set-cookie") ?? "";
    // Extract just the cookie name=value pair before the first semicolon
    return cookie.split(";")[0] ?? "";
  } catch {
    return "";
  }
}

async function fetchPage(url: string, locale = "en"): Promise<string> {
  const extraCookie = locale !== "en" ? await getLocaleCookie(locale) : "";
  const headers: Record<string, string> = { ...FETCH_HEADERS };
  if (extraCookie) headers["Cookie"] = extraCookie;

  const res = await fetch(url, {
    headers,
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

// ── Assembly list parser ──────────────────────────────────────────────────────

function parseAssemblies(html: string): Assembly[] {
  const $ = cheerio.load(html);
  const results: Assembly[] = [];

  // pabsec.org uses a standard <table> for the assembly list
  $("table tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const sessionRaw = $(cells[0]).text().trim();
    const locationRaw = $(cells[1]).text().trim();
    const dateRaw = $(cells[2]).text().trim();

    // Extract the link (assemblies-flip URL) from any cell or the whole row
    let docsUrl = $(row).find('a[href*="assemblies-flip"]').attr("href") ?? "";
    if (docsUrl && !docsUrl.startsWith("http")) {
      docsUrl = `${PABSEC_BASE}${docsUrl}`;
    }
    if (!docsUrl) docsUrl = ASSEMBLIES_URL;

    // Skip header rows
    if (!sessionRaw || sessionRaw.toLowerCase().includes("session")) return;

    results.push({
      session: sessionRaw.replace(/General Assembly/i, "").trim(),
      title: sessionRaw.includes("General Assembly")
        ? sessionRaw
        : `${sessionRaw} General Assembly`,
      location: locationRaw,
      date: dateRaw,
      docsUrl,
    });
  });

  return results.length > 0 ? results : [];
}

// ── Calendar event type ───────────────────────────────────────────────────────

export type CalendarEvent = {
  title: string;
  date: string;
  location: string;
};

function parseCalendar(html: string): CalendarEvent[] {
  const $ = cheerio.load(html);
  const results: CalendarEvent[] = [];

  // Try table rows first
  $("table tr").each((_i, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;
    const title = $(cells[0]).text().trim();
    const date = $(cells[1]).text().trim();
    const location = cells.length > 2 ? $(cells[2]).text().trim() : "";
    if (title && date) results.push({ title, date, location });
  });

  if (results.length > 0) return results;

  // Fallback: try list items
  $("li").each((_i, el) => {
    const text = $(el).text().trim();
    if (text.length > 10) results.push({ title: text, date: "", location: "" });
  });

  return results;
}

// ── Cached public API ─────────────────────────────────────────────────────────

export const getPabsecAssemblies = unstable_cache(
  async (locale = "en"): Promise<Assembly[]> => {
    try {
      const html = await fetchPage(ASSEMBLIES_URL, locale);
      const parsed = parseAssemblies(html);
      return parsed.length > 0 ? parsed : PAST_ASSEMBLIES;
    } catch {
      return PAST_ASSEMBLIES;
    }
  },
  ["pabsec-assemblies"],
  { revalidate: 3600 }
);

export const getPabsecCalendar = unstable_cache(
  async (locale = "en"): Promise<CalendarEvent[]> => {
    try {
      const html = await fetchPage(CALENDAR_URL, locale);
      return parseCalendar(html);
    } catch {
      return [];
    }
  },
  ["pabsec-calendar"],
  { revalidate: 3600 }
);
