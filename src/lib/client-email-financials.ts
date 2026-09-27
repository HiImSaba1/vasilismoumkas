import type { EmailTemplate } from "@/lib/email-templates";
const round=(value:number)=>Math.round((value+Number.EPSILON)*100)/100;
const euro=(value:number)=>`${new Intl.NumberFormat("el-GR",{minimumFractionDigits:Number.isInteger(value)?0:2,maximumFractionDigits:2}).format(value)}€`;
export function clientEmailFinancialValues(total:number){const net=round(total*.25),vat=round(net*.24);return{deposit_percent:"25%",vat_rate:"24%",deposit_net_amount:euro(net),deposit_vat_amount:euro(vat),deposit_total_amount:euro(round(net+vat)),remaining_net_amount:euro(round(Math.max(0,total-net)))};}
export function withClientFinancialParagraph(template:EmailTemplate){
  if(template.id!=="005")return template;
  const greek=template.locale==="el";
  const event=template.eventType==="baptism"?(greek?"βάπτισης":"baptism"):(greek?"γάμου":"wedding");
  const paragraph=greek
    ?`Για την οριστική κράτηση της ημερομηνίας απαιτείται προκαταβολή {{deposit_percent}}, η οποία υπολογίζεται ως εξής:\n\nΚαθαρή αξία προκαταβολής: {{deposit_net_amount}}\nΦΠΑ {{vat_rate}}: {{deposit_vat_amount}}\nΣυνολικό ποσό προκαταβολής: {{deposit_total_amount}}\n\nΤο υπόλοιπο της καθαρής αξίας ανέρχεται στα {{remaining_net_amount}}. Με την ολοκλήρωση της προκαταβολής, η ημερομηνία της ${event} θα δεσμευτεί οριστικά στο ημερολόγιό μου.`
    :`To reserve your date, a {{deposit_percent}} deposit is required and is calculated as follows:\n\nNet deposit amount: {{deposit_net_amount}}\nVAT {{vat_rate}}: {{deposit_vat_amount}}\nTotal deposit amount: {{deposit_total_amount}}\n\nThe remaining net amount is {{remaining_net_amount}}. Once the deposit has been received, your ${event} date will be officially reserved in my calendar.`;
  const body=template.bodyText;
  const starts=["Για την οριστική κράτηση της ημερομηνίας","To reserve your date, a"];
  const start=starts.map(value=>body.indexOf(value)).filter(index=>index>=0).sort((a,b)=>a-b)[0]??-1;
  const anchors=["Μπορείτε να συμπληρώσετε το ερωτηματολόγιο","Δεν χρειάζεται να βιαστείτε","You can complete the questionnaire","You can review the questionnaire","Kind regards","Με εκτίμηση"];
  const next=anchors.map(value=>body.indexOf(value,start>=0?start:0)).filter(index=>index>=0).sort((a,b)=>a-b)[0]??-1;
  let bodyText=body;
  if(start>=0&&next>start)bodyText=`${body.slice(0,start)}${paragraph}\n\n${body.slice(next)}`;
  else if(next>=0)bodyText=`${body.slice(0,next)}${paragraph}\n\n${body.slice(next)}`;
  else bodyText=`${body.trim()}\n\n${paragraph}`;
  return{...template,bodyText,allowedPlaceholders:[...new Set([...template.allowedPlaceholders,"deposit_percent","vat_rate","deposit_net_amount","deposit_vat_amount","deposit_total_amount","remaining_net_amount"])]};
}
