"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

export async function createEvent(formData: FormData) {
  await requireAdmin();

  const assemblyNumber = (formData.get("assemblyNumber") as string).trim();
  const slug = `ga${assemblyNumber}`;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const location = (formData.get("location") as string).trim();
  const status = formData.get("status") as string;
  const heroTextColor = (formData.get("heroTextColor") as string) || "auto";
  const imageUrl = (formData.get("imageUrl") as string) || null;

  await db.event.create({
    data: {
      slug,
      startDate,
      endDate,
      location,
      status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
      heroTextColor,
      imageUrl,
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

  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("eventId") as string).trim();
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const location = (formData.get("location") as string).trim();
  const status = formData.get("status") as string;
  const heroTextColor = (formData.get("heroTextColor") as string) || "auto";
  const imageUrl = (formData.get("imageUrl") as string) || null;

  await db.event.update({
    where: { id },
    data: {
      startDate,
      endDate,
      location,
      status: status as "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED",
      heroTextColor,
      imageUrl,
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

  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("eventId") as string).trim();
  await db.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  revalidatePath("/en");
  revalidatePath("/ru");
  revalidatePath("/tr");
  redirect("/admin/events");
}
