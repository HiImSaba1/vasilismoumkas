import { access, readFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import { relative, resolve, sep } from "node:path";

if (!process.argv[2]) {
  throw new Error("Usage: node scripts/verify-papaki-standalone-release.mjs <release-root>");
}

const releaseRoot = resolve(process.argv[2]);
const required = [
  "start.js",
  ".next/standalone/server.js",
  ".next/standalone/.next/BUILD_ID",
  ".next/standalone/.next/server",
  ".next/standalone/.next/static",
  ".next/standalone/.next/required-server-files.json",
  ".next/standalone/public",
  ".next/standalone/public/fonts/Roboto-Variable.ttf",
];

for (const entry of required) {
  await access(resolve(releaseRoot, entry), constants.R_OK);
}

const forbiddenAtRoot = ["src", "database", "node_modules", "package.json", ".env", ".env.production.local"];
for (const entry of forbiddenAtRoot) {
  try {
    await access(resolve(releaseRoot, entry));
    throw new Error(`Forbidden full-application payload exists in release root: ${entry}`);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
    throw error;
  }
}

const wrapper = await readFile(resolve(releaseRoot, "start.js"), "utf8");
if (!/\.next["'],\s*["']standalone["'],\s*["']server\.js/.test(wrapper)) {
  throw new Error("start.js does not load .next/standalone/server.js.");
}
if (/require\(["']next["']\)|application\.prepare\(/.test(wrapper)) {
  throw new Error("start.js still boots the full Next.js runtime.");
}

const envNames = new Set([".env", ".env.local", ".env.development.local", ".env.production.local"]);
const swcFiles = [];
const leakedFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    const portable = relative(releaseRoot, absolute).split(sep).join("/");
    if (entry.isDirectory()) {
      await walk(absolute);
      continue;
    }
    if (envNames.has(entry.name) || entry.name.startsWith(".env.")) leakedFiles.push(portable);
    if (/\/(@next\/swc-[^/]+\/.*\.node|next-swc[^/]*\.node)$/i.test(`/${portable}`)) swcFiles.push(portable);
  }
}

await walk(releaseRoot);
if (leakedFiles.length) throw new Error(`Environment file leaked into release: ${leakedFiles.join(", ")}`);
if (swcFiles.length) throw new Error(`SWC native runtime leaked into release: ${swcFiles.join(", ")}`);

const buildId = (await readFile(resolve(releaseRoot, ".next/standalone/.next/BUILD_ID"), "utf8")).trim();
if (!buildId) throw new Error("Standalone BUILD_ID is empty.");

console.log(`PASS - minimal Papaki standalone runtime verified (BUILD_ID ${buildId}).`);
