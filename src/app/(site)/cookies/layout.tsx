import {publicMetadata} from "@/lib/seo-overrides";
import {secondarySeo} from "@/lib/secondary-seo";
export async function generateMetadata(){return publicMetadata(secondarySeo["/cookies"],"/cookies");}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>;}
