[CmdletBinding()]
param(
    [ValidateSet("Sprint01Verify", "Sprint02Verify", "Sprint03BrowserPrepare", "Sprint03Verify", "Sprint04Verify", "Sprint05BrowserPrepare", "Sprint05AVerify", "Sprint05BVerify", "Sprint05CVerify", "Sprint05DVerify", "Sprint06Verify", "Sprint07Verify", "Sprint08Verify", "Sprint09Verify", "Sprint10Verify", "Sprint11Verify", "Sprint12Verify", "Sprint13Verify", "Sprint14Verify", "Sprint15Verify", "Sprint16Verify", "Sprint17Verify", "Sprint18Verify", "Sprint19Verify", "Sprint20Verify", "Sprint21Verify", "Sprint22Verify", "Sprint23Verify", "Sprint24Verify", "Sprint25Verify", "Sprint26Verify", "Sprint27Verify", "Sprint28Verify", "Sprint29Verify", "Sprint30Verify", "Sprint31Verify", "Sprint32Verify", "Sprint33Verify", "Sprint34Verify", "Sprint35Verify", "Sprint36Verify", "Sprint37Verify", "Sprint38Verify", "Sprint39Verify", "SeedInvoiceDemo", "RemoveInvoiceDemo", "SeedCalendarDemo", "RemoveCalendarDemo")]
    [string]$Action = "Sprint01Verify"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$Utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding = $Utf8NoBom
[Console]::OutputEncoding = $Utf8NoBom
$OutputEncoding = $Utf8NoBom

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ArtifactDirectory = Join-Path $ProjectRoot "artifacts\verification"
$ResultFile = Join-Path $ArtifactDirectory "sprint-01-results.txt"
$Sprint02ResultFile = Join-Path $ArtifactDirectory "sprint-02-results.txt"
$Sprint03ResultFile = Join-Path $ArtifactDirectory "sprint-03-results.txt"
$Sprint03BrowserFile = Join-Path $ArtifactDirectory "sprint-03-browser-results.txt"
$Sprint04ResultFile = Join-Path $ArtifactDirectory "sprint-04-results.txt"
$Sprint04ManifestFile = Join-Path $ArtifactDirectory "sprint-04-release-manifest.txt"
$Sprint05AResultFile = Join-Path $ArtifactDirectory "sprint-05a-results.txt"
$Sprint05ABrowserFile = Join-Path $ArtifactDirectory "sprint-05a-browser-results.txt"
$Sprint05BResultFile = Join-Path $ArtifactDirectory "sprint-05b-results.txt"
$Sprint05BBrowserFile = Join-Path $ArtifactDirectory "sprint-05b-browser-results.txt"
$Sprint05CResultFile = Join-Path $ArtifactDirectory "sprint-05c-results.txt"
$Sprint05CBrowserFile = Join-Path $ArtifactDirectory "sprint-05c-browser-results.txt"
$Sprint05DResultFile = Join-Path $ArtifactDirectory "sprint-05d-results.txt"
$Sprint05DBrowserFile = Join-Path $ArtifactDirectory "sprint-05d-browser-results.txt"
$Sprint05DManifestFile = Join-Path $ArtifactDirectory "sprint-05-release-manifest.txt"
$Sprint06ResultFile = Join-Path $ArtifactDirectory "sprint-06-results.txt"
$Sprint06ManifestFile = Join-Path $ArtifactDirectory "sprint-06-release-manifest.txt"
$Sprint07ResultFile = Join-Path $ArtifactDirectory "sprint-07-results.txt"
$Sprint07ManifestFile = Join-Path $ArtifactDirectory "sprint-07-release-manifest.txt"
$Sprint08ResultFile = Join-Path $ArtifactDirectory "sprint-08-results.txt"
$Sprint09ResultFile = Join-Path $ArtifactDirectory "sprint-09-results.txt"
$Sprint10ResultFile = Join-Path $ArtifactDirectory "sprint-10-results.txt"
$Sprint11ResultFile = Join-Path $ArtifactDirectory "sprint-11-results.txt"
$Sprint11BrowserFile = Join-Path $ArtifactDirectory "sprint-11-browser-results.txt"
$Sprint11ManifestFile = Join-Path $ArtifactDirectory "sprint-11-release-manifest.txt"
$Sprint12ResultFile = Join-Path $ArtifactDirectory "sprint-12-results.txt"
$Sprint12BrowserFile = Join-Path $ArtifactDirectory "sprint-12-browser-results.txt"
$Sprint13ResultFile = Join-Path $ArtifactDirectory "sprint-13-results.txt"
$Sprint14ResultFile = Join-Path $ArtifactDirectory "sprint-14-results.txt"
$Sprint15ResultFile = Join-Path $ArtifactDirectory "sprint-15-results.txt"
$Sprint16ResultFile = Join-Path $ArtifactDirectory "sprint-16-results.txt"
$Sprint17ResultFile = Join-Path $ArtifactDirectory "sprint-17-results.txt"
$Sprint18ResultFile = Join-Path $ArtifactDirectory "sprint-18-results.txt"
$Sprint19ResultFile = Join-Path $ArtifactDirectory "sprint-19-results.txt"
$Sprint20ResultFile = Join-Path $ArtifactDirectory "sprint-20-results.txt"
$Sprint31ResultFile = Join-Path $ArtifactDirectory "sprint-31-results.txt"
$Sprint21ResultFile = Join-Path $ArtifactDirectory "sprint-21-results.txt"
$Sprint22ResultFile = Join-Path $ArtifactDirectory "sprint-22-results.txt"
$Sprint23ResultFile = Join-Path $ArtifactDirectory "sprint-23-results.txt"
$Sprint24ResultFile = Join-Path $ArtifactDirectory "sprint-24-results.txt"
$Sprint25ResultFile = Join-Path $ArtifactDirectory "sprint-25-results.txt"
$Sprint26ResultFile = Join-Path $ArtifactDirectory "sprint-26-results.txt"
$Sprint27ResultFile = Join-Path $ArtifactDirectory "sprint-27-results.txt"
$Sprint28ResultFile = Join-Path $ArtifactDirectory "sprint-28-results.txt"
$Sprint29ResultFile = Join-Path $ArtifactDirectory "sprint-29-results.txt"
$Sprint30ResultFile = Join-Path $ArtifactDirectory "sprint-30-results.txt"
$Sprint32ResultFile = Join-Path $ArtifactDirectory "sprint-32-results.txt"
$Sprint33ResultFile = Join-Path $ArtifactDirectory "sprint-33-results.txt"
$Sprint34ResultFile = Join-Path $ArtifactDirectory "sprint-34-results.txt"
$Sprint35ResultFile = Join-Path $ArtifactDirectory "sprint-35-results.txt"
$Sprint36ResultFile = Join-Path $ArtifactDirectory "sprint-36-results.txt"
$Sprint37ResultFile = Join-Path $ArtifactDirectory "sprint-37-results.txt"
$Sprint38ResultFile = Join-Path $ArtifactDirectory "sprint-38-results.txt"
$Sprint39ResultFile = Join-Path $ArtifactDirectory "sprint-39-results.txt"
$script:ActiveLogFile = $null

Set-Location -LiteralPath $ProjectRoot

function Write-RunnerLine {
    param([Parameter(Mandatory)][AllowEmptyString()][string]$Text)
    [Console]::WriteLine($Text)
    if ($script:ActiveLogFile) {
        [System.IO.File]::AppendAllText($script:ActiveLogFile, $Text + [Environment]::NewLine, $Utf8NoBom)
    }
}

function Invoke-Step {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][scriptblock]$Command
    )
    Write-RunnerLine ""
    Write-RunnerLine "=== $Name ==="
    $exitCode = 0
    $previousErrorPreference = $ErrorActionPreference
    try {
        # Native tools may write ordinary warnings to stderr. Capture them in
        # the result file and trust the process exit code for pass/fail.
        $ErrorActionPreference = "Continue"
        & $Command 2>&1 | ForEach-Object { Write-RunnerLine ([string]$_) }
        if ($null -ne $LASTEXITCODE) { $exitCode = $LASTEXITCODE }
    }
    catch {
        Write-RunnerLine ($_ | Out-String)
        $exitCode = 1
    }
    finally {
        $ErrorActionPreference = $previousErrorPreference
    }
    Write-RunnerLine "Exit code: $exitCode"
    if ($exitCode -ne 0) { throw "$Name failed with exit code $exitCode." }
}

