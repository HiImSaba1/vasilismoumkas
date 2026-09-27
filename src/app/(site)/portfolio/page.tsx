import CinematicSlider from "@/components/animations/CinematicSlider";
import { listPortfolioProjects } from "@/lib/portfolio";
export default async function PortfolioPage(){const projects=(await listPortfolioProjects()).filter(project=>project.category.toLowerCase()!=="baptism");return <section className="min-h-screen bg-color-ink-black text-color-off-white"><CinematicSlider projects={projects}/></section>}
