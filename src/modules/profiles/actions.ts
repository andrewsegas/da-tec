"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type FormState } from "@/lib/forms";
import { profileSchema } from "./validation";
import { normalizeHandle } from "./social";

export async function saveProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    course: formData.get("course"),
    period: formData.get("period"),
    avatarUrl: formData.get("avatarUrl") ?? "",
    bio: formData.get("bio") ?? "",
    github: formData.get("github") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    instagram: formData.get("instagram") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { fullName, course, period, avatarUrl, bio, github, linkedin, instagram } =
    parsed.data;
  const isOnboarding = formData.get("intent") === "onboarding";

  const update: Record<string, unknown> = {
    full_name: fullName,
    course,
    period,
    avatar_url: avatarUrl && avatarUrl.length > 0 ? avatarUrl : null,
    bio: bio && bio.length > 0 ? bio : null,
    github_username: normalizeHandle(github),
    linkedin_username: normalizeHandle(linkedin),
    instagram_username: normalizeHandle(instagram),
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
