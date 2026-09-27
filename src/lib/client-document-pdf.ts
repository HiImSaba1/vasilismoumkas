import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument,PDFFont,PDFPage,rgb } from "pdf-lib";
import type { RowDataPacket } from "mysql2/promise";
import { getDatabase } from "@/lib/database";
import { resolveContractForWorkflowProfile } from "@/lib/contract-templates";
import { questionnaireFieldLabel,questionnaireFields } from "@/lib/questionnaire-definitions";

export type DownloadableDocumentType="contract"|"questionnaire"|"invoice";
type Language="gr"|"en";

const safe=(value:string)=>value.normalize("NFKD").replace(/[^a-zA-Z0-9-]+/g,"-").replace(/^-|-$/g,"").slice(0,70)||"client";
const clean=(value:unknown)=>String(value??"").normalize("NFC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"");
const parse=(value:unknown):Record<string,string>=>{
  if(value&&typeof value==="object"&&!Array.isArray(value))return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,clean(item)]));
  if(typeof value!=="string")return{};
  try{return parse(JSON.parse(value))}catch{return{content:clean(value)}}
};
const wrap=(value:string,font:PDFFont,size:number,width:number)=>{
  const output:string[]=[];
  for(const paragraph of clean(value).replace(/\r/g,"").split("\n")){
    if(!paragraph.trim()){output.push("");continue}
    let line="";
    for(const word of paragraph.split(/\s+/)){
      const next=line?`${line} ${word}`:word;
      if(line&&font.widthOfTextAtSize(next,size)>width){output.push(line);line=word}else line=next;
    }
    if(line)output.push(line);
  }
  return output;
};

const titles:Record<DownloadableDocumentType,Record<Language,string>>={
  questionnaire:{gr:"ΕΡΩΤΗΜΑΤΟΛΟΓΙΟ",en:"QUESTIONNAIRE"},
  contract:{gr:"ΣΥΜΦΩΝΗΤΙΚΟ",en:"AGREEMENT"},
  invoice:{gr:"ΤΙΜΟΛΟΓΙΟ",en:"INVOICE"},
};
const eventLabels={wedding:{gr:"ΓΑΜΟΣ",en:"WEDDING"},baptism:{gr:"ΒΑΠΤΙΣΗ",en:"BAPTISM"}} as const;
const statusLabels:Record<Language,Record<string,string>>={
  gr:{draft:"ΠΡΟΣΧΕΔΙΟ",ready:"ΕΤΟΙΜΟ",sent:"ΑΠΕΣΤΑΛΜΕΝΟ",completed:"ΟΛΟΚΛΗΡΩΘΗΚΕ",signed:"ΥΠΟΓΕΓΡΑΜΜΕΝΟ",issued:"ΕΚΔΟΘΗΚΕ","part-paid":"ΜΕΡΙΚΩΣ ΠΛΗΡΩΜΕΝΟ",paid:"ΠΛΗΡΩΜΕΝΟ"},
  en:{draft:"DRAFT",ready:"READY",sent:"SENT",completed:"COMPLETED",signed:"SIGNED",issued:"ISSUED","part-paid":"PART PAID",paid:"PAID"},
};
const invoiceLabels:Record<Language,Record<string,string>>={
  gr:{client_name:"ΠΕΛΑΤΗΣ",client_email:"EMAIL",client_phone:"ΤΗΛΕΦΩΝΟ",client_address:"ΔΙΕΥΘΥΝΣΗ",collection_name:"ΕΠΙΛΕΓΜΕΝΗ ΣΥΛΛΟΓΗ",collection_details:"ΠΕΡΙΓΡΑΦΗ ΣΥΛΛΟΓΗΣ",collection_hours:"ΩΡΕΣ ΚΑΛΥΨΗΣ",collection_photographers:"ΦΩΤΟΓΡΑΦΟΙ",collection_images:"ΕΠΕΞΕΡΓΑΣΜΕΝΕΣ ΦΩΤΟΓΡΑΦΙΕΣ",collection_album_prints:"ΑΛΜΠΟΥΜ / ΕΚΤΥΠΩΣΕΙΣ",collection_extras:"ΕΠΙΠΛΕΟΝ ΠΑΡΟΧΕΣ",subtotal:"ΚΑΘΑΡΗ ΑΞΙΑ",vat_rate:"ΦΠΑ %",vat_amount:"ΠΟΣΟ ΦΠΑ",deposit_percentage:"ΠΡΟΚΑΤΑΒΟΛΗ %",deposit_net:"ΚΑΘΑΡΗ ΑΞΙΑ ΠΡΟΚΑΤΑΒΟΛΗΣ",deposit_vat:"ΦΠΑ ΠΡΟΚΑΤΑΒΟΛΗΣ",deposit_total:"ΣΥΝΟΛΟ ΠΡΟΚΑΤΑΒΟΛΗΣ",prepaid_amount:"ΚΑΤΑΧΩΡΗΜΕΝΕΣ ΠΛΗΡΩΜΕΣ",total:"ΣΥΝΟΛΟ",balance_due:"ΥΠΟΛΟΙΠΟ"},
  en:{client_name:"CLIENT",client_email:"EMAIL",client_phone:"PHONE",client_address:"ADDRESS",collection_name:"SELECTED COLLECTION",collection_details:"COLLECTION DETAILS",collection_hours:"COVERAGE HOURS",collection_photographers:"PHOTOGRAPHERS",collection_images:"EDITED IMAGES",collection_album_prints:"ALBUMS / PRINTS",collection_extras:"ADDITIONAL SERVICES",subtotal:"NET VALUE",vat_rate:"VAT %",vat_amount:"VAT AMOUNT",deposit_percentage:"RETAINER %",deposit_net:"RETAINER NET VALUE",deposit_vat:"RETAINER VAT",deposit_total:"RETAINER TOTAL",prepaid_amount:"PAYMENTS RECORDED",total:"TOTAL",balance_due:"BALANCE DUE"},
};
const hiddenInvoiceKeys=new Set(["manual_total","installment_1_status","installment_1_amount","installment_1_due","payment_url","custom_questions","contract_text"]);

