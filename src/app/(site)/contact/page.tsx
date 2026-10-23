import ContactPageClient from "./ContactPageClient";
import {getPublicPageSettings} from "@/lib/public-page-settings";
export default async function ContactPage(){const{content}=await getPublicPageSettings("contact");return <ContactPageClient content={content}/>;}
