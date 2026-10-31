import { z } from "zod";

// A versioned body envelope uses the existing template/manual-schedule storage.
// Legacy plain-text templates remain readable and keep their renderer.
export const compositionPrefix = "VM_EMAIL_V1\n";
export function brandedEmailSubject(subject:string,eventType:"wedding"|"baptism"){
  const clean=subject.trim();
  if(/^Vasilis Moumkas (?:Wedding|Baptism) Photography\s*[—-]/i.test(clean))return clean;
  return `Vasilis Moumkas ${eventType==="baptism"?"Baptism":"Wedding"} Photography — ${clean}`.slice(0,500);
}
const text = z.string().max(12000);
const webUrl = z.string().max(1500).refine(value => {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}, "Use a complete http(s) link.");
const imagePath=z.string().max(700).refine(value=>!value||(/^\/(?:uploads\/portfolio|vm_img)\//.test(value)&&!/[\\?#\u0000-\u001f%]/.test(value)&&!value.split("/").some(part=>part===".."||part===".")),"Select an image from the portfolio library.");
const sectionBase={id:z.string().min(1).max(80)};
export const emailSectionSchema=z.discriminatedUnion("type",[
  z.object({...sectionBase,type:z.literal("text"),title:z.string().max(300),text}).strict(),
  z.object({...sectionBase,type:z.literal("image"),image:imagePath,alt:z.string().max(500)}).strict(),
  z.object({...sectionBase,type:z.literal("columns"),image:imagePath,alt:z.string().max(500),title:z.string().max(300),text,imageSide:z.enum(["left","right"])}).strict(),
  z.object({...sectionBase,type:z.literal("button"),label:z.string().max(200),destination:z.enum(["url","offer","portal"]),url:webUrl}).strict(),
]);
export type EmailSection=z.infer<typeof emailSectionSchema>;
export const emailCompositionSchema = z.object({
  version: z.literal(1), title: text, greeting: text, introduction: text,
  style:z.enum(["standard","editorial"]).default("standard"),
  buttonLabel: z.string().max(200), destination: z.enum(["offer", "portal", "none"]),
  imageAlt: z.string().max(500), closing: text,
  showHeaderImage:z.boolean().default(true),
  sections:z.array(emailSectionSchema).max(30).default([]).refine(items=>new Set(items.map(item=>item.id)).size===items.length,"Section IDs must be unique."),
  gallery: z.object({ enabled: z.boolean(), title: text, text, label: z.string().max(200), url: webUrl }),
  video: z.object({ enabled: z.boolean(), title: text, text, servicesLabel: z.string().max(200), servicesUrl: webUrl, samplesLabel: z.string().max(200), samplesUrl: webUrl, disclaimer: text }),
}).strict();
export type EmailComposition = z.infer<typeof emailCompositionSchema>;
export function readEmailComposition(body: string): EmailComposition | null {
  const decode=(value:string,depth:number):EmailComposition|null=>{
    const normalized=value.replace(/^\uFEFF/,"").trimStart();
    // HTML form submission can normalize the envelope separator to CRLF.
    const marker=/^VM_EMAIL_V1(?:\r\n|\n|\r|\\r\\n|\\n)/.exec(normalized);
    if(!marker){if(/^VM_EMAIL_V\d/.test(normalized))throw new Error("Unrecognized email design format. Reload the editor before sending.");return null}
    let content:EmailComposition;
    try{content=emailCompositionSchema.parse(JSON.parse(normalized.slice(marker[0].length)))}catch{throw new Error("Invalid saved email design. Nothing was sent; reload or repair the template.")}
    if(/^\s*VM_EMAIL_V\d/.test(content.introduction)){
      if(depth>=3)throw new Error("Too many nested email designs. Nothing was sent.");
      const emptyWrapper=!content.title.trim()&&!content.greeting.trim()&&!content.closing.trim()&&!content.sections.length&&!content.gallery.enabled&&!content.video.enabled;
      if(!emptyWrapper)throw new Error("A nested email design contains additional edits. Repair it before sending; no content was discarded.");
      return decode(content.introduction,depth+1);
    }
    return content;
  };
  return decode(body,0);
}
export function assertRenderedEmail(input:{subject:string;html:string;text:string}){
  if(/VM_EMAIL_V\d/.test(input.subject+input.html+input.text))throw new Error("Internal email design data was detected. Delivery blocked; reload the editor and preview again.");
}
export const serializeEmailComposition = (content: EmailComposition) => compositionPrefix + JSON.stringify(emailCompositionSchema.parse(content));
export function resolveEmailBody(body:string,values:Record<string,string>) {
  const replace=(value:string)=>value.replace(/{{\s*([a-z0-9_]+)\s*}}/gi,(match,key)=>values[key]||match);
  const content=readEmailComposition(body);
  if(!content)return replace(body);
  const sections=content.sections.map(section=>{switch(section.type){case "text":return{...section,title:replace(section.title),text:replace(section.text)};case "image":return{...section,alt:replace(section.alt)};case "columns":return{...section,alt:replace(section.alt),title:replace(section.title),text:replace(section.text)};case "button":return{...section,label:replace(section.label),url:replace(section.url)}}});
  return serializeEmailComposition({...content,sections,title:replace(content.title),greeting:replace(content.greeting),introduction:replace(content.introduction),buttonLabel:replace(content.buttonLabel),imageAlt:replace(content.imageAlt),closing:replace(content.closing),gallery:{...content.gallery,title:replace(content.gallery.title),text:replace(content.gallery.text),label:replace(content.gallery.label),url:replace(content.gallery.url)},video:{...content.video,title:replace(content.video.title),text:replace(content.video.text),servicesLabel:replace(content.video.servicesLabel),servicesUrl:replace(content.video.servicesUrl),samplesLabel:replace(content.video.samplesLabel),samplesUrl:replace(content.video.samplesUrl),disclaimer:replace(content.video.disclaimer)}});
}
export function initialEmailComposition(body: string, locale: "el" | "en", templateId: string): EmailComposition {
  const saved = readEmailComposition(body); if (saved) return templateId==="010"?{...saved,style:"editorial"}:saved;
  const greek = locale === "el";
  body=body.replace(/^.*(?:Σε συνεργασία με|In collaboration with|Collaborator)\s*:\s*Direct\s*$/gim,"").replace(/^Vasilis Moumkas\s*\|\s*Fine Art Wedding Photographer[\s\S]*$/im,"").trim();
  return { version: 1, style:templateId==="010"?"editorial":"standard", sections:[], showHeaderImage:true, title: "", greeting: "", introduction: body, imageAlt: greek ? "Φωτογραφία του Βασίλη Μούμκα" : "Photography by Vasilis Moumkas", closing: "", destination: ["001", "002", "003"].includes(templateId) ? "offer" : "none", buttonLabel: greek ? "Δείτε την πρόταση φωτογράφισης" : "View your photography proposal", gallery: { enabled: false, title: greek ? "Μια ολοκληρωμένη φωτογραφική ιστορία" : "A complete photographic story", text: "", label: greek ? "Δείτε τη φωτογραφική gallery" : "View the photographic gallery", url: "" }, video: { enabled: false, title: greek ? "Βιντεοσκόπηση της βάπτισης" : "Videography", text: "", servicesLabel: greek ? "Υπηρεσίες βίντεο" : "Video services", servicesUrl: "", samplesLabel: greek ? "Δείτε δείγματα βίντεο" : "View video samples", samplesUrl: "", disclaimer: greek ? "Οι υπηρεσίες βίντεο είναι ξεχωριστές και δεν περιλαμβάνονται στις τιμές της φωτογραφικής πρότασης." : "Video services are separate and are not included in the photography proposal." } };
}
export function assertResolvedEmail(subject: string, body: string) {
  if (/\{\{[^}]+\}\}|\[MISSING:/i.test(subject + body)) throw new Error("Complete all missing email variables before sending or scheduling.");
  const content = readEmailComposition(body);
  if(content)assertEmailSectionsReady(content);
  if (content?.gallery.enabled && (!content.gallery.url || !content.gallery.label)) throw new Error("Complete the gallery link and label.");
  if (content?.video.enabled && (!content.video.servicesUrl || !content.video.samplesUrl)) throw new Error("Complete both video links.");
}
export function assertCompositionDestination(body:string,hasOffer:boolean,hasPortal:boolean){
  const content=readEmailComposition(body);
  if(content?.destination==="offer"&&!hasOffer)throw new Error("Connect an offer before sending or scheduling.");
  if(content?.destination==="portal"&&!hasPortal)throw new Error("Connect a portal before sending or scheduling.");
  for(const section of content?.sections??[]){if(section.type!=="button")continue;if(section.destination==="offer"&&!hasOffer)throw new Error("A section button needs a connected offer.");if(section.destination==="portal"&&!hasPortal)throw new Error("A section button needs a connected portal.")}
}
export function assertEmailSectionsReady(content:EmailComposition){
  for(const[index,section]of content.sections.entries()){
    const label=`Section ${index+1}`;
    if((section.type==="image"||section.type==="columns")&&(!section.image||!section.alt.trim()))throw new Error(`${label}: choose a photo and add its description.`);
    if((section.type==="text"||section.type==="columns")&&!section.title.trim()&&!section.text.trim())throw new Error(`${label}: add a heading or text.`);
    if(section.type==="button"&&(!section.label.trim()||(section.destination==="url"&&!section.url)))throw new Error(`${label}: add the button label and link.`);
  }
}
export function assertEmailSectionImages(body:string,images:readonly {src:string}[]){
  for(const section of readEmailComposition(body)?.sections??[]){if((section.type==="image"||section.type==="columns")&&section.image&&!images.some(image=>image.src===section.image))throw new Error("A section image is no longer in the portfolio library. Choose it again.")}
}
export function moveEmailSection(sections:EmailSection[],id:string,offset:-1|1){const index=sections.findIndex(section=>section.id===id),next=index+offset;if(index<0||next<0||next>=sections.length)return sections;const result=[...sections];[result[index],result[next]]=[result[next],result[index]];return result;}
export function newEmailSection(type:EmailSection["type"],id:string):EmailSection{switch(type){case"text":return{id,type,title:"",text:""};case"image":return{id,type,image:"",alt:""};case"columns":return{id,type,image:"",alt:"",title:"",text:"",imageSide:"left"};case"button":return{id,type,label:"",destination:"url",url:""}}}
export function localizedEmailDate(value: string, locale: "el" | "en") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
