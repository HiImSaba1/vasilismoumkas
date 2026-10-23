import "server-only";
import {secondarySeo} from "@/lib/secondary-seo";
import {listDestinations} from "@/lib/destinations";
import { getSeoSettings,defaultSeoSettings,type SeoPageKey } from "@/lib/seo-settings";
import { getHomepageSettings,defaultHomepageSettings } from "@/lib/homepage-settings";
import { listPortfolioProjects } from "@/lib/portfolio";
import { getSeoOverrides,type SeoOverride } from "@/lib/seo-overrides";
export async function getSeoCoverage(snapshot?:Record<string,SeoOverride>) {
  const [settings, home, projects, overrides] = await Promise.all([getSeoSettings(), getHomepageSettings(), listPortfolioProjects({ includeUnpublished: true }), snapshot??getSeoOverrides()]);
  const destinations=await listDestinations(true);
  const base = [...Object.entries(secondarySeo).map(([path,page])=>({...page,path,published:true,fallback:true})),...destinations.map(item=>({path:`/destinations/${item.slug}`,title:item.content.seoTitle,description:item.content.metaDescription,image:item.content.image,published:item.content.published,fallback:!item.content.seoTitle||!item.content.metaDescription})),{ path: "/", title: home.seo.title, description: home.seo.description, image: home.seo.image, published: true, fallback: home.seo.title===defaultHomepageSettings.seo.title&&home.seo.description===defaultHomepageSettings.seo.description },
    ...Object.entries(settings).filter(([key]) => key !== "business").map(([key, value]) => {
      const page = value as typeof settings.about;
      return { path: ["wedding", "editorial", "engagement"].includes(key) ? `/portfolio/${key}` : `/${key}`, title: page.title, description: page.description, image: page.image, published: true, fallback: page.title===defaultSeoSettings[key as SeoPageKey].title||page.description===defaultSeoSettings[key as SeoPageKey].description };
    }),
    ...projects.map(project => ({ path: `/portfolio/project/${project.slug}`, title: project.seoTitle || `${project.title} | ${project.location || "Wedding Story"} | Vasilis Moumkas`, description: project.metaDescription || project.description?.slice(0, 500) || `Explore ${project.title}, photographed by Vasilis Moumkas${project.location ? ` in ${project.location}` : ""}.`, image: project.thumbnail, published: project.published !== false, fallback: !project.seoTitle || !project.metaDescription }))];
  return base.map(page => ({ ...page, override: overrides[page.path] ?? { seoTitle: "", metaDescription: "", socialTitle: "", socialDescription: "", socialImage: "", noindex: false } }));
}
