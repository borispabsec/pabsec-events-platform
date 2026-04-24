"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "1") redirect("/admin");
}

export async function deleteUser(formData: FormData) {
  await requireAdmin();
  const id = formData.get("userId") as string;
  if (!id) return;
  await db.authUser.delete({ where: { id } });
  redirect("/admin/users");
}
