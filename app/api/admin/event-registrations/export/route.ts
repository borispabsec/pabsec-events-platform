import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import ExcelJS from "exceljs";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "1";
}

function fmt(d?: Date | null): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  const where = eventId ? { eventId } : {};

  const [registrations, eventInfo] = await Promise.all([
    db.eventRegistration.findMany({
      where,
      orderBy: [{ country: "asc" }, { lastName: "asc" }],
    }),
    eventId
      ? db.event.findUnique({
          where: { id: eventId },
          select: {
            startDate: true,
            endDate: true,
            location: true,
            translations: { where: { locale: "en" }, select: { title: true } },
          },
        })
      : null,
  ]);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Participants");

  const NAVY = "FF0B1E3D";
  const GOLD = "FFC9A84C";
  const GOLD_LIGHT = "FFFFF3CD";
  const YELLOW_LIGHT = "FFFFFFCC";

  // Header rows
  const eventTitle = eventInfo?.translations[0]?.title ?? "PABSEC Event";
  const dateRange = eventInfo
    ? `${fmt(eventInfo.startDate)} – ${fmt(eventInfo.endDate)} | ${eventInfo.location}`
    : "";

  ws.mergeCells("A1:S1");
  const r1 = ws.getRow(1);
  r1.getCell(1).value = "PABSEC — Parliamentary Assembly of the Black Sea Economic Cooperation";
  r1.getCell(1).font = { bold: true, color: { argb: NAVY }, size: 13 };
  r1.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
  r1.height = 22;

  ws.mergeCells("A2:S2");
  const r2 = ws.getRow(2);
  r2.getCell(1).value = `${eventTitle}    ${dateRange}`;
  r2.getCell(1).font = { bold: true, color: { argb: NAVY }, size: 11 };
  r2.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFECF0F5" } };
  r2.height = 18;

  ws.addRow([]);

  const HEADERS = [
    "№", "Country", "Last Name", "First Name", "Position / Role",
    "Arrival Date", "Arrival Airport", "Route", "Flight No", "Arrival Time",
    "Hotel", "Departure Date", "Departure Airport", "Departure Flight", "Departure Time",
    "Via Istanbul", "VIP", "Remarks", "Status",
  ];

  const headerRow = ws.addRow(HEADERS);
  headerRow.height = 18;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: GOLD } },
    };
  });

  const COL_WIDTHS = [5, 16, 16, 16, 24, 14, 16, 28, 14, 12, 22, 14, 16, 14, 12, 12, 6, 28, 12];
  COL_WIDTHS.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  registrations.forEach((r, idx) => {
    const isVip = r.isVip;
    const isPending = r.status === "pending";

    const row = ws.addRow([
      idx + 1,
      r.country,
      r.lastName,
      r.firstName,
      r.position ?? r.participantRole,
      r.arrivalDate ? fmt(r.arrivalDate) : "",
      r.arrivalAirport ?? "",
      r.arrivalRoute ?? "",
      r.arrivalFlight ?? "",
      r.arrivalTime ?? "",
      r.hotelAssigned ?? r.hotelName ?? (r.needsHotel ? "Requested" : ""),
      r.departureDate ? fmt(r.departureDate) : "",
      r.departureAirport ?? "",
      r.departureFlight ?? "",
      r.departureTime ?? "",
      r.viaIstanbul ? (r.istanbulVipLounge ? "Yes + VIP Lounge" : "Yes") : "",
      r.isVip ? "✓" : "",
      [r.adminNotes, r.specialRequests, r.dietaryRestrictions !== "none" ? r.dietaryRestrictions : ""]
        .filter(Boolean).join(" | "),
      r.status.toUpperCase(),
    ]);

    row.height = 16;
    if (isVip) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD_LIGHT } };
        cell.font = { bold: true, size: 10 };
      });
    } else if (isPending) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW_LIGHT } };
        cell.font = { size: 10 };
      });
    } else {
      row.eachCell((cell) => {
        cell.font = { size: 10 };
      });
    }

    row.eachCell((cell, colIdx) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
        right: colIdx === 1 || colIdx === 5 || colIdx === 10 || colIdx === 15
          ? { style: "thin", color: { argb: "FFD1D5DB" } }
          : undefined,
      };
    });
  });

  // Legend row
  ws.addRow([]);
  const legendRow = ws.addRow(["Legend:", "Gold = VIP", "", "Yellow = Pending review"]);
  legendRow.getCell(1).font = { bold: true, size: 9, color: { argb: "FF6B7280" } };
  legendRow.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD_LIGHT } };
  legendRow.getCell(2).font = { size: 9 };
  legendRow.getCell(4).fill = { type: "pattern", pattern: "solid", fgColor: { argb: YELLOW_LIGHT } };
  legendRow.getCell(4).font = { size: 9 };

  ws.views = [{ state: "frozen", ySplit: 4, xSplit: 0 }];

  const buffer = await wb.xlsx.writeBuffer();
  const filename = `PABSEC_Participants_${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
