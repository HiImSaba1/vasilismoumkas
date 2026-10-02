import path from "node:path";

type StorageEnvironment=Record<string,string|undefined>;

const configuredRoot=(value:string|undefined)=>value?.trim()?path.resolve(value):null;

export function resolvePortfolioUploadsRoot(environment:StorageEnvironment=process.env,cwd=process.cwd()){
  return configuredRoot(environment.PORTFOLIO_UPLOADS_ROOT)??path.resolve(cwd,"public","uploads","portfolio");
}

export function resolveClientFilesRoot(environment:StorageEnvironment=process.env,cwd=process.cwd()){
  return configuredRoot(environment.CLIENT_FILES_ROOT)??path.resolve(cwd,"storage","client-files");
}

export function resolvePathInsideRoot(root:string,...segments:string[]){
  const canonicalRoot=path.resolve(root);
  const target=path.resolve(canonicalRoot,...segments);
  const relative=path.relative(canonicalRoot,target);
  if(!relative||relative===".."||relative.startsWith(`..${path.sep}`)||path.isAbsolute(relative))return null;
  return target;
}