function Invoke-Sprint01Verification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules") -PathType Container)) {
        throw "Dependencies are missing. Run npm install first."
    }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($ResultFile, "Moumkas Admin Sprint 01 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 SOURCE CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-delivery.ts" "src/app/admin/leads/actions.ts" "src/app/admin/leads/LeadEmailSender.tsx" "src/app/admin/dashboard/WeddingDashboard.tsx" "src/app/admin/dashboard/BaptismDashboard.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 01 source contracts, scoped ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    }
    catch {
        Write-RunnerLine ""
        Write-RunnerLine "FAIL - Review the failing step above and send this file back to Codex."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        throw
    }
    finally {
        $script:ActiveLogFile = $null
        Write-Host "Verification output saved to: $ResultFile" -ForegroundColor Yellow
    }
}

function Invoke-Sprint02Verification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules") -PathType Container)) {
        throw "Dependencies are missing. Run npm install first."
    }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint02ResultFile, "Moumkas Admin Sprint 02 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint02ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 REGRESSION CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SPRINT 02 COMPOSER CONTRACTS" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-delivery.ts" "src/lib/email-templates.ts" "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/leads/actions.ts" "src/app/admin/leads/LeadEmailSender.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/app/admin/leads/page.tsx" "src/app/admin/clients/[id]/email/actions.ts" "src/app/admin/clients/[id]/email/ClientEmailComposer.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 01 regression, Sprint 02 composer contracts, scoped ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    }
    catch {
        Write-RunnerLine ""
        Write-RunnerLine "FAIL - Review the failing step above and send this file back to Codex."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        throw
    }
    finally {
        $script:ActiveLogFile = $null
        Write-Host "Verification output saved to: $Sprint02ResultFile" -ForegroundColor Yellow
    }
}

function Invoke-Sprint03BrowserPreparation {
    Invoke-Step "INSTALL PINNED PLAYWRIGHT TOOLING" { & npm install --save-dev --save-exact "@playwright/test@1.55.0" "playwright-core@1.55.0" }
    Invoke-Step "INSTALL PLAYWRIGHT CHROMIUM" { & npx playwright install chromium }
}

function Invoke-Sprint03Verification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) {
        throw "Playwright is missing. Run Sprint03BrowserPrepare first."
    }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint03BrowserFile, "Moumkas Admin Sprint 03 browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint03BrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "MOBILE PORTFOLIO PLAYWRIGHT TESTS" { & npx playwright test e2e/portfolio-mobile.spec.ts }
        Write-RunnerLine "PASS - Mobile portfolio browser verification completed."
    }
    catch {
        Write-RunnerLine "FAIL - Review Playwright trace, screenshot, video, and this result file."
        throw
    }
    finally {
        $script:ActiveLogFile = $null
    }
    [System.IO.File]::WriteAllText($Sprint03ResultFile, "Moumkas Admin Sprint 03 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint03ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 REGRESSION CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SPRINT 02 REGRESSION CONTRACTS" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SPRINT 03 PORTFOLIO CONTRACTS" { & node scripts/verify-sprint-03-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/components/sections/Projects/ProjectCard.tsx" "src/components/sections/Projects/ProjectContent.tsx" "src/app/admin/portfolio/PortfolioGalleryInput.tsx" "src/app/admin/portfolio/PortfolioForm.tsx" "src/app/admin/portfolio/actions.ts" "e2e/portfolio-mobile.spec.ts" "playwright.config.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 01-03 contracts, browser evidence, scoped ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    }
    catch {
        Write-RunnerLine ""
        Write-RunnerLine "FAIL - Review the failing step above and send both Sprint 03 result files back to Codex."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        throw
    }
    finally {
        $script:ActiveLogFile = $null
        Write-Host "Verification output saved to: $Sprint03ResultFile" -ForegroundColor Yellow
        Write-Host "Browser output saved to: $Sprint03BrowserFile" -ForegroundColor Yellow
    }
}

function Invoke-Sprint04Verification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) {
        throw "Playwright is missing. Run Sprint03BrowserPrepare first."
    }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint04ResultFile, "Moumkas Admin Sprint 04 release verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint04ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 REGRESSION CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SPRINT 02 REGRESSION CONTRACTS" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SPRINT 03 PORTFOLIO CONTRACTS" { & node scripts/verify-sprint-03-contracts.mjs }
        Invoke-Step "SPRINT 04 RELEASE CONTRACTS" { & node scripts/verify-sprint-04-contracts.mjs }
        Invoke-Step "MOBILE PORTFOLIO PLAYWRIGHT REGRESSION" { & npx playwright test e2e/portfolio-mobile.spec.ts }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-delivery.ts" "src/lib/email-templates.ts" "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/leads/actions.ts" "src/app/admin/leads/LeadEmailSender.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/app/admin/leads/page.tsx" "src/app/admin/clients/[id]/email/actions.ts" "src/app/admin/clients/[id]/email/ClientEmailComposer.tsx" "src/app/admin/dashboard/WeddingDashboard.tsx" "src/app/admin/dashboard/BaptismDashboard.tsx" "src/components/sections/Projects/ProjectCard.tsx" "src/components/sections/Projects/ProjectContent.tsx" "src/app/admin/portfolio/PortfolioGalleryInput.tsx" "src/app/admin/portfolio/PortfolioForm.tsx" "src/app/admin/portfolio/actions.ts" "e2e/portfolio-mobile.spec.ts" "playwright.config.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Invoke-Step "RELEASE MANIFEST" { & node scripts/prepare-sprint-04-release-manifest.mjs }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprints 01-04, browser regression, scoped ESLint, TypeScript, production build, and release manifest completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    }
    catch {
        Write-RunnerLine ""
        Write-RunnerLine "FAIL - Do not deploy. Review the failing step and send the Sprint 04 result file back to Codex."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        throw
    }
    finally {
        $script:ActiveLogFile = $null
        Write-Host "Verification output saved to: $Sprint04ResultFile" -ForegroundColor Yellow
        if (Test-Path -LiteralPath $Sprint04ManifestFile) {
            Write-Host "Release manifest saved to: $Sprint04ManifestFile" -ForegroundColor Yellow
        }
    }
}

function Invoke-Sprint05BrowserPreparation {
    Invoke-Step "INSTALL PLAYWRIGHT WEBKIT" { & npx playwright install webkit }
}

function Invoke-Sprint05AVerification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) {
        throw "Playwright is missing. Run Sprint03BrowserPrepare first."
    }
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".env.development.local") -PathType Leaf)) {
        throw ".env.development.local is required to create a private local admin test session."
    }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint05ABrowserFile, "Moumkas Admin Sprint 05A browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05ABrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "CHROMIUM AND IPHONE WEBKIT DATE-PICKER TESTS" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/admin-date-picker.spec.ts --project=mobile-390 --project=iphone-webkit }
        Write-RunnerLine "PASS - Wedding and baptism calendars passed Chromium mobile and iPhone WebKit interaction tests."
    }
    catch {
        Write-RunnerLine "FAIL - Review Playwright trace, screenshot, video, and this result file."
        throw
    }
    finally {
        $script:ActiveLogFile = $null
    }

    [System.IO.File]::WriteAllText($Sprint05AResultFile, "Moumkas Admin Sprint 05A verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05AResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 REGRESSION CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SPRINT 02 REGRESSION CONTRACTS" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SPRINT 03 REGRESSION CONTRACTS" { & node scripts/verify-sprint-03-contracts.mjs }
        Invoke-Step "SPRINT 04 REGRESSION CONTRACTS" { & node scripts/verify-sprint-04-contracts.mjs }
        Invoke-Step "SPRINT 05A DATE-PICKER CONTRACTS" { & node scripts/verify-sprint-05a-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/components/admin/AdminDatePicker.tsx" "src/app/admin/dashboard/WeddingDashboard.tsx" "src/app/admin/dashboard/BaptismDashboard.tsx" "e2e/admin-date-picker.spec.ts" "playwright.config.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 05A calendar contracts, browser evidence, scoped ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    }
    catch {
        Write-RunnerLine ""
        Write-RunnerLine "FAIL - Do not deploy. Send both Sprint 05A result files back to Codex."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        throw
    }
    finally {
        $script:ActiveLogFile = $null
        Write-Host "Verification output saved to: $Sprint05AResultFile" -ForegroundColor Yellow
        Write-Host "Browser output saved to: $Sprint05ABrowserFile" -ForegroundColor Yellow
    }
}

