[CmdletBinding()]
param([switch]$LintOnly)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$logDirectory = Join-Path $projectRoot "artifacts\verification"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$logName = if ($LintOnly) { "public-copy-2026-10-22-lint-results.txt" } else { "public-copy-2026-10-22-results.txt" }
$logFile = Join-Path $logDirectory $logName
$lintReport = Join-Path $logDirectory ("public-copy-eslint-" + (Get-Date -Format "yyyyMMdd-HHmmss-fff") + ".txt")
$checksFailed = @()

$lintFiles = @(
    "src/app/(site)/about/page.tsx",
    "src/app/(site)/data/ApprovedPublicCopy.ts",
    "src/app/(site)/data/FaqAboutData.ts",
    "src/app/(site)/data/FaqData.ts",
    "src/app/(site)/data/ServicesData.ts",
    "src/components/animations/AnimatedHeadline.tsx",
    "src/components/core/Footer.tsx",
    "src/components/sections/AboutPage/AboutBigImageSection.tsx",
    "src/components/sections/AboutPage/AboutFaqSection.tsx",
    "src/components/sections/AboutPage/AboutQuoteSection.tsx",
    "src/components/sections/ContactForm.tsx",
    "src/components/sections/HomePage/HomeMarqueeImages.tsx",
    "src/components/sections/HomePage/HomeProjectsGrid.tsx",
    "src/components/sections/HomePage/HomeTestimonialsOnScroll.tsx",
    "src/components/sections/Projects/ProjectCard.tsx",
    "src/components/sections/ServicesPage/ServicesHeroSection.tsx",
    "src/lib/homepage-settings.ts"
)

Start-Transcript -LiteralPath $logFile -Force | Out-Null
try {
    Write-Host "=== 1. SCOPED ESLINT ==="
    Write-Host "Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss K')"
    Write-Host "ContactForm SHA256: $((Get-FileHash -LiteralPath 'src/components/sections/ContactForm.tsx' -Algorithm SHA256).Hash)"
    & npx.cmd --no-install eslint --no-cache --format stylish --output-file $lintReport @lintFiles
    if ($LASTEXITCODE -ne 0) { $checksFailed += "ESLint" }
    if (Test-Path -LiteralPath $lintReport) {
        Get-Content -LiteralPath $lintReport | ForEach-Object { Write-Host $_ }
    }
    Write-Host "ESLint report: $lintReport"
    if ($checksFailed.Count -gt 0) {
        throw "ESLint failed. Send the ESLint report above; TypeScript and build were not started."
    }
    if ($LintOnly) {
        Write-Host "PASS - SCOPED ESLINT ONLY"
        Write-Host "TypeScript, build and production actions were not invoked."
        return
    }

    Write-Host "=== 2. TYPESCRIPT ==="
    & npx.cmd --no-install tsc --noEmit
    if ($LASTEXITCODE -ne 0) { $checksFailed += "TypeScript" }

    Write-Host "=== 3. PRODUCTION BUILD ==="
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { $checksFailed += "Build" }

    if ($checksFailed.Count -gt 0) {
        throw "Checks requiring review: $($checksFailed -join ', '). Preserve this log before push or deployment."
    }
    Write-Host "PASS - SCOPED LINT, TYPESCRIPT AND BUILD"
    Write-Host "Desktop/mobile browser acceptance remains pending."
    Write-Host "No migration, seed, email, automation, Git push or deployment was invoked."
} finally {
    Stop-Transcript | Out-Null
    Write-Host "Verification log: $logFile"
}
