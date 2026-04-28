"use server";

import path from "path";
import fs from "fs/promises";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

async function deleteFile(relativePath: string, folder: "images" | "documents") {
  const filename = path.basename(relativePath);
  if (!filename) return;
  try {
    await fs.unlink(path.join(process.cwd(), "public", "uploads", folder, filename));
  } catch { /* file missing — ignore */ }
}

// Keep images for the 10 newest events; delete files + null DB for older ones
async function cleanupOldHeroImages() {
  const eventsWithImages = await db.event.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
    orderBy: { startDate: "desc" }, // newest first
  });
  if (eventsWithImages.length <= 10) return;
  const toClean = eventsWithImages.slice(10);
  for (const ev of toClean) {
    if (ev.imageUrl) await deleteFile(ev.imageUrl, "images");
    await db.event.update({ where: { id: ev.id }, data: { imageUrl: null } });
  }
}

function parseDates(formData: FormData) {
  const startStr = (formData.get("startDate") as string) || "";
  const endStr   = (formData.get("endDate")   as string) || "";
  return {
    startDate: startStr ? new Date(startStr) : new Date("2099-01-01"),
    endDate:   endStr   ? new Date(endStr)   : new Date("2099-12-31"),
  };
}

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const assemblyNumber = (formData.get("assemblyNumber") as string).trim();
  const slug = `ga${assemblyNumber}`;
  const { startDate, endDate } = parseDates(formData);
  const location = (formData.get("location") as string).trim() || "TBA";
  const status = formData.get("status") as string;
  const heroTextColor = (formData.get("heroTextColor") as string) || "auto";
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const dateFlexible = formData.get("dateFlexible") === "on";
  const dateFlexibleText = dateFlexible ? ((formData.get("dateFlexibleText") as string).trim() || null) : null;
  const registrationDeadlineStr = (formData.get("registrationDeadline") as string) || "";
  const registrationDeadline = registrationDeadlineStr ? new Date(registrationDeadlineStr) : null;
  const requirePassport = formData.get("requirePassport") === "on";
  const requirePhoto = formData.get("requirePhoto") === "on";

  await db.event.create({
    data: {
      slug,
      startDate,
      endDate,
      location,
      status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
      heroTextColor,
      imageUrl,
      dateFlexible,
      dateFlexibleText,
      registrationDeadline,
      requirePassport,
      requirePhoto,
      translations: {
        create: (["en", "ru", "tr"] as const).map((locale) => ({
          locale,
          title: (formData.get(`title_${locale}`) as string).trim(),
          description: (formData.get(`description_${locale}`) as string) || "",
          location: (formData.get(`location_${locale}`) as string).trim() || null,
        })),
      },
    },
  });

  await cleanupOldHeroImages();
  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("eventId") as string).trim();
  const { startDate, endDate } = parseDates(formData);
  const location = (formData.get("location") as string).trim() || "TBA";
  const status = formData.get("status") as string;
  const heroTextColor = (formData.get("heroTextColor") as string) || "auto";
  const imageUrl = (formData.get("imageUrl") as string) || null;
  const dateFlexible = formData.get("dateFlexible") === "on";
  const dateFlexibleText = dateFlexible ? ((formData.get("dateFlexibleText") as string).trim() || null) : null;
  const registrationDeadlineStr = (formData.get("registrationDeadline") as string) || "";
  const registrationDeadline = registrationDeadlineStr ? new Date(registrationDeadlineStr) : null;
  const requirePassport = formData.get("requirePassport") === "on";
  const requirePhoto = formData.get("requirePhoto") === "on";

  // If image was replaced, delete the old file
  const existing = await db.event.findUnique({ where: { id }, select: { imageUrl: true } });
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) {
    await deleteFile(existing.imageUrl, "images");
  }

  await db.event.update({
    where: { id },
    data: {
      startDate,
      endDate,
      location,
      status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
      heroTextColor,
      imageUrl,
      dateFlexible,
      dateFlexibleText,
      registrationDeadline,
      requirePassport,
      requirePhoto,
    },
  });

  for (const locale of ["en", "ru", "tr"] as const) {
    const title = (formData.get(`title_${locale}`) as string).trim();
    const description = (formData.get(`description_${locale}`) as string) || "";
    const locLocation = (formData.get(`location_${locale}`) as string).trim() || null;

    await db.eventTranslation.upsert({
      where: { eventId_locale: { eventId: id, locale } },
      create: { eventId: id, locale, title, description, location: locLocation },
      update: { title, description, location: locLocation },
    });
  }

  await cleanupOldHeroImages();
  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("eventId") as string).trim();

  // Fetch files to delete before cascading DB delete
  const event = await db.event.findUnique({
    where: { id },
    select: {
      imageUrl: true,
      documents: { select: { fileUrl: true } },
    },
  });

  if (event) {
    if (event.imageUrl) await deleteFile(event.imageUrl, "images");
    for (const doc of event.documents) {
      await deleteFile(doc.fileUrl, "documents");
    }
  }

  await db.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events");
}
