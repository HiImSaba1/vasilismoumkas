import {publicMetadata} from "@/lib/seo-overrides";
import {ManagedHome} from "@/components/sections/ManagedHome";
import type {Metadata} from "next";
import {getHomepageSettings} from "@/lib/homepage-settings";
export async function generateMetadata():Promise<Metadata>{return publicMetadata((await getHomepageSettings()).seo,"/");}
export default async function HomePage(){return <ManagedHome settings={await getHomepageSettings()}/>;}
