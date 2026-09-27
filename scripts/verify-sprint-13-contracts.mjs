import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = (path) => readFile(resolve(process.cwd(), path), "utf8");
const checks = [];
const requireText = (source, pattern, label) => {
  if (!pattern.test(source)) throw new Error(`FAIL - ${label}`);
  checks.push(`PASS - ${label}`);
};

const [page,clientComposer,sharedComposer,action] = await Promise.all([
  read("src/app/admin/clients/[id]/email/page.tsx"),
  read("src/app/admin/clients/[id]/email/ClientEmailComposer.tsx"),
  read("src/components/admin/EditableEmailComposer.tsx"),
  read("src/app/admin/clients/[id]/email/actions.ts"),
]);

requireText(page, /listEmailTemplates\(client\.eventType,"en"\)/, "client composer loads the English variants");
requireText(page, /listEmailTemplates\(client\.eventType,"el"\)/, "client composer loads the Greek variants");
requireText(clientComposer, /Client email language/, "client composer exposes a dedicated language control");
requireText(clientComposer, /setLocale\("en"\)/, "English email selection is available");
requireText(clientComposer, /setLocale\("el"\)/, "Greek email selection is available");
requireText(clientComposer, /key=\{locale\}/, "language switching resets the editable subject and body");
requireText(sharedComposer, /name="locale" value=\{template\.locale\}/, "selected template locale is submitted with the email");
requireText(sharedComposer, /template\.eventType.*template\.locale.*selected.*attempt/, "template state is keyed by event, locale, template and send attempt");
requireText(action, /locale:z\.enum\(\["el","en"\]\)/, "server validates the selected email locale");
requireText(action, /getEmailTemplate\(input\.templateId,client\.eventType,input\.locale\)/, "server sends the selected bilingual variant");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 13 bilingual client-email contracts verified.`);
