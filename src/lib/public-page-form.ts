export type PageFormValue = string | boolean | PageFormValue[] | { [key: string]: PageFormValue };

export function publicPageFields(value: PageFormValue, path = "content"): { name: string; value: string }[] {
  if (typeof value === "string" || typeof value === "boolean") return [{ name: path, value: String(value) }];
  return Object.entries(value).flatMap(([key, item]) => publicPageFields(item, `${path}.${key}`));
}

export function readPublicPageForm(shape: PageFormValue, data: FormData, path = "content"): PageFormValue {
  if (typeof shape === "string" || typeof shape === "boolean") {
    const value = data.get(path);
    if (typeof value !== "string") throw new Error("A page field is missing. Reload before saving.");
    if (typeof shape === "boolean") {
      if (value !== "true" && value !== "false") throw new Error("Invalid visibility value.");
      return value === "true";
    }
    return value;
  }
  if (Array.isArray(shape)) return shape.map((item, index) => readPublicPageForm(item, data, `${path}.${index}`));
  return Object.fromEntries(Object.entries(shape).map(([key, item]) => [key, readPublicPageForm(item, data, `${path}.${key}`)]));
}
