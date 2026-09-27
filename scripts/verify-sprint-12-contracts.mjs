import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = (path) => readFile(resolve(process.cwd(), path), "utf8");
const checks = [];
const requireText = (source, pattern, label) => {
  if (!pattern.test(source)) throw new Error(`FAIL - ${label}`);
  checks.push(`PASS - ${label}`);
};

const [manager, locale, browser] = await Promise.all([
  read("src/app/admin/clients/[id]/InvoicePaymentManager.tsx"),
  read("src/components/admin/AdminLocale.tsx"),
  read("e2e/invoice-payments.spec.ts"),
]);

requireText(manager, /useRouter/, "payment manager can refresh server data");
requireText(manager, /if\(state\.success\)router\.refresh\(\)/, "successful payment mutations refresh totals automatically");
requireText(manager, /Math\.round\(invoiceTotal\*25\)\/100/, "deposit shortcut calculates 25 percent of the accepted total");
requireText(manager, /Math\.min\(maximum,/, "deposit shortcut never exceeds the remaining balance");
requireText(manager, /Use 25% deposit/, "payment form exposes the 25 percent shortcut");
requireText(locale, /ΧΡΗΣΗ ΠΡΟΚΑΤΑΒΟΛΗΣ 25%/, "deposit shortcut has an uppercase accent-free Greek translation");
requireText(locale, /current!==stored&&current!==greekNode\(stored,element\)/, "Greek translation preserves fresh React text updates");
requireText(locale, /characterData:true/, "translator observes live balance text changes");
requireText(browser, /toHaveValue\("400"\)/, "browser test verifies the 25 percent amount");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 12 reactive-payment contracts verified.`);