export async function getClientDocumentPdfData(clientId:string,type:DownloadableDocumentType){
  const[rows]=await getDatabase().query<(RowDataPacket&{couple_names:string;event_type:"wedding"|"baptism";event_date:string|null;language:"gr"|"en"|"el"|null;status:string|null;document_data:unknown})[]>("SELECT c.couple_names,c.event_type,DATE_FORMAT(c.event_date,'%Y-%m-%d') event_date,COALESCE(l.workflow_locale,o.language) language,d.status,d.document_data FROM clients c LEFT JOIN lead_document_records d ON d.lead_id=c.lead_id AND d.document_type=? LEFT JOIN leads l ON l.id=c.lead_id LEFT JOIN offers o ON o.id=c.accepted_offer_id WHERE c.id=? ORDER BY d.updated_at DESC LIMIT 1",[type,clientId]);
  const row=rows[0];
  if(!row)return null;
  const language:Language=row.language==="en"?"en":"gr";
  const data=parse(row.document_data);
  if(type==="contract")data.contract_text=resolveContractForWorkflowProfile(data.contract_text,row.event_type,language);
  return{coupleNames:clean(row.couple_names),eventType:row.event_type,eventDate:row.event_date,language,status:row.status??"draft",data};
}

export async function renderClientDocumentPdf(clientId:string,type:DownloadableDocumentType){
  const document=await getClientDocumentPdfData(clientId,type);
  if(!document)return null;
  const pdf=await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  // Roboto is embedded in full because it contains reliable Greek and Latin Unicode
  // cmap data. The display font used by the website does not cover Greek safely in PDFs.
  const font=await pdf.embedFont(await readFile(path.join(process.cwd(),"public","fonts","Roboto-Variable.ttf")),{subset:false});
  const ink=rgb(.07,.07,.09),muted=rgb(.42,.42,.44),paper=rgb(.97,.96,.92),yellow=rgb(1,1,.77);
  let page:PDFPage;
  let y=0;
  const addPage=()=>{page=pdf.addPage([595.28,841.89]);page.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:paper});page.drawRectangle({x:0,y:817,width:595.28,height:24,color:ink});page.drawText("VASILIS MOUMKAS PHOTOGRAPHY",{x:42,y:825,size:7,font,color:yellow});y=780};
  const line=(value:string,size=9.2,color=ink)=>{for(const wrapped of wrap(value,font,size,511)){if(y<55)addPage();if(!wrapped){y-=8;continue}page!.drawText(wrapped,{x:42,y,size,font,color});y-=size+4.3}};

  addPage();
  page!.drawText(titles[type][document.language],{x:42,y,size:24,font,color:ink});
  y-=34;
  line(document.coupleNames.toLocaleUpperCase(document.language==="gr"?"el-GR":"en-GB"),15);
  const event=eventLabels[document.eventType][document.language];
  const pendingDate=document.language==="gr"?"ΗΜΕΡΟΜΗΝΙΑ ΣΕ ΑΝΑΜΟΝΗ":"DATE PENDING";
  const status=statusLabels[document.language][document.status]??document.status.replaceAll("-"," ").toUpperCase();
  line(`${event} · ${document.eventDate??pendingDate} · ${status}`,8,muted);
  y-=20;

  if(type==="contract"){
    line(document.data.contract_text||(document.language==="gr"?"Το συμφωνητικο προετοιμαζεται απο το studio.":"The agreement is being prepared by the studio."));
    if(document.data.signed_name){y-=20;line(document.language==="gr"?"ΚΑΤΑΓΡΑΦΗ ΗΛΕΚΤΡΟΝΙΚΗΣ ΑΠΟΔΟΧΗΣ":"ELECTRONIC ACCEPTANCE RECORD",8,muted);line(`${document.language==="gr"?"Αποδοχη απο":"Accepted by"}: ${document.data.signed_name}`,10);if(document.data.signed_at)line(`${document.language==="gr"?"Ημερομηνια αποδοχης":"Accepted at"}: ${new Date(document.data.signed_at).toLocaleString(document.language==="gr"?"el-GR":"en-GB")}`,8,muted)}
  }else if(type==="questionnaire"){
    for(const field of questionnaireFields(document.eventType,document.language,document.data)){if(y<85)addPage();line(questionnaireFieldLabel(document.eventType,document.language,field.name,document.data).toLocaleUpperCase(document.language==="gr"?"el-GR":"en-GB"),7.5,muted);line(document.data[field.name]||"—",9.2);y-=8}
  }else{
    const entries=Object.entries(document.data).filter(([key,value])=>!key.startsWith("signed_")&&!hiddenInvoiceKeys.has(key)&&value!=="");
    if(!entries.length)line(document.language==="gr"?"Το τιμολογιο προετοιμαζεται απο το studio.":"The invoice is being prepared by the studio.");
    for(const[key,value]of entries){if(y<85)addPage();line(invoiceLabels[document.language][key]??key.replaceAll("_"," ").toUpperCase(),7.5,muted);line(value||"—",9.2);y-=8}
  }
  const pages=pdf.getPages();
  pages.forEach((item,index)=>item.drawText(`vasilismoumkas.com · ${index+1}/${pages.length}`,{x:42,y:25,size:7,font,color:muted}));
  return{bytes:await pdf.save(),filename:`vasilis-moumkas-${type}-${safe(document.coupleNames)}.pdf`};
}
