[CmdletBinding()]
param([switch]$LintOnly,[switch]$Screenshots,[switch]$ScreenshotsOnly)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$logs = Join-Path $root "artifacts\verification"
New-Item -ItemType Directory -Force -Path $logs | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$log = Join-Path $logs "content-management-2026-10-23-$stamp.txt"
$eslintReport = Join-Path $logs "content-management-eslint-$stamp.txt"
$preview = $null
if ($LintOnly -and $ScreenshotsOnly) { throw "Choose LintOnly or ScreenshotsOnly, not both." }
if ($ScreenshotsOnly) {
  $Screenshots = $true
  if (-not (Test-Path -LiteralPath (Join-Path $root ".next\BUILD_ID"))) { throw "No existing production build. Run the full verifier first." }
}
$files = @(
  "scripts/audit-public-seo-2026-10-23.mjs",
  "scripts/capture-phase1-home.mjs",
  "scripts/verify-content-management-2026-10-23.mjs",
  "scripts/verify-phase1-2026-10-23.mjs",
  "src/ClientLayout.tsx",
  "src/app/(site)/about/page.tsx",
  "src/app/(site)/contact/ContactPageClient.tsx",
  "src/app/(site)/contact/page.tsx",
  "src/app/(site)/cookies/layout.tsx",
  "src/app/(site)/data/ServicesData.ts",
  "src/app/(site)/destinations/[slug]/page.tsx",
  "src/app/(site)/inquiry/layout.tsx",
  "src/app/(site)/inquiry/page.tsx",
  "src/app/(site)/instagram/layout.tsx",
  "src/app/(site)/instagram/page.tsx",
  "src/app/(site)/layout.tsx",
  "src/app/(site)/legacy/[...retired]/route.ts",
  "src/app/(site)/page.tsx",
  "src/app/(site)/portfolio/project/[slug]/page.tsx",
  "src/app/(site)/privacy-policy/LegalContent.tsx",
  "src/app/(site)/privacy-policy/layout.tsx",
  "src/app/(site)/services/page.tsx",
  "src/app/Schema.tsx",
  "src/app/admin/AdminChrome.tsx",
  "src/app/admin/clients/[id]/QuestionnaireAnswersEditor.tsx",
  "src/app/admin/clients/[id]/actions.ts",
  "src/app/admin/clients/[id]/page.tsx",
  "src/app/admin/destinations/DestinationForm.tsx",
  "src/app/admin/destinations/[slug]/page.tsx",
  "src/app/admin/destinations/[slug]/preview/page.tsx",
  "src/app/admin/destinations/actions.ts",
  "src/app/admin/destinations/page.tsx",
  "src/app/admin/homepage/actions.ts",
  "src/app/admin/homepage/page.tsx",
  "src/app/admin/pages/PageContentForm.tsx",
  "src/app/admin/pages/[page]/page.tsx",
  "src/app/admin/pages/[page]/preview/page.tsx",
  "src/app/admin/pages/actions.ts",
  "src/app/admin/pages/page.tsx",
  "src/app/admin/portfolio/actions.ts",
  "src/app/admin/seo/actions.ts",
  "src/app/admin/seo/coverage/SocialForm.tsx",
  "src/app/admin/seo/coverage/actions.ts",
  "src/app/admin/seo/coverage/page.tsx",
  "src/app/admin/seo/page.tsx",
  "src/app/admin/seo/redirects/RedirectForm.tsx",
  "src/app/admin/seo/redirects/actions.ts",
  "src/app/admin/seo/redirects/page.tsx",
  "src/app/portal/[slug]/page.tsx",
  "src/app/robots.ts",
  "src/app/sendEmail.ts",
  "src/app/sitemap.ts",
  "src/components/admin/AdminLocale.tsx",
  "src/components/admin/ContentFields.tsx",
  "src/components/admin/ContentMediaUpload.tsx",
  "src/components/admin/LinkedTextField.tsx",
  "src/components/admin/WebsiteImageSelect.tsx",
  "src/components/animations/AnimatedHeadline.tsx",
  "src/components/animations/RevealAnimation.jsx",
  "src/components/core/Footer.tsx",
  "src/components/sections/AboutPage/AboutBigImageSection.tsx",
  "src/components/sections/AboutPage/AboutFaqSection.tsx",
  "src/components/sections/AboutPage/AboutGallerySection.tsx",
  "src/components/sections/AboutPage/AboutHeroVideoSection.tsx",
  "src/components/sections/AboutPage/AboutQuoteSection.tsx",
  "src/components/sections/AboutPage/AboutSplitSectionMain.tsx",
  "src/components/sections/ContactForm.tsx",
  "src/components/sections/DestinationPage.tsx",
  "src/components/sections/HomePage/HomeHeroDesktop.tsx",
  "src/components/sections/HomePage/HomeHeroMobile.tsx",
  "src/components/sections/HomePage/HomeMarqueeImages.tsx",
  "src/components/sections/HomePage/HomeProjectVideoSection.tsx",
  "src/components/sections/HomePage/HomeProjectsGrid.tsx",
  "src/components/sections/HomePage/HomeTestimonialsOnScroll.tsx",
  "src/components/sections/ImageComponent.tsx",
  "src/components/sections/ManagedHome.tsx",
  "src/components/sections/ManagedPages.tsx",
  "src/components/sections/Projects/ProjectCard.tsx",
  "src/components/sections/ServicesPage/ServiceCard.tsx",
  "src/components/sections/ServicesPage/ServiceCardMobile.tsx",
  "src/components/sections/ServicesPage/ServicesFaqSection.tsx",
  "src/components/sections/ServicesPage/ServicesHeroSection.tsx",
  "src/components/sections/ServicesPage/ServicesStackingCardsSection.tsx",
  "src/components/sections/ServicesPage/ServicesThreeColSection.tsx",
  "src/components/seo/PageStructuredData.tsx",
  "src/components/ui/HighlightedContent.tsx",
  "src/components/ui/InlineContent.tsx",
  "src/lib/client-portals.ts",
  "src/lib/content-text.ts",
  "src/lib/content-workspace.ts",
  "src/lib/destinations.ts",
  "src/lib/homepage-settings.ts",
  "src/lib/internal-links.ts",
  "src/lib/portfolio.ts",
  "src/lib/project-url-history.ts",
  "src/lib/public-page-content.ts",
  "src/lib/public-page-form.ts",
  "src/lib/public-page-settings.ts",
  "src/lib/public-redirects.ts",
  "src/lib/questionnaire-answer-editing.ts",
  "src/lib/questionnaires.ts",
  "src/lib/secondary-seo.ts",
  "src/lib/seo-coverage.ts",
  "src/lib/seo-overrides.ts",
  "src/lib/seo-settings.ts",
  "src/proxy.ts"
)
Start-Transcript -LiteralPath $log -Force | Out-Null
try {
  if (-not $ScreenshotsOnly) {
  Write-Host "=== 1. SCOPED ESLINT ==="
  & node node_modules/eslint/bin/eslint.js --no-cache --format stylish --output-file $eslintReport @files
  $lintExit = $LASTEXITCODE
  if (Test-Path -LiteralPath $eslintReport) { Get-Content -LiteralPath $eslintReport | ForEach-Object { Write-Host $_ } }
  if ($lintExit -ne 0) { throw "ESLint failed. Send $eslintReport" }
  if ($LintOnly) { Write-Host "PASS - SCOPED ESLINT ONLY"; return }
  Write-Host "=== 2. OFFLINE QUESTIONNAIRE AND PAGE FORM CHECKS ==="
  & node scripts/verify-phase1-2026-10-23.mjs
  if ($LASTEXITCODE -ne 0) { throw "Offline checks failed." }
  Write-Host "=== 3. CONTENT WORKSPACE, SEO, DESTINATION AND CONTACT OFFLINE CHECKS ==="
  & node scripts/verify-content-management-2026-10-23.mjs
  if ($LASTEXITCODE -ne 0) { throw "Content management offline checks failed." }
  Write-Host "=== 4. TYPESCRIPT ==="
  & npx.cmd --no-install tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw "TypeScript failed." }
  Write-Host "=== 5. PRODUCTION BUILD ==="
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed." }
  } else {
    Write-Host "SCREENSHOTS/SEO ONLY - using the existing build; lint, offline checks, TypeScript and build were not repeated."
  }
  if ($Screenshots) {
    Write-Host "=== 6. LOCAL HOME SCREENSHOTS AND PUBLIC SEO (MICROSOFT EDGE) ==="
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
      # Classify without echoing raw logs, connection details or credentials.
      if (Test-Path -LiteralPath $stderr) {
        $previewErrors = ""
        $logStream = $null
        $logReader = $null
        try {
          $logStream = [IO.File]::Open($stderr, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
          $logReader = New-Object IO.StreamReader($logStream)
          $previewErrors = $logReader.ReadToEnd()
        } catch [IO.IOException] {
          # A transient writer lock must not abort the homepage readiness check.
        } finally {
          if ($logReader) { $logReader.Dispose() }
          elseif ($logStream) { $logStream.Dispose() }
        }
        if ($previewErrors -match 'ER_ACCESS_DENIED_ERROR|Access denied for user') {
          throw "Local preview is running, but MySQL rejected its configured credentials. Fix the local development database configuration before repeating browser checks. No credentials or database settings were changed. Logs retained at $stderr"
        }
      }
      try { $response=Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:3156/" -TimeoutSec 3; if($response.StatusCode -eq 200){$ready=$true;break} } catch { }
      Start-Sleep -Seconds 1
    }
    if(-not $ready){ throw "Local homepage did not return HTTP 200. Preserve $stdout and $stderr for inspection; do not change production credentials." }
    & node scripts/capture-phase1-home.mjs
    if($LASTEXITCODE -ne 0){ throw "Screenshot check failed. Edge must be installed; send the error." }
    & node scripts/audit-public-seo-2026-10-23.mjs
    if($LASTEXITCODE -ne 0){ throw "Public SEO audit requires review. Preserve its JSON report." }
  }
  if ($ScreenshotsOnly) { Write-Host "PASS - LOCAL SCREENSHOTS AND PUBLIC SEO ONLY (existing build)" }
  else { Write-Host "PASS - CONTENT MANAGEMENT LOCAL VERIFICATION" }
  Write-Host "Real admin draft/publish/restore, questionnaire/portal saves, Contact notification and iPhone acceptance remain owner-run on designated test records."
  Write-Host "No migration, seed, email, automation, Git push or production deployment was invoked."
} finally {
  if($preview -and -not $preview.HasExited){ Stop-Process -Id $preview.Id }
  Stop-Transcript | Out-Null
  Write-Host "Verification log: $log"
}
