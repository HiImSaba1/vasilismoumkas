import assert from "node:assert/strict";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath,pathToFileURL } from "node:url";

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const storagePaths=await import(pathToFileURL(path.join(projectRoot,"src/lib/runtime-storage-paths.ts")).href);
const {resolveClientFilesRoot,resolvePathInsideRoot,resolvePortfolioUploadsRoot}=storagePaths;
const releaseCwd=path.join(projectRoot,"releases","github-test",".next","standalone");
const portfolioRoot=path.join(projectRoot,"persistent-test","portfolio");
const clientRoot=path.join(projectRoot,"persistent-test","client-files");

assert.equal(resolvePortfolioUploadsRoot({PORTFOLIO_UPLOADS_ROOT:portfolioRoot},releaseCwd),path.resolve(portfolioRoot),"portfolio env root must override the standalone cwd");
assert.equal(resolveClientFilesRoot({CLIENT_FILES_ROOT:clientRoot},releaseCwd),path.resolve(clientRoot),"client-file env root must override the standalone cwd");
assert.equal(resolvePortfolioUploadsRoot({},releaseCwd),path.resolve(releaseCwd,"public","uploads","portfolio"),"portfolio cwd path must remain the fallback");
assert.equal(resolveClientFilesRoot({},releaseCwd),path.resolve(releaseCwd,"storage","client-files"),"client-file cwd path must remain the fallback");

const portfolioFile=resolvePathInsideRoot(resolvePortfolioUploadsRoot({PORTFOLIO_UPLOADS_ROOT:portfolioRoot},releaseCwd),"couple-slug","photo.webp");
assert.equal(portfolioFile,path.join(path.resolve(portfolioRoot),"couple-slug","photo.webp"),"portfolio writes and deletes must resolve below the configured root");
assert.equal(resolvePathInsideRoot(portfolioRoot,"..","outside.webp"),null,"portfolio traversal must be rejected");
assert.equal(resolvePathInsideRoot(clientRoot,"client-id","..","..","outside.pdf"),null,"client-file traversal must be rejected");
assert.equal(resolvePathInsideRoot(clientRoot,"client-id","receipt.pdf"),path.join(path.resolve(clientRoot),"client-id","receipt.pdf"),"client files must resolve below the configured root");

const portfolioSource=await readFile(path.join(projectRoot,"src/lib/portfolio.ts"),"utf8");
const clientFilesSource=await readFile(path.join(projectRoot,"src/lib/client-files.ts"),"utf8");
assert.match(portfolioSource,/const root=resolvePortfolioUploadsRoot\(\)/,"portfolio storage and deletion use the canonical root");
assert.match(portfolioSource,/resolvePathInsideRoot\(root,src\.slice\(prefix\.length\)\)/,"portfolio deletion uses the canonical root with traversal protection");
assert.doesNotMatch(portfolioSource,/process\.cwd\(\).*uploads.*portfolio/s,"portfolio operations must not independently derive a cwd root");
assert.match(clientFilesSource,/const storageRoot=\(\)=>resolveClientFilesRoot\(\)/,"all client-file operations use the canonical root");
assert.doesNotMatch(clientFilesSource,/process\.cwd\(\).*client-files/s,"client-file operations must not independently derive a cwd root");

console.log("PASS - runtime storage roots honor persistent overrides, safe local fallbacks, and traversal boundaries");
