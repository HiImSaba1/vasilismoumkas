import CinematicSlider from "@/components/animations/CinematicSlider";
import { listPortfolioProjects } from "@/lib/portfolio";
export default async function PortfolioPage(){const projects=(await listPortfolioProjects()).filter(project=>project.category.toLowerCase()!=="baptism");return <section className="min-h-screen bg-color-ink-black text-color-off-white"><h1 className="sr-only">Wedding Stories &amp; Photography Portfolio</h1><CinematicSlider projects={projects}/></section>}
