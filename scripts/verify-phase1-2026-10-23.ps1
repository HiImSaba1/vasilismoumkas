[CmdletBinding()]
param([switch]$LintOnly,[switch]$Screenshots)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$logs = Join-Path $root "artifacts\verification"
New-Item -ItemType Directory -Force -Path $logs | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$log = Join-Path $logs "phase1-2026-10-23-$stamp.txt"
$eslintReport = Join-Path $logs "phase1-eslint-$stamp.txt"
$preview = $null
$files = @(
  "src/lib/questionnaire-answer-editing.ts","src/lib/questionnaires.ts","src/lib/client-portals.ts",
  "src/lib/public-page-content.ts","src/lib/public-page-form.ts","src/lib/public-page-settings.ts",
  "src/app/admin/clients/[id]/actions.ts","src/app/admin/clients/[id]/page.tsx","src/app/admin/clients/[id]/QuestionnaireAnswersEditor.tsx",
  "src/app/portal/[slug]/page.tsx","src/app/admin/pages/page.tsx","src/app/admin/pages/[page]/page.tsx",
  "src/app/admin/pages/PageContentForm.tsx","src/app/admin/pages/actions.ts","src/app/admin/AdminChrome.tsx",
  "src/app/admin/homepage/page.tsx","src/components/admin/AdminLocale.tsx",
  "src/components/animations/RevealAnimation.jsx","src/components/animations/AnimatedHeadline.tsx",
  "src/components/sections/HomePage/HomeProjectVideoSection.tsx",
  "src/app/(site)/about/page.tsx","src/app/(site)/services/page.tsx","src/app/(site)/contact/page.tsx",
  "src/app/(site)/contact/ContactPageClient.tsx","src/app/(site)/data/ServicesData.ts",
  "src/components/sections/AboutPage/AboutBigImageSection.tsx","src/components/sections/AboutPage/AboutFaqSection.tsx",
  "src/components/sections/ServicesPage/ServicesHeroSection.tsx","src/components/sections/ServicesPage/ServicesStackingCardsSection.tsx",
  "src/components/sections/ServicesPage/ServicesFaqSection.tsx","src/components/sections/ContactForm.tsx",
  "scripts/verify-phase1-2026-10-23.mjs","scripts/capture-phase1-home.mjs"
)
Start-Transcript -LiteralPath $log -Force | Out-Null
try {
  Write-Host "=== 1. SCOPED ESLINT ==="
  & npx.cmd --no-install eslint --no-cache --format stylish --output-file $eslintReport @files
  $lintExit = $LASTEXITCODE
  if (Test-Path -LiteralPath $eslintReport) { Get-Content -LiteralPath $eslintReport | ForEach-Object { Write-Host $_ } }
  if ($lintExit -ne 0) { throw "ESLint failed. Send $eslintReport" }
  if ($LintOnly) { Write-Host "PASS - SCOPED ESLINT ONLY"; return }
  Write-Host "=== 2. OFFLINE QUESTIONNAIRE AND PAGE FORM CHECKS ==="
  & node scripts/verify-phase1-2026-10-23.mjs
  if ($LASTEXITCODE -ne 0) { throw "Offline checks failed." }
  Write-Host "=== 3. TYPESCRIPT ==="
  & npx.cmd --no-install tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw "TypeScript failed." }
  Write-Host "=== 4. PRODUCTION BUILD ==="
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed." }
  if ($Screenshots) {
    Write-Host "=== 5. LOCAL HOME SCREENSHOTS (MICROSOFT EDGE) ==="
    $probe = New-Object System.Net.Sockets.TcpClient
    try { $probe.Connect("127.0.0.1",3156); throw "Port 3156 is occupied. Stop the existing preview before retrying." }
    catch [System.Net.Sockets.SocketException] { }
    finally { $probe.Dispose() }
    $node = (Get-Command node).Source
    $stdout = Join-Path $logs "phase1-preview-$stamp.stdout.log"
    $stderr = Join-Path $logs "phase1-preview-$stamp.stderr.log"
    $preview = Start-Process -FilePath $node -ArgumentList @("node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port","3156") -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
    $ready = $false
    for ($attempt=0; $attempt -lt 30; $attempt++) {
      if ($preview.HasExited) { throw "Preview exited. Preserve $stderr for inspection." }
      try { $response=Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:3156/" -TimeoutSec 3; if($response.StatusCode -eq 200){$ready=$true;break} } catch { }
      Start-Sleep -Seconds 1
    }
    if(-not $ready){ throw "Local preview did not become ready." }
    & node scripts/capture-phase1-home.mjs
    if($LASTEXITCODE -ne 0){ throw "Screenshot check failed. Edge must be installed; send the error." }
  }
  Write-Host "PASS - PHASE 1 LOCAL VERIFICATION"
  Write-Host "Real questionnaire save/portal acceptance remains owner-run on a designated test client."
  Write-Host "No migration, seed, email, automation, Git push or production deployment was invoked."
} finally {
  if($preview -and -not $preview.HasExited){ Stop-Process -Id $preview.Id }
  Stop-Transcript | Out-Null
  Write-Host "Verification log: $log"
}
