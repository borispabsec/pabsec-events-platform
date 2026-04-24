"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin");
}
