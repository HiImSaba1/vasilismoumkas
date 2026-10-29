import {ContentMediaUpload} from "@/components/admin/ContentMediaUpload";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requireAdmin} from "@/lib/admin-auth";
import {publicPageSettingKey} from "@/lib/public-page-settings";
import {defaultHomepageSettings,homepageSettingsSchema,HOMEPAGE_SETTINGS_KEY} from "@/lib/homepage-settings";
import {getContentWorkspace,getPublishedContentSnapshot} from "@/lib/content-workspace";
import {listInternalLinks} from "@/lib/internal-links";
import {listWebsiteImages} from "@/lib/website-media";
import {publicPageSchemas,defaultPublicPageContent} from "@/lib/public-page-content";
import {PageContentForm} from "../PageContentForm";
export default async function PageEditor({params}:{params:Promise<{page:string}>}){
 await requireAdmin(); const {page}=await params;
 if(page!=="home"&&page!=="about"&&page!=="services"&&page!=="contact"&&page!=="education")notFound();
 const key=page==="home"?HOMEPAGE_SETTINGS_KEY:publicPageSettingKey(page);
 const [snapshot,work,images,links]=await Promise.all([getPublishedContentSnapshot(key,page==="home"?defaultHomepageSettings:defaultPublicPageContent[page]),getContentWorkspace(key),listWebsiteImages(),listInternalLinks()]);
 const content=page==="home"?homepageSettingsSchema.parse(snapshot.content):publicPageSchemas[page].parse(snapshot.content);
 return <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><Link href="/admin/pages" className="text-sm underline">Back to Pages</Link><h1 className="mt-6 text-4xl font-light uppercase">{page} editor</h1><Link href={page==="home"?"/":`/${page}`} target="_blank" className="mt-4 inline-block border px-4 py-2 text-xs">View current public page</Link><p className="mt-4 text-sm"><Link href="/admin/website" className="underline">Edit shared footer and shared Contact image</Link></p><ContentMediaUpload scope={`/admin/pages/${page}`}/><PageContentForm page={page} content={content} version={snapshot.version} workspace={work.workspace} workspaceVersion={work.version} images={images} links={links}/></main>;
}
