$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath 'C:\Users\sab_j\Desktop\Projects\moumkas-new\moumkas-awwwards'
$directory = Join-Path (Get-Location) 'artifacts\verification'
New-Item -ItemType Directory -Force -Path $directory | Out-Null
$log = Join-Path $directory ('ga4-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')
Start-Transcript -Path $log
try {
    Write-Host '=== 1. SCOPED GA4 LINT ==='
    npx eslint src/lib/analytics-consent.ts src/components/core/GoogleAnalytics.tsx src/components/core/CookieBanner.tsx 'src/app/(site)/layout.tsx' scripts/verify-ga4-2026-11-03.mjs
    if ($LASTEXITCODE -ne 0) { throw 'ESLint failed.' }
    Write-Host '=== 2. OFFLINE CONSENT AND ROUTING CONTRACTS ==='
    node scripts/verify-ga4-2026-11-03.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Offline checks failed.' }
    Write-Host '=== 3. TYPESCRIPT ==='
    npx tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript failed.' }
    Write-Host '=== 4. PRODUCTION BUILD ==='
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
    Write-Host 'PASS - LOCAL GA4 VERIFICATION'
    Write-Host 'Required before activation: owner disables Enhanced measurement on the selected stream.'
    Write-Host 'Live network and Realtime acceptance remain pending.'
    Write-Host 'No migration, real email, automation, Git push or deployment executed.'
} finally { Stop-Transcript }
