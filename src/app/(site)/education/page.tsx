import {getPublicPageSettings} from "@/lib/public-page-settings";
import {ManagedEducation} from "@/components/sections/ManagedEducation";
export default async function EducationPage(){return <ManagedEducation content={(await getPublicPageSettings("education")).content}/>;}