import { access, readFile } from "node:fs/promises";

let failures = 0;
const check = (condition, message) => {
  if (condition) console.log(`PASS - ${message}`);
  else {
    failures += 1;
    console.error(`FAIL - ${message}`);
  }
};

const requiredFiles = [
  "database/migrations/015_email_delivery_content_archive.sql",
  "database/migrations/016_email_delivery_idempotency.sql",
  "src/components/admin/EditableEmailComposer.tsx",
  "src/components/sections/Projects/ProjectCard.tsx",
  "src/components/sections/Projects/ProjectContent.tsx",
  "PAPAKI_FEEDBACK_RELEASE.md",
];

for (const file of requiredFiles) {
  try {
    await access(file);
    check(true, `${file} is present`);
  } catch {
    check(false, `${file} is present`);
  }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const nextConfig = await readFile("next.config.ts", "utf8");
const migration015 = await readFile(requiredFiles[0], "utf8");
const migration016 = await readFile(requiredFiles[1], "utf8");
const manifestGenerator = await readFile("scripts/prepare-sprint-04-release-manifest.mjs", "utf8");

check(packageJson.scripts?.build === "next build --webpack", "production build uses Webpack on constrained Papaki hosting");
check(nextConfig.includes("cpus: 1"), "Papaki production build remains limited to one worker");
check(nextConfig.includes('NEXT_DIST_DIR ?? ".next"'), "browser verification remains isolated from the production build directory");
check(/body_html|body_text|subject/i.test(migration015), "migration 015 archives sent email content");
check(/idempotency_key/i.test(migration016), "migration 016 adds email idempotency");
check(/UNIQUE/i.test(migration016), "migration 016 enforces duplicate-send protection");
check(manifestGenerator.indexOf("015_email_delivery_content_archive.sql") < manifestGenerator.indexOf("016_email_delivery_idempotency.sql"), "release manifest orders migration 015 before 016");
for (const forbidden of [".env.production.local", "node_modules", ".next-playwright", "artifacts", "tmp"]) {
  check(manifestGenerator.includes(`\"${forbidden}\"`), `release manifest explicitly excludes ${forbidden}`);
}

if (failures) {
  console.error(`FAIL - ${failures} Sprint 04 release contract(s) failed.`);
  process.exit(1);
}
console.log("PASS - Sprint 04 release contracts verified.");

