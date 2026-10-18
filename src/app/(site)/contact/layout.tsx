import type {Metadata} from "next";
import {getSeoSettings,pageMetadata} from "@/lib/seo-settings";
export async function generateMetadata():Promise<Metadata>{return pageMetadata((await getSeoSettings()).contact,"/contact")}
export default function ContactLayout({children}:{children:React.ReactNode}){return <>{children}</>}
