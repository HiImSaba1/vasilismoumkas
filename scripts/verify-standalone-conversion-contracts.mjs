import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

function readCommittedWorkflow() {
  try {
    return Promise.resolve(
      execFileSync(
        "git",
        ["show", "HEAD:.github/workflows/papaki-standalone-release.yml"],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ),
    );
  } catch {
    return readFile(".github/workflows/papaki-standalone-release.yml", "utf8");
  }
}

const [config, start, builder, launcher, verifier, guide, eslintConfig, workflow, gitignore] = await Promise.all([
  readFile("next.config.ts", "utf8"),
  readFile("start.js", "utf8"),
  readFile("scripts/build-papaki-linux-release.sh", "utf8"),
  readFile("scripts/prepare-papaki-built-release.ps1", "utf8"),
  readFile("scripts/verify-papaki-standalone-release.mjs", "utf8"),
  readFile("PAPAKI_STANDALONE_DEPLOYMENT.md", "utf8"),
  readFile("eslint.config.mjs", "utf8"),
  readCommittedWorkflow(),
  readFile(".gitignore", "utf8"),
]);

const checks = [];
const requireText = (source, pattern, label) => {
  if (!pattern.test(source)) throw new Error(`FAIL - ${label}`);
  checks.push(`PASS - ${label}`);
};

requireText(config, /output:\s*(?:process\.env\.NEXT_SKIP_STANDALONE\s*===\s*["']1["']\s*\?\s*undefined\s*:\s*)?["']standalone["']/, "Next.js produces standalone output");
requireText(config, /cpus:\s*1/, "Next.js keeps the single build worker limit");
requireText(start, /\.next["'],\s*["']standalone["'],\s*["']server\.js/, "Plesk wrapper loads only the standalone server");
if (/require\(["']next["']\)|application\.prepare\(/.test(start)) throw new Error("FAIL - Plesk wrapper still boots the full Next runtime");
checks.push("PASS - Plesk wrapper does not boot the full Next runtime");
requireText(builder, /standalone_root\/\.next\/static/, "builder installs static chunks inside standalone");
requireText(builder, /standalone_root\/public/, "builder installs public assets inside standalone");
requireText(builder, /sha256sum/, "builder creates a SHA-256 checksum");
requireText(builder, /verify-papaki-standalone-release\.mjs/, "builder runs release verification before packaging");
requireText(launcher, /\.tar\.gz archive and its \.sha256 checksum/, "PowerShell launcher reports both owner-run artifacts");
requireText(verifier, /SWC native runtime leaked into release/, "release verifier rejects SWC native runtime modules");
requireText(guide, /Rollback/i, "deployment guide includes rollback");
requireText(guide, /\.env\.production\.local/, "deployment guide preserves the production environment file");
requireText(eslintConfig, /\.next-playwright\/\*\*/, "generated Playwright output is excluded from lint");
requireText(eslintConfig, /files:\s*\[["']start\.js["']\][\s\S]*no-require-imports["']:\s*["']off/, "Plesk CommonJS wrapper has a narrow lint override");
requireText(workflow, /runs-on:\s*ubuntu-latest[\s\S]*node-version:\s*22[\s\S]*build-papaki-linux-release\.sh[\s\S]*upload-artifact@v4/, "GitHub builds and publishes the Linux standalone artifact");
for (const ignored of ["/tmp/", "/database/production-seed.sql", "/storage/client-files/", "/.next/", "/.next-*/"]) {
  if (!gitignore.includes(ignored)) throw new Error(`FAIL - Git ignores sensitive or generated path ${ignored}`);
  checks.push(`PASS - Git ignores ${ignored}`);
}

console.log(checks.join("\n"));
console.log(`PASS - ${checks.length} standalone conversion contracts verified.`);