function Invoke-Sprint05BVerification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) {
        throw "Playwright is missing. Run Sprint03BrowserPrepare first."
    }
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".env.development.local") -PathType Leaf)) {
        throw ".env.development.local is required to create a private local admin test session."
    }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint05BBrowserFile, "Moumkas Admin Sprint 05B browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05BBrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "MOBILE ADMIN HEADER" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/admin-header.spec.ts --project=mobile-390 }
        Invoke-Step "MOBILE AND DESKTOP PORTFOLIO METRO GALLERY" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/portfolio-mobile.spec.ts --project=mobile-390 --project=desktop }
        Write-RunnerLine "PASS - Admin header notifications and responsive metro portfolio browser verification completed."
    }
    catch {
        Write-RunnerLine "FAIL - Review Playwright trace, screenshot, video, and this result file."
        throw
    }
    finally {
        $script:ActiveLogFile = $null
    }

    [System.IO.File]::WriteAllText($Sprint05BResultFile, "Moumkas Admin Sprint 05B verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05BResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01-05A REGRESSION CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-02-contracts.mjs }; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-03-contracts.mjs }; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-04-contracts.mjs }; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-05a-contracts.mjs } }
        Invoke-Step "SPRINT 05B HEADER AND GALLERY CONTRACTS" { & node scripts/verify-sprint-05b-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/admin/AdminChrome.tsx" "src/components/admin/WorkflowReminderCenter.tsx" "src/components/sections/Projects/ProjectContent.tsx" "e2e/admin-header.spec.ts" "e2e/portfolio-mobile.spec.ts" "playwright.config.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 05B contracts, browser evidence, scoped ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    }
    catch {
        Write-RunnerLine ""
        Write-RunnerLine "FAIL - Do not deploy. Send both Sprint 05B result files back to Codex."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        throw
    }
    finally {
        $script:ActiveLogFile = $null
        Write-Host "Verification output saved to: $Sprint05BResultFile" -ForegroundColor Yellow
        Write-Host "Browser output saved to: $Sprint05BBrowserFile" -ForegroundColor Yellow
    }
}

function Invoke-Sprint05CVerification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) { throw "Playwright is missing. Run Sprint03BrowserPrepare first." }
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".env.development.local") -PathType Leaf)) { throw ".env.development.local is required for the private client workspace test." }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint05CBrowserFile, "Moumkas Admin Sprint 05C browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05CBrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "MOBILE AND DESKTOP CLIENT WORKSPACE" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/client-workspace.spec.ts --project=mobile-390 --project=desktop }
        Write-RunnerLine "PASS - Responsive client workspace browser verification completed."
    } catch { Write-RunnerLine "FAIL - Review Playwright evidence and this result file."; throw } finally { $script:ActiveLogFile = $null }

    [System.IO.File]::WriteAllText($Sprint05CResultFile, "Moumkas Admin Sprint 05C verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05CResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 05C CLIENT WORKSPACE CONTRACTS" { & node scripts/verify-sprint-05c-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/clients.ts" "src/components/admin/ClientWorkspaceSection.tsx" "src/app/admin/clients/[id]/page.tsx" "src/components/admin/AdminLocale.tsx" "e2e/client-workspace.spec.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 05C client workspace contracts, browser evidence, scoped ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not deploy. Send both Sprint 05C result files back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile = $null; Write-Host "Verification output saved to: $Sprint05CResultFile" -ForegroundColor Yellow; Write-Host "Browser output saved to: $Sprint05CBrowserFile" -ForegroundColor Yellow }
}

function Invoke-Sprint05DVerification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) { throw "Playwright is missing. Run Sprint03BrowserPrepare first." }
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".env.development.local") -PathType Leaf)) { throw ".env.development.local is required for private admin browser verification." }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint05DBrowserFile, "Moumkas Admin Sprint 05D browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05DBrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "MOBILE SAFARI AND CHROMIUM DATE PICKER" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/admin-date-picker.spec.ts --project=mobile-390 --project=iphone-webkit }
        Invoke-Step "MOBILE ADMIN HEADER" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/admin-header.spec.ts --project=mobile-390 }
        Invoke-Step "MOBILE AND DESKTOP PORTFOLIO" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/portfolio-mobile.spec.ts --project=mobile-390 --project=desktop }
        Invoke-Step "DETERMINISTIC MOBILE AND DESKTOP CLIENT WORKSPACE" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/client-workspace.spec.ts --project=mobile-390 --project=desktop }
        Write-RunnerLine "PASS - All Sprint 05 browser journeys completed without skipped client tests."
    } catch { Write-RunnerLine "FAIL - Review Playwright evidence and this browser result file."; throw } finally { $script:ActiveLogFile = $null }

    [System.IO.File]::WriteAllText($Sprint05DResultFile, "Moumkas Admin Sprint 05D release verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint05DResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 CONTRACTS" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SPRINT 02 CONTRACTS" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SPRINT 03 CONTRACTS" { & node scripts/verify-sprint-03-contracts.mjs }
        Invoke-Step "SPRINT 04 CONTRACTS" { & node scripts/verify-sprint-04-contracts.mjs }
        Invoke-Step "SPRINT 05A CONTRACTS" { & node scripts/verify-sprint-05a-contracts.mjs }
        Invoke-Step "SPRINT 05B CONTRACTS" { & node scripts/verify-sprint-05b-contracts.mjs }
        Invoke-Step "SPRINT 05C CONTRACTS" { & node scripts/verify-sprint-05c-contracts.mjs }
        Invoke-Step "SPRINT 05D RELEASE CONTRACTS" { & node scripts/verify-sprint-05d-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/components/admin/AdminDatePicker.tsx" "src/app/admin/dashboard/WeddingDashboard.tsx" "src/app/admin/dashboard/BaptismDashboard.tsx" "src/app/admin/AdminChrome.tsx" "src/components/admin/WorkflowReminderCenter.tsx" "src/components/sections/Projects/ProjectContent.tsx" "src/lib/clients.ts" "src/components/admin/ClientWorkspaceSection.tsx" "src/app/admin/clients/[id]/page.tsx" "src/components/admin/AdminLocale.tsx" "src/app/admin/verification-client-workspace/page.tsx" "e2e/admin-date-picker.spec.ts" "e2e/admin-header.spec.ts" "e2e/portfolio-mobile.spec.ts" "e2e/client-workspace.spec.ts" "playwright.config.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Invoke-Step "SPRINT 05 RELEASE MANIFEST" { & node scripts/prepare-sprint-05-release-manifest.mjs }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 05 browser journeys, regression contracts, scoped ESLint, TypeScript, production build, and Papaki manifest completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not deploy. Send both Sprint 05D result files back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile = $null; Write-Host "Verification output saved to: $Sprint05DResultFile" -ForegroundColor Yellow; Write-Host "Browser output saved to: $Sprint05DBrowserFile" -ForegroundColor Yellow; if (Test-Path -LiteralPath $Sprint05DManifestFile) { Write-Host "Release manifest saved to: $Sprint05DManifestFile" -ForegroundColor Yellow } }
}

function Invoke-Sprint06Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint06ResultFile, "Moumkas Admin Sprint 06 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile = $Sprint06ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 02 EMAIL REGRESSION CONTRACTS" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SPRINT 06 RECIPIENT AND VALIDITY CONTRACTS" { & node scripts/verify-sprint-06-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/leads/LeadEmailSender.tsx" "scripts/seed-bilingual-email-templates.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Invoke-Step "SPRINT 06 RELEASE MANIFEST" { & node scripts/prepare-sprint-06-release-manifest.mjs }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 06 recipient inheritance, bilingual 30-day validity, regressions, scoped ESLint, TypeScript, production build, and release manifest completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not deploy. Send the Sprint 06 result file back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint06ResultFile" -ForegroundColor Yellow; if(Test-Path -LiteralPath $Sprint06ManifestFile){Write-Host "Release manifest saved to: $Sprint06ManifestFile" -ForegroundColor Yellow} }
}

