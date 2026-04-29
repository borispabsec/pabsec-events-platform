import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

const PABSEC_BASE = "https://www.pabsec.org";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

interface ImportedMember {
  name: string;
  position: string;
}

async function scrapeDelegation(country: string): Promise<ImportedMember[]> {
  const slug = country.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const urls = [
    `${PABSEC_BASE}/members?country=${encodeURIComponent(country)}`,
    `${PABSEC_BASE}/national-delegations/${slug}`,
    `${PABSEC_BASE}/delegations/${slug}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: FETCH_HEADERS, next: { revalidate: 1800 } });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      const members: ImportedMember[] = [];

      // Try various common selectors for member lists
      const selectors = [
        ".member-card", ".member-item", ".delegate-card",
        "[data-member]", ".person-card", ".mp-card",
      ];

      for (const sel of selectors) {
        $(sel).each((_i, el) => {
          const name = $(el).find(".name, h3, h4, .member-name, .title").first().text().trim();
          const position = $(el).find(".position, .role, .subtitle, p").first().text().trim();
          if (name) members.push({ name, position });
        });
        if (members.length > 0) return members;
      }

      // Fallback: scan table rows for country match
      $("table tr").each((_i, row) => {
        const text = $(row).text().toLowerCase();
        if (!text.includes(country.toLowerCase())) return;
        const cells = $(row).find("td");
        if (cells.length >= 2) {
          const name = $(cells[0]).text().trim();
          const position = $(cells[1]).text().trim();
          if (name && name.split(" ").length >= 2) members.push({ name, position });
        }
      });

      if (members.length > 0) return members;
    } catch {
      continue;
    }
  }

  return [];
}

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country") ?? "";
  if (!country) {
    return NextResponse.json({ members: [] });
  }

  try {
    const members = await scrapeDelegation(country);
    return NextResponse.json({ members, country });
  } catch {
    return NextResponse.json({ members: [], country });
  }
}
