import {getPublicPageSettings} from "@/lib/public-page-settings";
import {ManagedAbout} from "@/components/sections/ManagedPages";
export default async function AboutPage(){return <ManagedAbout content={(await getPublicPageSettings("about")).content}/>;}
