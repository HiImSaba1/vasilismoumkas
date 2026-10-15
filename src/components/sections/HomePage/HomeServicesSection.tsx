import type {HomepageSettings} from "@/lib/homepage-settings";
import HomeMarqueeImages from "./HomeMarqueeImages";
import HomeProjectVideoSection from "./HomeProjectVideoSection";

export default function HomeServicesSection({story}:{story:HomepageSettings["story"]}){
  return <section className="w-full overflow-hidden bg-off-white">
    <HomeProjectVideoSection content={story}/>
    <HomeMarqueeImages/>
  </section>;
}
