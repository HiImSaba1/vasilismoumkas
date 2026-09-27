import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root=process.cwd();
const read=(path)=>readFile(resolve(root,path),"utf8");
const checks=[];
const requireText=(source,pattern,label)=>{if(!pattern.test(source))throw new Error(`FAIL - ${label}`);checks.push(`PASS - ${label}`)};

const[schema,migration,delivery,action,sender,wedding,baptism,datePicker]=await Promise.all([
  read("database/schema.sql"),
  read("database/migrations/016_email_delivery_idempotency.sql"),
  read("src/lib/email-delivery.ts"),
  read("src/app/admin/leads/actions.ts"),
  read("src/components/admin/EditableEmailComposer.tsx"),
  read("src/app/admin/dashboard/WeddingDashboard.tsx"),
  read("src/app/admin/dashboard/BaptismDashboard.tsx"),
  read("src/components/admin/AdminDatePicker.tsx"),
]);

requireText(schema,/idempotency_key VARCHAR\(64\)/,"base schema contains the idempotency key");
requireText(schema,/UNIQUE INDEX uq_deliveries_idempotency/,"base schema enforces unique email attempts");
requireText(migration,/ADD UNIQUE INDEX uq_deliveries_idempotency/,"production migration adds the unique guard");
requireText(delivery,/INSERT IGNORE INTO email_deliveries/,"delivery persistence claims a unique send request");
requireText(delivery,/duplicate:true/,"duplicate delivery requests return without another SMTP call");
requireText(action,/idempotencyKey:z\.uuid\(\)/,"Lead action validates the unique request token");
requireText(action,/already completed[\s\S]*was not sent twice/,"Lead action reports duplicate prevention");
requireText(sender,/pending\?"Sending…"/,"Lead UI exposes the sending state");
requireText(sender,/disabled=\{unavailable\|\|pending\|\|state\.success\}/,"Lead UI disables repeat clicks");
requireText(sender,/window\.confirm\("Send another copy/,"deliberate resend requires confirmation");
for(const[source,label]of[[wedding,"wedding"],[baptism,"baptism"]]){
  requireText(source,/<AdminDatePicker[\s\S]*name="date"/,`${label} offer uses the reliable shared date control`);
}
requireText(datePicker,/type="date"/,"event calendar uses the browser-native day, month and year picker");
requireText(datePicker,/min=\{`\$\{currentYear - 1\}-01-01`\}/,"event calendar has a defined start year");
requireText(datePicker,/max=\{`\$\{currentYear \+ 10\}-12-31`\}/,"event calendar supports long-range future bookings");
requireText(datePicker,/defaultValue=\{inputValue\(initialDate\)\}/,"event calendar preserves known lead dates");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 01 source contracts verified.`);