function Invoke-Sprint07Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint07ResultFile, "Moumkas Admin Sprint 07 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint07ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 01 DUPLICATE-SEND REGRESSION" { & node scripts/verify-sprint-01-contracts.mjs }
        Invoke-Step "SPRINT 02 EMAIL COMPOSER REGRESSION" { & node scripts/verify-sprint-02-contracts.mjs }
        Invoke-Step "SPRINT 07 GMAIL ARCHIVE CONTRACTS" { & node scripts/verify-sprint-07-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-delivery.ts" "src/app/admin/leads/actions.ts" "src/app/admin/clients/[id]/email/actions.ts" "src/lib/automation-runner.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Invoke-Step "SPRINT 07 RELEASE MANIFEST" { & node scripts/prepare-sprint-07-release-manifest.mjs }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 07 Gmail sent archive, email regressions, scoped ESLint, TypeScript, production build, and release manifest completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not deploy. Send the Sprint 07 result file back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint07ResultFile" -ForegroundColor Yellow; if(Test-Path -LiteralPath $Sprint07ManifestFile){Write-Host "Release manifest saved to: $Sprint07ManifestFile" -ForegroundColor Yellow} }
}

function Invoke-Sprint08Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint08ResultFile, "Moumkas Admin Sprint 08 payment ledger verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint08ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 08 PAYMENT LEDGER CONTRACTS" { & node scripts/verify-sprint-08-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/invoice-payments.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 08 payment ledger contracts, scoped ESLint, and TypeScript completed. No migration was executed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not import migration 018. Send the Sprint 08 result file back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint08ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint09Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint09ResultFile, "Moumkas Admin Sprint 09 invoice UI verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint09ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 08 LEDGER REGRESSION" { & node scripts/verify-sprint-08-contracts.mjs }
        Invoke-Step "SPRINT 09 INVOICE UI CONTRACTS" { & node scripts/verify-sprint-09-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/invoice-payments.ts" "src/app/admin/clients/[id]/actions.ts" "src/app/admin/clients/[id]/InvoicePaymentManager.tsx" "src/app/admin/clients/[id]/page.tsx" "src/components/admin/AdminLocale.tsx" "src/lib/email-delivery.ts" "src/app/sendEmail.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 09 invoice payment UI, Template 006 handoff, regressions, scoped ESLint, and TypeScript completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not import migration 018. Send the Sprint 09 result file back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint09ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint10Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint10ResultFile, "Moumkas Admin Sprint 10 portal invoice verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint10ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 08-09 REGRESSION CONTRACTS" { & node scripts/verify-sprint-08-contracts.mjs; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-09-contracts.mjs } }
        Invoke-Step "SPRINT 10 PORTAL AND BOOKING CONTRACTS" { & node scripts/verify-sprint-10-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/portal/[slug]/page.tsx" "src/app/portal/[slug]/PortalInvoicePanel.tsx" "src/lib/invoice-payments.ts" "src/lib/client-workflow.ts" "src/lib/onboarding.ts" "src/lib/client-portals.ts" "src/lib/lead-native-documents.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 10 live portal invoice, deposit booking rules, regressions, scoped ESLint, and TypeScript completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not import migration 018. Send the Sprint 10 result file back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint10ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint11Verification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) { throw "Playwright is missing. Run Sprint03BrowserPrepare first." }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint11BrowserFile, "Moumkas Admin Sprint 11 browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint11BrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "MOBILE AND DESKTOP INVOICE PAYMENT WORKFLOW" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/invoice-payments.spec.ts --project=mobile-390 --project=desktop }
        Write-RunnerLine "PASS - Responsive invoice payment browser verification completed."
    } catch { Write-RunnerLine "FAIL - Review Playwright evidence and this browser result file."; throw } finally { $script:ActiveLogFile=$null }
    [System.IO.File]::WriteAllText($Sprint11ResultFile, "Moumkas Admin Sprint 11 release verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint11ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 08-10 REGRESSION CONTRACTS" { & node scripts/verify-sprint-08-contracts.mjs; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-09-contracts.mjs }; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-10-contracts.mjs } }
        Invoke-Step "SPRINT 11 RELEASE CONTRACTS" { & node scripts/verify-sprint-11-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/invoice-payments.ts" "src/app/admin/clients/[id]/actions.ts" "src/app/admin/clients/[id]/InvoicePaymentManager.tsx" "src/app/admin/clients/[id]/page.tsx" "src/app/portal/[slug]/page.tsx" "src/app/portal/[slug]/PortalInvoicePanel.tsx" "src/lib/client-workflow.ts" "src/lib/onboarding.ts" "src/lib/client-portals.ts" "src/lib/lead-native-documents.ts" "src/lib/email-delivery.ts" "src/app/sendEmail.ts" "src/app/admin/verification-invoice-payments/page.tsx" "e2e/invoice-payments.spec.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Invoke-Step "SPRINT 11 RELEASE MANIFEST" { & node scripts/prepare-sprint-11-release-manifest.mjs }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 11 browser coverage, invoice regressions, scoped ESLint, TypeScript, production build, and Papaki manifest completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Do not deploy. Send both Sprint 11 result files back to Codex."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint11ResultFile" -ForegroundColor Yellow; Write-Host "Browser output saved to: $Sprint11BrowserFile" -ForegroundColor Yellow; if(Test-Path -LiteralPath $Sprint11ManifestFile){Write-Host "Release manifest saved to: $Sprint11ManifestFile" -ForegroundColor Yellow} }
}

function Invoke-Sprint12Verification {
    if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot "node_modules\@playwright\test") -PathType Container)) { throw "Playwright is missing. Run Sprint03BrowserPrepare first." }
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint12BrowserFile, "Moumkas Admin Sprint 12 browser verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint12BrowserFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Invoke-Step "MOBILE AND DESKTOP 25 PERCENT DEPOSIT WORKFLOW" { & node --env-file=.env.development.local node_modules/@playwright/test/cli.js test e2e/invoice-payments.spec.ts --project=mobile-390 --project=desktop }
        Write-RunnerLine "PASS - Reactive invoice controls passed responsive browser verification."
    } catch { Write-RunnerLine "FAIL - Review Playwright evidence and this browser result file."; throw } finally { $script:ActiveLogFile=$null }
    [System.IO.File]::WriteAllText($Sprint12ResultFile, "Moumkas Admin Sprint 12 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint12ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 08-11 REGRESSION CONTRACTS" { & node scripts/verify-sprint-08-contracts.mjs; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-09-contracts.mjs }; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-10-contracts.mjs }; if ($LASTEXITCODE -eq 0) { & node scripts/verify-sprint-11-contracts.mjs } }
        Invoke-Step "SPRINT 12 REACTIVE PAYMENT CONTRACTS" { & node scripts/verify-sprint-12-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/admin/clients/[id]/InvoicePaymentManager.tsx" "src/components/admin/AdminLocale.tsx" "e2e/invoice-payments.spec.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 12 automatic balance refresh, 25 percent deposit shortcut, regressions, browser checks, ESLint, and TypeScript completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review both Sprint 12 result files."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint12ResultFile" -ForegroundColor Yellow; Write-Host "Browser output saved to: $Sprint12BrowserFile" -ForegroundColor Yellow }
}

