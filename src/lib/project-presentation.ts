import type { Project } from "@/app/(site)/data/ProjectsData";

export function projectHeaderAlt(project: Pick<Project,"headerImageAlt"|"thumbnail"|"photoset"|"title"|"location">) {
  return project.headerImageAlt?.trim() || project.photoset?.find(photo=>photo.src===project.thumbnail)?.alt?.trim() || `${project.title}${project.location ? ` in ${project.location}` : ""}`;
}

export function portfolioCategorySlug(category: string): string | null {
  const key=category.trim().toLowerCase();
  const aliases:Record<string,string>={wedding:"wedding",weddings:"wedding",editorial:"editorial",editorials:"editorial",engagement:"engagement",engagements:"engagement",baptism:"baptism",baptisms:"baptism"};
  return aliases[key] ?? null;
}

export function portfolioCategoryHref(category: string) {
  const slug=portfolioCategorySlug(category);
  return slug ? `/portfolio/${slug}` : "/portfolio";
}
