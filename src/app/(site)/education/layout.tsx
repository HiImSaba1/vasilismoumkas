import type {Metadata} from "next";
import {getSeoSettings,pageMetadata} from "@/lib/seo-settings";
export async function generateMetadata():Promise<Metadata>{return pageMetadata((await getSeoSettings()).education,"/education")}
export default function EducationLayout({children}:{children:React.ReactNode}){return <>{children}</>}
