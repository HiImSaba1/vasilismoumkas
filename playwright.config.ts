import { defineConfig, devices } from "@playwright/test";

const port=3108;
const baseURL=process.env.PLAYWRIGHT_BASE_URL??`http://127.0.0.1:${port}`;
export default defineConfig({
  testDir:"./e2e",
  fullyParallel:false,
  workers:1,
  retries:0,
  timeout:45_000,
  expect:{timeout:10_000},
  reporter:[["list"],["html",{outputFolder:"artifacts/playwright-report",open:"never"}]],
  outputDir:"artifacts/playwright-results",
  use:{baseURL,trace:"retain-on-failure",screenshot:"only-on-failure",video:"retain-on-failure"},
  projects:[
    {name:"mobile-320",use:{browserName:"chromium",viewport:{width:320,height:800}}},
    {name:"mobile-375",use:{browserName:"chromium",viewport:{width:375,height:812}}},
    {name:"mobile-390",use:{browserName:"chromium",viewport:{width:390,height:844}}},
    {name:"mobile-430",use:{browserName:"chromium",viewport:{width:430,height:932}}},
    {name:"iphone-webkit",use:{...devices["iPhone 13"]}},
    {name:"desktop",use:{browserName:"chromium",viewport:{width:1440,height:1000}}},
  ],
  webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:"node scripts/start-playwright-server.mjs",url:baseURL,reuseExistingServer:false,timeout:180_000,stdout:"pipe",stderr:"pipe"},
});
