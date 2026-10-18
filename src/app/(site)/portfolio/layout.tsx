import type {Metadata} from "next";
import {getSeoSettings,pageMetadata} from "@/lib/seo-settings";
export async function generateMetadata():Promise<Metadata>{return pageMetadata((await getSeoSettings()).portfolio,"/portfolio")}
export default function PortfolioLayout({children}:{children:React.ReactNode}){return <>{children}</>}
