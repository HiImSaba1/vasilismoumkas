import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const productionFiles=[
  "src/components/admin/AdminDatePicker.tsx",
  "src/app/admin/dashboard/WeddingDashboard.tsx",
  "src/app/admin/dashboard/BaptismDashboard.tsx",
  "src/app/admin/AdminChrome.tsx",
  "src/components/admin/WorkflowReminderCenter.tsx",
  "src/components/sections/Projects/ProjectContent.tsx",
  "src/lib/clients.ts",
  "src/components/admin/ClientWorkspaceSection.tsx",
  "src/app/admin/clients/[id]/page.tsx",
  "src/components/admin/AdminLocale.tsx",
];

const localOnly=[
  "src/app/admin/verification-client-workspace/page.tsx",
  "e2e/admin-date-picker.spec.ts",
  "e2e/admin-header.spec.ts",
  "e2e/portfolio-mobile.spec.ts",
  "e2e/client-workspace.spec.ts",
  "playwright.config.ts",
  "scripts/start-playwright-server.mjs",
  "scripts/verify-sprint-05a-contracts.mjs",
  "scripts/verify-sprint-05b-contracts.mjs",
  "scripts/verify-sprint-05c-contracts.mjs",
  "scripts/verify-sprint-05d-contracts.mjs",
  "scripts/prepare-sprint-05-release-manifest.mjs",
  "scripts/moumkas-admin.ps1",
  "SPRINT_05_RELEASE.md",
];

const lines=[
  "Moumkas Sprint 05 Papaki release manifest",
  `Generated: ${new Date().toISOString()}`,
  "",
  "UPLOAD OR REPLACE THESE FILES",
  ...productionFiles.map(file=>`- ${file}`),
  "",
  "DATABASE",
  "- No migration or SQL import is required for Sprint 05.",
  "",
  "LOCAL VERIFICATION ONLY - DO NOT NEED TO UPLOAD",
  ...localOnly.map(file=>`- ${file}`),
  "",
  "NEVER UPLOAD",
  ...[".env",".env.local",".env.development.local",".env.production.local",".next",".next-playwright","node_modules","artifacts","test-results","playwright-report","tmp"].map(file=>`- ${file}`),
  "",
  "PAPAKI AFTER UPLOAD",
  "1. Remove the existing .next directory in Papaki File Manager.",
  "2. Run npm run build from the Papaki Node.js scripts panel.",
  "3. Restart the Node.js application.",
  "4. Check /api/health, /admin/dashboard, /admin/clients, one real client workspace, and one public portfolio project.",
];

const directory=resolve("artifacts","verification");
await mkdir(directory,{recursive:true});
const output=resolve(directory,"sprint-05-release-manifest.txt");
await writeFile(output,`${lines.join("\n")}\n`,"utf8");
console.log(`Release manifest saved to: ${output}`);
