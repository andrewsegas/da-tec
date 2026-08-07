"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { profileSchema } from "./validation";

export async function saveProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    course: formData.get("course"),
    period: formData.get("period"),
    avatarUrl: formData.get("avatarUrl") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { fullName, course, period, avatarUrl } = parsed.data;
  const isOnboarding = formData.get("intent") === "onboarding";

  const update: Record<string, unknown> = {
    full_name: fullName,
    course,
    period,
    avatar_url: avatarUrl && avatarUrl.length > 0 ? avatarUrl : null,
  };
  if (isOnboarding) {
    update.onboarded_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar o perfil. Tente novamente." };
  }

  revalidatePath("/perfil");
  redirect("/perfil");
}
