import {getPublicPageSettings} from "@/lib/public-page-settings";
import {ManagedServices} from "@/components/sections/ManagedPages";
export default async function ServicesPage(){return <ManagedServices content={(await getPublicPageSettings("services")).content}/>;}
