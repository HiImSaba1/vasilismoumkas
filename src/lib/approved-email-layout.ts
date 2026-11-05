import type {EmailTemplate} from "./email-templates";
import {initialEmailComposition,type EmailComposition} from "./email-composition";

// Preserve each variant's approved copy. Only its visual layout is standardized.
export function approvedEmailLayout(template:EmailTemplate):EmailComposition {
  const content=initialEmailComposition(template.bodyText,template.locale,template.id);
  const compact=template.id==="002"||template.id==="003";
  return{...content,style:"editorial",showHeaderImage:compact?false:content.showHeaderImage,destination:["001","002","003"].includes(template.id)?"offer":content.destination};
}

// Explicit opt-in only: never reflow or replace an existing customer's draft.
export function approvedWeddingProposal():{content:EmailComposition;headerImage:string}{
  const content=initialEmailComposition("","el","001");
  return{headerImage:"/vm_img/Projects/Laura_Alex/vasilis_moumkas_laura_alex_14.webp",content:{...content,style:"editorial",greeting:"Καλησπέρα {{couple_names}},",introduction:"Χαίρομαι πολύ που επικοινωνούμε για τον γάμο σας.",imageAlt:"Φωτογραφία του Βασίλη Μούμκα",destination:"none",closing:"Με εκτίμηση,",gallery:{...content.gallery,enabled:false},video:{...content.video,enabled:false},sections:[
    {id:"personal-introduction",type:"text",title:"",text:""},
    {id:"approved-image-2",type:"image",image:"/uploads/portfolio/angeliki-victor-spinalonga-crete-wedding/18-angeliki-victor-crete-wedding-bride-smiling-veil-coast-29.jpg",alt:"Bride looking back and smiling beside the sea, with her long veil flowing across the foreground."},
    {id:"tailored-experience",type:"text",title:"Μια εμπειρία στα μέτρα σας",text:"Κάθε συλλογή μπορεί να προσαρμοστεί στις επιθυμίες σας και στον τρόπο που ονειρεύεστε τη γιορτή σας.\n\nΣτις συλλογές που περιλαμβάνουν After-Wedding, αφιερώνουμε λίγο ακόμη χρόνο μόνο στους δυο σας. Μια ξεχωριστή φωτογράφιση σε έναν τόπο που αγαπάτε ή που ονειρεύεστε να επισκεφθείτε μαζί."},
    {id:"approved-image-3",type:"image",image:"/uploads/portfolio/eva-george/6276177f-1335-488b-8546-ffe92398f7c6.webp",alt:"Eva and George beneath an ivy-covered stone arch overlooking a garden and the sea."},
    {id:"personal-offer",type:"button",label:"Δείτε την προσωπική σας προσφορά",destination:"offer",url:""},
    {id:"discussion",type:"text",title:"",text:"Θα χαρώ να κανονίσουμε μια σύντομη συζήτηση, να ακούσω όσα σχεδιάζετε και να δούμε ποια συλλογή σας ταιριάζει περισσότερο."},
    {id:"optional-practical-details",type:"text",title:"",text:""},
  ]}};
}
