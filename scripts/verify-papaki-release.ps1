param(
  [switch]$VerifySmtp
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

if (-not (Test-Path -LiteralPath ".env.production.local")) {
  throw "Run scripts/prepare-papaki-environment.ps1 first."
}

Write-Host "1/3 Checking database verification scope..."
$databaseHostLine = Get-Content -LiteralPath ".env.production.local" | Where-Object { $_ -match '^DB_HOST=' } | Select-Object -First 1
$databaseHost = ($databaseHostLine -replace '^DB_HOST=', '').Trim('"')
if ($databaseHost -in @("127.0.0.1", "localhost")) {
  Write-Host "DB_HOST is local to Papaki. A Windows-side connection would target WAMP, so schema verification is deferred to /admin/settings after deployment."
} else {
  node --env-file=.env.production.local scripts/check-database-schema.mjs
  if ($LASTEXITCODE -ne 0) { throw "Database schema verification failed." }
}

if ($VerifySmtp) {
  Write-Host "2/3 Verifying SMTP authentication without sending email..."
  node --env-file=.env.production.local -e 'const n=require("nodemailer");const t=n.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:process.env.SMTP_SECURE!=="false",auth:{user:process.env.SMTP_USERNAME,pass:process.env.SMTP_PASSWORD}});t.verify().then(()=>console.log("SMTP authentication passed; no email was sent.")).catch(e=>{console.error("SMTP authentication failed: "+e.code);process.exit(1)})'
} else {
  Write-Host "2/3 SMTP verification skipped. Add -VerifySmtp when desired."
}

Write-Host "3/3 Creating a fresh production build..."
npm run build
Write-Host "Papaki release checks passed."
