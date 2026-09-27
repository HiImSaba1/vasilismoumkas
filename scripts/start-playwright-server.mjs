import { spawn } from "node:child_process";
import { resolve } from "node:path";

const nextBin=resolve(process.cwd(),"node_modules","next","dist","bin","next");
const child=spawn(process.execPath,[nextBin,"dev","--hostname","127.0.0.1","--port","3108"],{
  cwd:process.cwd(),
  env:{...process.env,NEXT_DIST_DIR:".next-playwright",PLAYWRIGHT_TEST_MODE:"1"},
  stdio:"inherit",
  windowsHide:true,
});

const stop=signal=>{if(!child.killed)child.kill(signal)};
process.on("SIGINT",()=>stop("SIGINT"));
process.on("SIGTERM",()=>stop("SIGTERM"));
child.on("exit",code=>process.exit(code??0));
child.on("error",error=>{console.error("Unable to start the isolated Playwright server.",error);process.exit(1)});
