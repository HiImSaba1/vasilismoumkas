import type {Metadata} from "next";
import {getSeoSettings,pageMetadata} from "@/lib/seo-settings";
export async function generateMetadata():Promise<Metadata>{return pageMetadata((await getSeoSettings()).about,"/about")}
export default function AboutLayout({children}:{children:React.ReactNode}){return <>{children}</>}