function Invoke-Sprint13Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint13ResultFile, "Moumkas Admin Sprint 13 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint13ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 12 REGRESSION CONTRACTS" { & node scripts/verify-sprint-12-contracts.mjs }
        Invoke-Step "SPRINT 13 BILINGUAL CLIENT EMAIL CONTRACTS" { & node scripts/verify-sprint-13-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/admin/clients/[id]/email/page.tsx" "src/app/admin/clients/[id]/email/ClientEmailComposer.tsx" "src/app/admin/clients/[id]/email/actions.ts" "src/components/admin/EditableEmailComposer.tsx" "src/components/admin/AdminLocale.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 13 bilingual client email selection, server enforcement, regressions, ESLint, and TypeScript completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 13 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint13ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint14Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint14ResultFile, "Moumkas Admin Sprint 14 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint14ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 13 BILINGUAL EMAIL REGRESSION" { & node scripts/verify-sprint-13-contracts.mjs }
        Invoke-Step "SPRINT 14 HTML EMAIL DESIGN CONTRACTS" { & node scripts/verify-sprint-14-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-renderer.ts" "src/lib/email-templates.ts" "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/email-templates/EmailPreview.tsx" "src/app/admin/clients/[id]/email/actions.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 14 shared HTML renderer, preview parity, responsive controls, regressions, ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 14 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint14ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint15Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint15ResultFile, "Moumkas Admin Sprint 15 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint15ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 14 HTML EMAIL REGRESSION" { & node scripts/verify-sprint-14-contracts.mjs }
        Invoke-Step "SPRINT 15 EMAIL IMAGE LIBRARY CONTRACTS" { & node scripts/verify-sprint-15-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-renderer.ts" "src/lib/email-templates.ts" "src/lib/portfolio.ts" "src/app/admin/email-templates/TemplateEditor.tsx" "src/app/admin/email-templates/actions.ts" "src/components/admin/EditableEmailComposer.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 15 portfolio image picker, per-variant persistence, renderer parity, fallback protection, regressions, ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 15 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint15ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint16Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint16ResultFile, "Moumkas Admin Sprint 16 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint16ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 15 REGRESSION" { & node scripts/verify-sprint-15-contracts.mjs }
        Invoke-Step "SPRINT 16 WORKFLOW AND DOCUMENT CONTRACTS" { & node scripts/verify-sprint-16-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/leads.ts" "src/lib/document-templates.ts" "src/lib/email-renderer.ts" "src/app/admin/leads/actions.ts" "src/app/admin/leads/page.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/app/admin/leads/NativeDocumentManager.tsx" "src/app/admin/document-templates/page.tsx" "src/app/admin/document-templates/actions.ts" "src/app/admin/AdminChrome.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 16 inherited workflow profile, reusable documents, proposal CTA order, regressions, ESLint, TypeScript, and production build completed."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 16 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint16ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint17Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint17ResultFile, "Moumkas Admin Sprint 17 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint17ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 16 REGRESSION" { & node scripts/verify-sprint-16-contracts.mjs }
        Invoke-Step "SPRINT 17 WORKFLOW RETURN CONTRACTS" { & node scripts/verify-sprint-17-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/admin/dashboard/WeddingDashboard.tsx" "src/app/admin/dashboard/BaptismDashboard.tsx" "src/app/admin/leads/page.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/components/admin/CollapsibleAdminCard.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 17 returns a prefilled offer to the matching lead and guided-workflow tab."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 17 result file."; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint17ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint18Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint18ResultFile, "Moumkas Admin Sprint 18 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint18ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 17 REGRESSION" { & node scripts/verify-sprint-17-contracts.mjs }
        Invoke-Step "SPRINT 18 PROVISIONING CONTRACTS" { & node scripts/verify-sprint-18-contracts.mjs }
        Invoke-Step "SPRINT 18 DATABASE TRANSACTION" { & node --env-file=.env.development.local scripts/verify-sprint-18-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/document-templates.ts" "src/app/admin/document-templates/page.tsx" "src/app/admin/document-templates/actions.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 18 provisions questionnaire, contract, and invoice from the lead event and language defaults."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 18 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint18ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint19Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint19ResultFile, "Moumkas Admin Sprint 19 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint19ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 18 REGRESSION" { & node scripts/verify-sprint-18-contracts.mjs }
        Invoke-Step "SPRINT 19 TEMPLATE 001 CTA CONTRACTS" { & node scripts/verify-sprint-19-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-renderer.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""
        Write-RunnerLine "PASS - Sprint 19 centers the Template 001 proposal CTA directly below its introduction paragraph."
        Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 19 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint19ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint20Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint20ResultFile, "Moumkas Admin Sprint 20 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint20ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 19 REGRESSION" { & node scripts/verify-sprint-19-contracts.mjs }
        Invoke-Step "SPRINT 20 AUTOMATION SAFETY CONTRACTS" { & node scripts/verify-sprint-20-contracts.mjs }
        Invoke-Step "SPRINT 20 DATABASE PREFLIGHT" { & node --env-file=.env.development.local scripts/verify-sprint-20-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/automations.ts" "src/lib/automation-runner.ts" "src/lib/email-delivery.ts" "src/lib/onboarding.ts" "src/lib/lead-native-documents.ts" "src/lib/invoice-payments.ts" "src/lib/client-portals.ts" "src/lib/client-workflow.ts" "src/lib/lead-email-template-scope.ts" "src/app/api/automations/run/route.ts" "src/app/admin/AdminChrome.tsx" "src/app/admin/email-templates/TemplateEditor.tsx" "src/app/admin/leads/actions.ts" "src/app/admin/leads/page.tsx" "src/app/admin/leads/[id]/page.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/app/admin/leads/LeadEmailSender.tsx" "src/app/admin/leads/LeadTemplateImagePicker.tsx" "src/app/admin/clients/page.tsx" "src/app/admin/clients/[id]/page.tsx" "src/app/admin/clients/[id]/email/actions.ts" "src/app/admin/automations/page.tsx" "src/app/admin/document-templates/page.tsx" "src/components/admin/CollapsibleAdminCard.tsx" "src/components/admin/ClientWorkflowTracker.tsx" "src/components/admin/ClientWorkspaceSection.tsx" "src/components/admin/EmailHeaderImagePicker.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 20 prevents duplicate automated templates, advances the safe follow-up by three days, sends a daily 24-hour preview, and keeps each client's next action aligned with delivered emails."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 20 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint20ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint21Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint21ResultFile, "Moumkas Admin Sprint 21 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint21ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 20 REGRESSION" { & node scripts/verify-sprint-20-contracts.mjs }
        Invoke-Step "SPRINT 21 CLIENT PORTAL FILE CONTRACTS" { & node scripts/verify-sprint-21-contracts.mjs }
        Invoke-Step "SPRINT 21 DATABASE PREFLIGHT" { & node --env-file=.env.development.local scripts/verify-sprint-21-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/client-files.ts" "src/lib/client-portals.ts" "src/app/admin/overview/page.tsx" "src/app/admin/clients/[id]/actions.ts" "src/app/admin/clients/[id]/ClientFileUpload.tsx" "src/app/admin/clients/[id]/page.tsx" "src/app/portal/[slug]/page.tsx" "src/app/api/portal/[slug]/files/[fileId]/route.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 21 adds a private 5 MB client-file workflow, a portal Home overview, protected downloads, invoice isolation, and left-panel client workspace details."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 21 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint21ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint22Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint22ResultFile, "Moumkas Admin Sprint 22 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint22ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 21 REGRESSION" { & node scripts/verify-sprint-21-contracts.mjs }
        Invoke-Step "SPRINT 22 OFFER CLARITY CONTRACTS" { & node scripts/verify-sprint-22-contracts.mjs }
        Invoke-Step "SPRINT 22 DATABASE PREFLIGHT" { & node --env-file=.env.development.local scripts/verify-sprint-22-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/offers.ts" "src/lib/email-delivery.ts" "src/components/admin/EmailHistory.tsx" "src/app/admin/leads/actions.ts" "src/app/admin/leads/LeadEmailSender.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/app/admin/leads/page.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 22 makes the exact emailed offer visible, advances successful draft proposal sends, and promotes couple names on lead cards."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 22 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint22ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint23Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint23ResultFile, "Moumkas Admin Sprint 23 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint23ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 22 REGRESSION" { & node scripts/verify-sprint-22-contracts.mjs }
        Invoke-Step "SPRINT 23 GREEK PORTAL URL CONTRACTS" { & node scripts/verify-sprint-23-contracts.mjs }
        Invoke-Step "SPRINT 21 DATABASE PREFLIGHT" { & node --env-file=.env.development.local scripts/verify-sprint-21-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/client-portals.ts" "src/app/portal/[slug]/page.tsx" "src/app/api/portal/[slug]/files/[fileId]/route.ts" "src/app/api/portal/[slug]/contract.pdf/route.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 23 resolves percent-encoded Greek portal URLs through one normalized lookup for portal pages, files, and contract PDFs."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 23 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint23ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint24Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint24ResultFile, "Moumkas Admin Sprint 24 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint24ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 23 REGRESSION" { & node scripts/verify-sprint-23-contracts.mjs }
        Invoke-Step "SPRINT 24 CLIENT PORTAL CTA CONTRACTS" { & node scripts/verify-sprint-24-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-renderer.ts" "src/lib/email-templates.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 24 replaces the raw Template 005 portal URL with a View Client Portal CTA in preview and delivered HTML."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 24 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint24ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint25Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint25ResultFile, "Moumkas Admin Sprint 25 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint25ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 24 REGRESSION" { & node scripts/verify-sprint-24-contracts.mjs }
        Invoke-Step "SPRINT 25 TONELESS UPPERCASE GREEK CONTRACTS" { & node scripts/verify-sprint-25-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/greek-typography.ts" "src/app/portal/[slug]/page.tsx" "src/app/portal/[slug]/PortalInvoicePanel.tsx" "src/app/api/portal/[slug]/contract.pdf/route.ts" "src/components/admin/AdminLocale.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 25 removes Greek tonos from uppercase portal labels and preserves automatic toneless admin headings."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 25 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint25ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint26Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint26ResultFile, "Moumkas Admin Sprint 26 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint26ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 25 REGRESSION" { & node scripts/verify-sprint-25-contracts.mjs }
        Invoke-Step "SPRINT 26 CLIENT WORKFLOW EMAIL CONTRACTS" { & node scripts/verify-sprint-26-contracts.mjs }
        Invoke-Step "SPRINT 22 DATABASE PREFLIGHT" { & node --env-file=.env.development.local scripts/verify-sprint-22-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/client-workflow.ts" "src/lib/client-email-financials.ts" "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/clients/[id]/email/page.tsx" "src/app/admin/clients/[id]/email/ClientEmailComposer.tsx" "src/app/admin/clients/[id]/email/actions.ts" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 26 opens every client workflow email action on its exact template and calculates Template 005 deposit amounts from the accepted invoice total."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 26 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint26ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint27Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint27ResultFile, "Moumkas Admin Sprint 27 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint27ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 26 REGRESSION" { & node scripts/verify-sprint-26-contracts.mjs }
        Invoke-Step "SPRINT 27 DELETION AND EVENT IMAGE CONTRACTS" { & node scripts/verify-sprint-27-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/(site)/data/event-image-pools.ts" "src/components/admin/CollapsibleAdminCard.tsx" "src/components/admin/DeleteJourneyButton.tsx" "src/lib/client-files.ts" "src/lib/leads.ts" "src/lib/client-portals.ts" "src/app/portal/[slug]/PortalMarquee.tsx" "src/app/portal/[slug]/page.tsx" "src/components/sections/OfferPage/OfferHero.tsx" "src/components/sections/OfferPage/OfferChess.tsx" "src/components/sections/OfferPage/OfferOutro.tsx" "src/components/sections/HomePage/HomeProjectsGrid.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 27 provides protected complete-journey deletion and keeps baptism portal/offer visuals inside baptism-only image pools."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 27 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint27ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint28Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint28ResultFile, "Moumkas Admin Sprint 28 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint28ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 27 REGRESSION" { & node scripts/verify-sprint-27-contracts.mjs }
        Invoke-Step "SPRINT 28 WORKFLOW PROFILE CONTRACTS" { & node scripts/verify-sprint-28-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/approved-contracts.ts" "src/lib/contract-templates.ts" "src/lib/client-portals.ts" "src/lib/offers.ts" "src/app/admin/dashboard/page.tsx" "src/app/admin/dashboard/WeddingDashboard.tsx" "src/app/admin/dashboard/BaptismDashboard.tsx" "src/app/admin/leads/[id]/page.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 28 keeps offer and contract event/language profiles aligned across the guided workflow, acceptance, and client portal."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 28 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint28ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint29Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint29ResultFile, "Moumkas Admin Sprint 29 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint29ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 28 REGRESSION" { & node scripts/verify-sprint-28-contracts.mjs }
        Invoke-Step "SPRINT 29 PROPOSAL IMAGE CONTRACTS" { & node scripts/verify-sprint-29-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/(site)/data/proposal-image-sequence.ts" "src/components/ui/SeoImage.tsx" "src/components/animations/ParallaxImage.tsx" "src/components/core/Footer.tsx" "src/components/sections/OfferPage/OfferHero.tsx" "src/components/sections/OfferPage/OfferChess.tsx" "src/components/sections/OfferPage/OfferOutro.tsx" "src/components/sections/OfferPage/OfferLayout.tsx" "src/app/portal/[slug]/PortalMarquee.tsx" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 29 installs the fixed wedding offer sequence (hero 01, collections 02-04) and the fixed client-portal marquee sequence (01-06), with no wedding image-pool randomness."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 29 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint29ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint30Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint30ResultFile, "Moumkas Admin Sprint 30 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint30ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 29 REGRESSION" { & node scripts/verify-sprint-29-contracts.mjs }
        Invoke-Step "SPRINT 30 PORTAL AND CLIENT EMAIL CONTRACTS" { & node scripts/verify-sprint-30-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/client-portals.ts" "src/lib/client-email-financials.ts" "src/app/admin/clients/[id]/email/page.tsx" "src/app/admin/clients/[id]/email/ClientEmailComposer.tsx" "src/app/admin/clients/[id]/email/ClientTemplateImagePicker.tsx" "src/app/admin/clients/[id]/email/actions.ts" "scripts/verify-sprint-30-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 30 recovers legacy client portal documents, adds the shared image picker, and calculates the bilingual Template 005 deposit, VAT and remaining balance from the accepted collection."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 30 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint30ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint31Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint31ResultFile, "Moumkas Admin Sprint 31 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint31ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 30 REGRESSION" { & node scripts/verify-sprint-30-contracts.mjs }
        Invoke-Step "SPRINT 31 CLIENT DATE LOCK CONTRACTS" { & node scripts/verify-sprint-31-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/client-portals.ts" "src/app/portal/[slug]/page.tsx" "src/app/portal/[slug]/PortalMarquee.tsx" "src/components/ui/SeoImage.tsx" "src/lib/event-date-lock.ts" "src/lib/clients.ts" "src/lib/offers.ts" "scripts/verify-sprint-30-contracts.mjs" "scripts/verify-sprint-31-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 31 allows unlimited leads per date and atomically locks the date only when one becomes a client."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 31 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint31ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint32Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint32ResultFile, "Moumkas Admin Sprint 32 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint32ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 31 REGRESSION" { & node scripts/verify-sprint-31-contracts.mjs }
        Invoke-Step "SPRINT 32 REPLY-TO CALENDAR AND PDF CONTRACTS" { & node scripts/verify-sprint-32-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/email-delivery.ts" "src/lib/admin-calendar.ts" "src/app/admin/calendar/page.tsx" "src/app/admin/calendar/CalendarReservedDay.tsx" "src/app/api/admin/calendar.ics/route.ts" "src/app/admin/AdminChrome.tsx" "src/lib/client-document-pdf.ts" "src/app/api/admin/clients/[id]/documents/[type]/pdf/route.ts" "src/app/admin/clients/[id]/page.tsx" "scripts/verify-sprint-32-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 32 sends client replies to both studio and owner mailboxes, adds client-date calendar exports, and provides protected admin document PDFs."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 32 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint32ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint33Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint33ResultFile, "Moumkas Admin Sprint 33 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint33ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 32 REGRESSION" { & node scripts/verify-sprint-32-contracts.mjs }
        Invoke-Step "SPRINT 33 GOOGLE CALENDAR CONTRACTS" { & node scripts/verify-sprint-33-contracts.mjs }
        Invoke-Step "SPRINT 33 DATABASE PREFLIGHT" { & node --env-file=.env.development.local scripts/verify-sprint-33-database.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/google-calendar.ts" "src/app/admin/calendar/page.tsx" "src/app/admin/calendar/CalendarReservedDay.tsx" "src/app/admin/calendar/actions.ts" "src/app/api/admin/google-calendar/connect/route.ts" "src/app/api/admin/google-calendar/callback/route.ts" "scripts/verify-sprint-33-contracts.mjs" "scripts/verify-sprint-33-database.mjs" "scripts/seed-calendar-demo.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 33 provides protected Google Calendar OAuth, idempotent upcoming-client sync, and localhost-only calendar demo data."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 33 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint33ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint34Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint34ResultFile, "Moumkas Admin Sprint 34 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint34ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 32 CALENDAR AND PDF REGRESSION" { & node scripts/verify-sprint-32-contracts.mjs }
        Invoke-Step "SPRINT 33 GOOGLE CALENDAR SOURCE REGRESSION" { & node scripts/verify-sprint-33-contracts.mjs }
        Invoke-Step "SPRINT 34 PORTAL BAPTISM AND CALENDAR CONTRACTS" { & node scripts/verify-sprint-34-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/(site)/data/proposal-image-sequence.ts" "src/components/sections/OfferPage/OfferHero.tsx" "src/components/sections/OfferPage/OfferChess.tsx" "src/components/sections/OfferPage/OfferLayout.tsx" "src/components/sections/OfferPage/BaptismOfferGallery.tsx" "src/components/sections/OfferPage/OfferOutro.tsx" "src/components/core/Footer.tsx" "src/app/portal/[slug]/PortalMarquee.tsx" "src/app/portal/[slug]/page.tsx" "src/app/api/portal/[slug]/documents/[type]/pdf/route.ts" "src/lib/questionnaire-definitions.ts" "src/lib/questionnaires.ts" "src/app/questionnaire/[token]/page.tsx" "src/app/questionnaire/[token]/actions.ts" "src/lib/client-portals.ts" "src/lib/client-document-pdf.ts" "src/app/admin/calendar/page.tsx" "src/app/admin/calendar/CalendarReservedDay.tsx" "src/lib/google-calendar.ts" "scripts/verify-sprint-29-contracts.mjs" "scripts/verify-sprint-32-contracts.mjs" "scripts/verify-sprint-34-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 34 adds always-available portal PDFs, fixed baptism imagery and questionnaire content, and event-colored CRM and Google calendars."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 34 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint34ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint35Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint35ResultFile, "Moumkas Admin Sprint 35 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint35ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 34 PORTAL BAPTISM AND CALENDAR REGRESSION" { & node scripts/verify-sprint-34-contracts.mjs }
        Invoke-Step "SPRINT 35 CLIENT JOB CONTROL CENTER CONTRACTS" { & node scripts/verify-sprint-35-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/app/admin/clients/[id]/page.tsx" "src/app/admin/clients/[id]/actions.ts" "src/app/admin/leads/page.tsx" "src/app/admin/offers/page.tsx" "src/app/admin/clients/page.tsx" "src/components/admin/AdminPageHeader.tsx" "src/components/admin/CollapsibleAdminCard.tsx" "src/lib/client-document-overrides.ts" "src/lib/clients.ts" "src/lib/invoice-payments.ts" "src/lib/questionnaire-definitions.ts" "src/lib/client-portals.ts" "src/lib/client-document-pdf.ts" "src/app/portal/[slug]/page.tsx" "src/app/portal/[slug]/PortalMarquee.tsx" "src/app/api/portal/[slug]/documents/[type]/pdf/route.ts" "scripts/verify-sprint-32-contracts.mjs" "scripts/verify-sprint-34-contracts.mjs" "scripts/verify-sprint-35-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 35 turns each client record into a compact job control center and groups leads by month with expired offers last."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 35 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint35ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint36Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint36ResultFile, "Moumkas Admin Sprint 36 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint36ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 35 REGRESSION" { & node scripts/verify-sprint-35-contracts.mjs }
        Invoke-Step "SPRINT 36 PORTAL PDF AND NAVIGATION CONTRACTS" { & node scripts/verify-sprint-36-contracts.mjs }
        Invoke-Step "SPRINT 36 UNICODE PDF FONT" { & node scripts/verify-sprint-36-pdf-font.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/portal-url.ts" "src/lib/client-portals.ts" "src/lib/client-document-pdf.ts" "src/app/portal/[slug]/page.tsx" "src/app/portal/[slug]/actions.ts" "src/app/portal/[slug]/PortalMarquee.tsx" "src/app/portal/[slug]/PortalInvoicePanel.tsx" "src/app/api/portal/[slug]/contract.pdf/route.ts" "src/app/api/portal/[slug]/documents/[type]/pdf/route.ts" "scripts/verify-sprint-36-contracts.mjs" "scripts/verify-sprint-36-pdf-font.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" { & npm run build }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 36 fixes Unicode-safe bilingual client PDFs and canonical Greek-slug portal buttons."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 36 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint36ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint37Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint37ResultFile, "Moumkas Admin Sprint 37 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint37ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 36 PORTAL PDF REGRESSION" { & node scripts/verify-sprint-36-contracts.mjs }
        Invoke-Step "SPRINT 37 AUTOMATION SCHEDULING BOOKING AND CALENDAR CONTRACTS" { & node scripts/verify-sprint-37-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/workflow-template-registry.ts" "src/lib/athens-time.ts" "src/lib/automations.ts" "src/lib/automation-runner.ts" "src/lib/clients.ts" "src/lib/invoice-payments.ts" "src/lib/google-calendar.ts" "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/leads/LeadEmailSender.tsx" "src/app/admin/leads/LeadWorkflowWizard.tsx" "src/app/admin/leads/actions.ts" "src/app/admin/clients/[id]/actions.ts" "src/app/admin/clients/[id]/email/actions.ts" "src/app/admin/clients/[id]/page.tsx" "src/app/admin/automations/page.tsx" "src/app/admin/guide/page.tsx" "scripts/verify-sprint-37-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" {
            $buildDir=Join-Path $ProjectRoot ".next"
            if(Test-Path -LiteralPath $buildDir){Remove-Item -LiteralPath $buildDir -Recurse -Force}
            $previousSkipStandalone=$env:NEXT_SKIP_STANDALONE
            $env:NEXT_SKIP_STANDALONE="1"
            & npm run build
            if($LASTEXITCODE -ne 0){
                Write-RunnerLine "Windows locked a generated standalone path. Retrying once from a clean .next directory."
                Start-Sleep -Seconds 2
                if(Test-Path -LiteralPath $buildDir){Remove-Item -LiteralPath $buildDir -Recurse -Force}
                & npm run build
            }
            $env:NEXT_SKIP_STANDALONE=$previousSkipStandalone
        }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 37 corrects 007 and 009 timing, snapshots manual email choices, adds all-template scheduling and follow-up stops, enforces deposit booking evidence, and records idempotent Google sync state."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 37 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint37ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint38Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint38ResultFile, "Moumkas Admin Sprint 38 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint38ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
        Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 37 REGRESSION" { & node scripts/verify-sprint-37-contracts.mjs }
        Invoke-Step "SPRINT 38 MANUAL SCHEDULING AND RUNNER CONTRACTS" { & node scripts/verify-sprint-38-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/database.ts" "src/lib/automations.ts" "src/lib/automation-runner.ts" "src/components/admin/EditableEmailComposer.tsx" "src/app/admin/automations/page.tsx" "src/app/admin/leads/actions.ts" "src/app/admin/clients/[id]/email/actions.ts" "scripts/verify-sprint-38-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" {
            $buildDir=Join-Path $ProjectRoot ".next"
            if(Test-Path -LiteralPath $buildDir){Remove-Item -LiteralPath $buildDir -Recurse -Force}
            $previousSkipStandalone=$env:NEXT_SKIP_STANDALONE
            $env:NEXT_SKIP_STANDALONE="1"
            & npm run build
            if($LASTEXITCODE -ne 0){
                Write-RunnerLine "Windows locked a generated build path. Retrying once from a clean .next directory."
                Start-Sleep -Seconds 2
                if(Test-Path -LiteralPath $buildDir){Remove-Item -LiteralPath $buildDir -Recurse -Force}
                & npm run build
            }
            $env:NEXT_SKIP_STANDALONE=$previousSkipStandalone
        }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 38 fixes explicit 000-009 delivery timing, Greece-time queue display, runner visibility and duplicate cancellation evidence."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 38 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint38ResultFile" -ForegroundColor Yellow }
}

function Invoke-Sprint39Verification {
    New-Item -ItemType Directory -Force -Path $ArtifactDirectory | Out-Null
    [System.IO.File]::WriteAllText($Sprint39ResultFile, "Moumkas Admin Sprint 39 verification$([Environment]::NewLine)", $Utf8NoBom)
    $script:ActiveLogFile=$Sprint39ResultFile
    try {
        Write-RunnerLine "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; Write-RunnerLine "Project: $ProjectRoot"
        Invoke-Step "SPRINT 38 REGRESSION" { & node scripts/verify-sprint-38-contracts.mjs }
        Invoke-Step "SPRINT 39 HOMEPAGE CONTENT CONTRACTS" { & node scripts/verify-sprint-39-contracts.mjs }
        Invoke-Step "SCOPED ESLINT" { & npx eslint "src/lib/homepage-settings.ts" "src/lib/production-preflight.ts" "src/app/admin/homepage/actions.ts" "src/app/admin/homepage/page.tsx" "src/app/admin/AdminChrome.tsx" "src/app/(site)/page.tsx" "src/components/sections/HomePage/HomeHero.tsx" "src/components/sections/HomePage/HomeHeroDesktop.tsx" "src/components/sections/HomePage/HomeHeroMobile.tsx" "src/components/sections/ImageComponent.tsx" "src/components/sections/AboutPage/AboutSplitSectionMain.tsx" "src/components/sections/HomePage/HomeServicesSection.tsx" "src/components/sections/HomePage/HomeProjectsGrid.tsx" "src/components/sections/HomePage/HomeProjectVideoSection.tsx" "src/components/sections/HomePage/HomeTestimonialsOnScroll.tsx" "scripts/verify-sprint-39-contracts.mjs" }
        Invoke-Step "TYPESCRIPT" { & npx tsc --noEmit }
        Invoke-Step "PRODUCTION BUILD" {
            $buildDir=Join-Path $ProjectRoot ".next-sprint39-release"; if(Test-Path -LiteralPath $buildDir){Remove-Item -LiteralPath $buildDir -Recurse -Force}
            $previousSkipStandalone=$env:NEXT_SKIP_STANDALONE; $previousDistDir=$env:NEXT_DIST_DIR
            $env:NEXT_SKIP_STANDALONE="1"; $env:NEXT_DIST_DIR=".next-sprint39-release"; & npm run build
            $env:NEXT_SKIP_STANDALONE=$previousSkipStandalone; $env:NEXT_DIST_DIR=$previousDistDir
        }
        Write-RunnerLine ""; Write-RunnerLine "PASS - Sprint 39 adds validated owner-managed homepage content while preserving protected layout and defaults."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    } catch { Write-RunnerLine ""; Write-RunnerLine "FAIL - Review the Sprint 39 result file."; Write-RunnerLine "Finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"; throw } finally { $script:ActiveLogFile=$null; Write-Host "Verification output saved to: $Sprint39ResultFile" -ForegroundColor Yellow }
}

if ($Action -eq "Sprint01Verify") { Invoke-Sprint01Verification }
if ($Action -eq "Sprint02Verify") { Invoke-Sprint02Verification }
if ($Action -eq "Sprint03BrowserPrepare") { Invoke-Sprint03BrowserPreparation }
if ($Action -eq "Sprint03Verify") { Invoke-Sprint03Verification }
if ($Action -eq "Sprint04Verify") { Invoke-Sprint04Verification }
if ($Action -eq "Sprint05BrowserPrepare") { Invoke-Sprint05BrowserPreparation }
if ($Action -eq "Sprint05AVerify") { Invoke-Sprint05AVerification }
if ($Action -eq "Sprint05BVerify") { Invoke-Sprint05BVerification }
if ($Action -eq "Sprint05CVerify") { Invoke-Sprint05CVerification }
if ($Action -eq "Sprint05DVerify") { Invoke-Sprint05DVerification }
if ($Action -eq "Sprint06Verify") { Invoke-Sprint06Verification }
if ($Action -eq "Sprint07Verify") { Invoke-Sprint07Verification }
if ($Action -eq "Sprint08Verify") { Invoke-Sprint08Verification }
if ($Action -eq "Sprint09Verify") { Invoke-Sprint09Verification }
if ($Action -eq "Sprint10Verify") { Invoke-Sprint10Verification }
if ($Action -eq "Sprint11Verify") { Invoke-Sprint11Verification }
if ($Action -eq "Sprint12Verify") { Invoke-Sprint12Verification }
if ($Action -eq "Sprint13Verify") { Invoke-Sprint13Verification }
if ($Action -eq "Sprint14Verify") { Invoke-Sprint14Verification }
if ($Action -eq "Sprint15Verify") { Invoke-Sprint15Verification }
if ($Action -eq "Sprint16Verify") { Invoke-Sprint16Verification }
if ($Action -eq "Sprint17Verify") { Invoke-Sprint17Verification }
if ($Action -eq "Sprint18Verify") { Invoke-Sprint18Verification }
if ($Action -eq "Sprint19Verify") { Invoke-Sprint19Verification }
if ($Action -eq "Sprint20Verify") { Invoke-Sprint20Verification }
if ($Action -eq "Sprint21Verify") { Invoke-Sprint21Verification }
if ($Action -eq "Sprint22Verify") { Invoke-Sprint22Verification }
if ($Action -eq "Sprint23Verify") { Invoke-Sprint23Verification }
if ($Action -eq "Sprint24Verify") { Invoke-Sprint24Verification }
if ($Action -eq "Sprint25Verify") { Invoke-Sprint25Verification }
if ($Action -eq "Sprint26Verify") { Invoke-Sprint26Verification }
if ($Action -eq "Sprint27Verify") { Invoke-Sprint27Verification }
if ($Action -eq "Sprint28Verify") { Invoke-Sprint28Verification }
if ($Action -eq "Sprint29Verify") { Invoke-Sprint29Verification }
if ($Action -eq "Sprint30Verify") { Invoke-Sprint30Verification }
if ($Action -eq "Sprint31Verify") { Invoke-Sprint31Verification }
if ($Action -eq "Sprint32Verify") { Invoke-Sprint32Verification }
if ($Action -eq "Sprint33Verify") { Invoke-Sprint33Verification }
if ($Action -eq "Sprint34Verify") { Invoke-Sprint34Verification }
if ($Action -eq "Sprint35Verify") { Invoke-Sprint35Verification }
if ($Action -eq "Sprint36Verify") { Invoke-Sprint36Verification }
if ($Action -eq "Sprint37Verify") { Invoke-Sprint37Verification }
if ($Action -eq "Sprint38Verify") { Invoke-Sprint38Verification }
if ($Action -eq "Sprint39Verify") { Invoke-Sprint39Verification }
if ($Action -eq "SeedInvoiceDemo") { & node --env-file=.env.development.local scripts/seed-invoice-payment-demo.mjs --confirm-local-invoice-demo; if ($LASTEXITCODE -ne 0) { throw "Local invoice demo seed failed with exit code $LASTEXITCODE." } }
if ($Action -eq "RemoveInvoiceDemo") { & node --env-file=.env.development.local scripts/seed-invoice-payment-demo.mjs --confirm-local-invoice-demo --remove; if ($LASTEXITCODE -ne 0) { throw "Local invoice demo removal failed with exit code $LASTEXITCODE." } }
if ($Action -eq "SeedCalendarDemo") { & node --env-file=.env.development.local scripts/seed-calendar-demo.mjs --confirm-local-calendar-demo; if ($LASTEXITCODE -ne 0) { throw "Local calendar demo seed failed with exit code $LASTEXITCODE." } }
if ($Action -eq "RemoveCalendarDemo") { & node --env-file=.env.development.local scripts/seed-calendar-demo.mjs --confirm-local-calendar-demo --remove; if ($LASTEXITCODE -ne 0) { throw "Local calendar demo removal failed with exit code $LASTEXITCODE." } }
