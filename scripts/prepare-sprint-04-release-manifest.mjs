import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const productionFiles = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "database/schema.sql",
  "database/migrations/015_email_delivery_content_archive.sql",
  "database/migrations/016_email_delivery_idempotency.sql",
  "src/lib/email-delivery.ts",
  "src/lib/email-templates.ts",
  "src/components/admin/EditableEmailComposer.tsx",
  "src/app/admin/leads/actions.ts",
  "src/app/admin/leads/LeadEmailSender.tsx",
  "src/app/admin/leads/LeadWorkflowWizard.tsx",
  "src/app/admin/leads/page.tsx",
  "src/app/admin/clients/[id]/email/actions.ts",
  "src/app/admin/clients/[id]/email/ClientEmailComposer.tsx",
  "src/app/admin/dashboard/WeddingDashboard.tsx",
  "src/app/admin/dashboard/BaptismDashboard.tsx",
  "src/app/admin/portfolio/PortfolioGalleryInput.tsx",
  "src/app/admin/portfolio/PortfolioForm.tsx",
  "src/app/admin/portfolio/actions.ts",
  "src/components/sections/Projects/ProjectCard.tsx",
  "src/components/sections/Projects/ProjectContent.tsx",
];

const localVerificationFiles = [
  ".gitignore",
  "playwright.config.ts",
  "e2e/portfolio-mobile.spec.ts",
  "scripts/start-playwright-server.mjs",
  "scripts/verify-sprint-01-contracts.mjs",
  "scripts/verify-sprint-02-contracts.mjs",
  "scripts/verify-sprint-03-contracts.mjs",
  "scripts/verify-sprint-04-contracts.mjs",
  "scripts/prepare-sprint-04-release-manifest.mjs",
  "scripts/moumkas-admin.ps1",
  "PAPAKI_FEEDBACK_RELEASE.md",
];

const forbidden = [
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.production.local",
  ".next",
  ".next-playwright",
  "node_modules",
  "artifacts",
  "test-results",
  "playwright-report",
  "tmp",
];

const lines = [
  "Moumkas feedback release upload manifest",
  `Generated: ${new Date().toISOString()}`,
  "",
  "UPLOAD OR REPLACE THESE FILES",
  ...productionFiles.map((file) => `- ${file}`),
  "",
  "IMPORT IN PHPMYADMIN IN THIS EXACT ORDER",
  "1. database/migrations/015_email_delivery_content_archive.sql",
  "2. database/migrations/016_email_delivery_idempotency.sql",
  "",
  "LOCAL VERIFICATION ONLY - DO NOT NEED TO UPLOAD",
  ...localVerificationFiles.map((file) => `- ${file}`),
  "",
  "NEVER UPLOAD",
  ...forbidden.map((file) => `- ${file}`),
  "",
  "PAPAKI AFTER UPLOAD",
  "1. Import migrations 015 and 016 once, in order.",
  "2. Run npm install so package-lock.json is authoritative.",
  "3. Run the build script (npm run build).",
  "4. Restart the Node.js application.",
  "5. Check /api/health, /, /admin, a Lead email preview, and a mobile portfolio project.",
];

const artifactDirectory = resolve("artifacts", "verification");
await mkdir(artifactDirectory, { recursive: true });
const output = resolve(artifactDirectory, "sprint-04-release-manifest.txt");
await writeFile(output, `${lines.join("\n")}\n`, "utf8");
console.log(`Release manifest saved to: ${output}`);

