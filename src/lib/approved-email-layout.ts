import type {EmailTemplate} from "./email-templates";
import {initialEmailComposition,type EmailComposition} from "./email-composition";

// Preserve each variant's approved copy. Only its visual layout is standardized.
export function approvedEmailLayout(template:EmailTemplate):EmailComposition {
  const content=initialEmailComposition(template.bodyText,template.locale,template.id);
  const compact=template.id==="002"||template.id==="003";
  return{...content,style:"editorial",showHeaderImage:compact?false:content.showHeaderImage,destination:["001","002","003"].includes(template.id)?"offer":content.destination};
}
