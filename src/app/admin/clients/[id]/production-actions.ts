"use server";
import { requireAdmin } from "@/lib/admin-auth";
import { deliverables, productionSchema, saveClientProduction } from "@/lib/client-production";
import { getClient } from "@/lib/clients";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function updateClientProduction(form: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(form.get("clientId"));
  if (!await getClient(id)) throw new Error("Client not found.");
  const field = (name: string) => String(form.get(name) ?? "").trim();
  const value = productionSchema.parse({
    folder: field("folder"),
    gallery: field("gallery"),
    expiry: field("expiry"),
    items: deliverables.map(key => ({
      owner: field(key + "-owner"), due: field(key + "-due"), complete: form.has(key + "-complete"),
    })),
  });
  await saveClientProduction(id, value);
  revalidatePath("/admin/clients/" + id);
  revalidatePath("/admin/pending");
}
