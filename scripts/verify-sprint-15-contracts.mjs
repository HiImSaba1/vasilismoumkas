import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read=path=>readFile(resolve(process.cwd(),path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};
const[migration,schema,templates,portfolio,editor,actions,composer,tsconfig]=await Promise.all([
  read("database/migrations/019_email_template_header_image.sql"),read("database/schema.sql"),read("src/lib/email-templates.ts"),read("src/lib/portfolio.ts"),read("src/app/admin/email-templates/TemplateEditor.tsx"),read("src/app/admin/email-templates/actions.ts"),read("src/components/admin/EditableEmailComposer.tsx"),read("tsconfig.json")
]);

requireText(migration,/ADD COLUMN header_image VARCHAR\(700\) NULL/,"migration adds optional per-variant header image");
requireText(schema,/email_template_variants[\s\S]*header_image VARCHAR\(700\) NULL/,"baseline schema includes the header image field");
requireText(templates,/headerImage:string\|null/,"template model exposes the selected image");
requireText(templates,/header_image,allowed_placeholders/,"template queries load the selected image");
requireText(templates,/header_image=\?/,"template updates persist the selected image");
requireText(templates,/template\.headerImage/,"SMTP template rendering uses the selected image");
requireText(portfolio,/listPortfolioEmailImages/,"portfolio library exposes reusable email images");
requireText(portfolio,/SET header_image=NULL/,"deleted portfolio images reset affected templates to the default");
requireText(actions,/Select an image from the portfolio library/,"server rejects image paths outside the portfolio library");
requireText(editor,/Email header image/,"template editor includes the image picker");
requireText(editor,/Search portfolio/,"image library is searchable");
requireText(editor,/Use default image/,"default-image reset is available");
requireText(editor,/aria-pressed=\{headerImage===image\.src\}/,"selected image has accessible state feedback");
requireText(composer,/template\.headerImage\|\|process\.env\.NEXT_PUBLIC_EMAIL_HEADER_IMAGE_URL/,"editable preview uses the selected template image");
requireText(tsconfig,/"tmp"/,"archived release snapshots are excluded from active TypeScript checks");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 15 email image-library contracts verified.`);
