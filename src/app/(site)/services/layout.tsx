import type {Metadata} from "next";
import {getSeoSettings,pageMetadata} from "@/lib/seo-settings";
export async function generateMetadata():Promise<Metadata>{return pageMetadata((await getSeoSettings()).services,"/services")}
export default function ServicesLayout({children}:{children:React.ReactNode}){return <>{children}</>}
