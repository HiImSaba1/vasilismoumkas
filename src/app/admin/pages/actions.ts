"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { defaultPublicPageContent, publicPageSchemas } from "@/lib/public-page-content";
import { defaultHomepageSettings, homepageSettingsSchema, HOMEPAGE_SETTINGS_KEY } from "@/lib/homepage-settings";
import { publicPageSettingKey } from "@/lib/public-page-settings";
import { writeContentWorkspace } from "@/lib/content-workspace";
import {uploadWebsiteMedia} from "@/lib/website-media";

export async function uploadPageMediaAction(_state:{success:boolean;message:string},formData:FormData) {
  await requireAdmin();
  try {
    const scope=z.string().regex(/^\/admin\/(pages\/(home|about|services|contact)|destinations\/[a-z0-9-]+)$/).parse(formData.get("scope"));
    const file=formData.get("mediaFile");if(!(file instanceof File))throw new Error("Choose an image to upload.");
    await uploadWebsiteMedia(file,z.string().min(3).max(300).parse(formData.get("mediaAlt")));
    revalidatePath(scope);
    return {success:true,message:"Image uploaded to the existing media library. Choose it in the page image picker; public content has not changed."};
  }catch(error){return {success:false,message:error instanceof Error?error.message:"Unable to upload image."};}
}

export async function savePageContentAction(_state: { success: boolean; message: string }, formData: FormData) {
  await requireAdmin();
  try {
    const page = z.enum(["home", "about", "services", "contact"]).parse(formData.get("page"));
    const version = z.string().regex(/^[a-f0-9]{64}$/).parse(formData.get("version"));
    const workspaceVersion = z.string().regex(/^[a-f0-9]{64}$/).parse(formData.get("workspaceVersion"));
    const mode = z.enum(["draft", "publish"]).parse(formData.get("mode"));
    const json = z.string().max(200000).parse(formData.get("contentJson"));
    const content = page === "home" ? homepageSettingsSchema.parse(JSON.parse(json)) : publicPageSchemas[page].parse(JSON.parse(json));
    await writeContentWorkspace({ key: page === "home" ? HOMEPAGE_SETTINGS_KEY : publicPageSettingKey(page), content, expectedVersion: version, expectedWorkspaceVersion: workspaceVersion, mode, fallback: page === "home" ? defaultHomepageSettings : defaultPublicPageContent[page] });
    if (mode === "publish") revalidatePath(page === "home" ? "/" : `/${page}`);
    revalidatePath(`/admin/pages/${page}`);
    revalidatePath(`/admin/pages/${page}/preview`);
    if (page === "home") revalidatePath("/admin/homepage");
    return { success: true, message: mode === "draft" ? "Draft saved. Public content is unchanged. You can preview this saved draft." : "Reviewed content published. The previous public version was retained for restore." };
  } catch (error) {
    return { success: false, message: error instanceof z.ZodError ? `Check the page fields: ${error.issues[0]?.path.join(" · ")} — ${error.issues[0]?.message}` : error instanceof Error ? error.message : "Unable to save page content." };
  }
}
