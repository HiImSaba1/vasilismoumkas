import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const read = path => readFile(resolve(process.cwd(), path), "utf8");
const checks = [];
const requireText = (source, pattern, label) => {
  if (!pattern.test(source)) throw new Error(`FAIL - ${label}`);
  checks.push(`PASS - ${label}`);
};

const [picker, wedding, baptism, browser, config] = await Promise.all([
  read("src/components/admin/AdminDatePicker.tsx"),
  read("src/app/admin/dashboard/WeddingDashboard.tsx"),
  read("src/app/admin/dashboard/BaptismDashboard.tsx"),
  read("e2e/admin-date-picker.spec.ts"),
  read("playwright.config.ts"),
]);

requireText(picker, /type="date"[\s\S]*name=\{name\}/, "event date uses the browser-native calendar control");
requireText(picker, /defaultValue=\{inputValue\(initialDate\)\}/, "native calendar starts from the known event date");
requireText(picker, /min=\{`\$\{currentYear - 1\}-01-01`\}/, "native calendar has a defined start year");
requireText(picker, /max=\{`\$\{currentYear \+ 10\}-12-31`\}/, "native calendar supports long-range future bookings");
requireText(picker, /format\(date, "yyyy-MM-dd"\)/, "submitted date uses stable ISO calendar format");
requireText(picker, /Tap to choose day, month and year/, "date control explains the native mobile interaction");
requireText(wedding, /<AdminDatePicker[\s\S]*name="date"[\s\S]*initialDate=\{initialEventDate\}/, "wedding offer uses the shared controlled picker");
requireText(baptism, /<AdminDatePicker[\s\S]*name="date"[\s\S]*initialDate=\{initialEventDate\}/, "baptism offer uses the shared controlled picker");
requireText(wedding, /submittedDate = parseISO\(getVal\("date"\)\)[\s\S]*d: isValid\(submittedDate\)/, "wedding offer payload persists the authoritative ISO date field");
requireText(baptism, /submittedDate = parseISO\(getVal\("date"\)\)[\s\S]*d: isValid\(submittedDate\)/, "baptism offer payload persists the authoritative ISO date field");
requireText(browser, /fill\("2028-09-14"\)[\s\S]*toHaveValue\("2028-09-14"\)/, "browser test changes year, month and day");
requireText(browser, /toHaveValue\("2029-05-19"\)/, "browser test verifies native mobile fallback");
requireText(config, /iphone-webkit[\s\S]*iPhone 13/, "Playwright includes an iPhone WebKit project");

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} Sprint 05A source contracts verified.`);
