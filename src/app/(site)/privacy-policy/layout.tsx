import {publicMetadata} from "@/lib/seo-overrides";
import {secondarySeo} from "@/lib/secondary-seo";
export async function generateMetadata(){return publicMetadata(secondarySeo["/privacy-policy"],"/privacy-policy");}
export default function Layout({children}:{children:React.ReactNode}){return <>{children}</>;}
