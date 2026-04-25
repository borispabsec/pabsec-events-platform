"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

export async function createUpcomingEvent(formData: FormData) {
  await requireAdmin();

  const category = (formData.get("category") as string).trim();
  const session  = (formData.get("session")  as string).trim() || null;
  const status   = (formData.get("status")   as string) || "SAVE_THE_DATE";
  const location = (formData.get("location") as string).trim() || "TBA";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  const dateFlexible = formData.get("dateFlexible") === "on";
  const dateFlexibleText = dateFlexible ? ((formData.get("dateFlexibleText") as string).trim() || null) : null;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr   = formData.get("endDate")   as string;
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate   = endDateStr   ? new Date(endDateStr)   : null;

  const titleEn = (formData.get("title_en") as string).trim();
  const titleRu = (formData.get("title_ru") as string).trim();
  const titleTr = (formData.get("title_tr") as string).trim();

  await db.upcomingEvent.create({
    data: {
      category,
      session,
      status,
      location,
      sortOrder,
      dateFlexible,
      dateFlexibleText,
      startDate,
      endDate,
      translations: {
        create: (["en", "ru", "tr"] as const)
          .map((locale) => {
            const title = locale === "en" ? titleEn : locale === "ru" ? titleRu : titleTr;
            return { locale, title: title || titleEn };
          }),
      },
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events?section=upcoming");
}

export async function updateUpcomingEvent(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("upcomingEventId") as string).trim();
  const category = (formData.get("category") as string).trim();
  const session  = (formData.get("session")  as string).trim() || null;
  const status   = (formData.get("status")   as string) || "SAVE_THE_DATE";
  const location = (formData.get("location") as string).trim() || "TBA";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
  const dateFlexible = formData.get("dateFlexible") === "on";
  const dateFlexibleText = dateFlexible ? ((formData.get("dateFlexibleText") as string).trim() || null) : null;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr   = formData.get("endDate")   as string;
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const endDate   = endDateStr   ? new Date(endDateStr)   : null;

  await db.upcomingEvent.update({
    where: { id },
    data: { category, session, status, location, sortOrder, dateFlexible, dateFlexibleText, startDate, endDate },
  });

  for (const locale of ["en", "ru", "tr"] as const) {
    const title = (formData.get(`title_${locale}`) as string).trim();
    if (!title) continue;
    await db.upcomingEventTranslation.upsert({
      where: { upcomingEventId_locale: { upcomingEventId: id, locale } },
      create: { upcomingEventId: id, locale, title },
      update: { title },
    });
  }

  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events?section=upcoming");
}

export async function deleteUpcomingEvent(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("upcomingEventId") as string).trim();
  await db.upcomingEvent.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events?section=upcoming");
}
