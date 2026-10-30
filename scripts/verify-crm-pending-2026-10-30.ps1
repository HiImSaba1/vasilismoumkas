& {
    $ErrorActionPreference = 'Stop'
    Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
    $logs = Join-Path (Get-Location) 'artifacts\verification'
    New-Item -ItemType Directory -Force -Path $logs | Out-Null
    $log = Join-Path $logs ("crm-pending-20261030-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')
    $files = @(
        'scripts/verify-crm-pending-2026-10-30.mjs',
        'scripts/verify-content-management-2026-10-23.mjs',
        'src/app/admin/AdminChrome.tsx', 'src/app/admin/layout.tsx',
        'src/app/admin/overview/page.tsx', 'src/app/admin/pending/page.tsx',
        'src/app/admin/leads/LeadWorkflowWizard.tsx', 'src/app/admin/leads/ClientWorkspaceActivation.tsx',
        'src/app/admin/leads/actions.ts', 'src/app/admin/offers/actions.ts',
        'src/app/admin/offers/OfferDecisionControls.tsx',
        'src/components/admin/AdminPageHeader.tsx',
        'src/components/admin/NewActivityNotifications.tsx',
        'src/components/admin/PendingActionsTable.tsx',
        'src/components/sections/AboutPage/AboutBigImageSection.tsx', 'src/app/not-found.tsx',
        'src/lib/admin-workflow-revalidation.ts', 'src/lib/clients.ts', 'src/lib/offers.ts',
        'src/lib/event-date-lock.ts', 'src/lib/new-activity.ts', 'src/lib/pending-actions.ts',
        'src/lib/workflow-reminders.ts', 'src/lib/local-settings-fallback.ts',
        'src/lib/public-page-settings.ts', 'src/lib/seo-overrides.ts'
    )
    Start-Transcript -LiteralPath $log | Out-Null
    try {
        Write-Host '=== 1. SCOPED CRM ESLINT ==='
        & node node_modules/eslint/bin/eslint.js --no-cache @files
        if ($LASTEXITCODE -ne 0) { throw 'Scoped CRM ESLint failed.' }
        Write-Host '=== 2. OFFLINE DATE CONFLICT AND PENDING ACTION CONTRACTS ==='
        & node scripts/verify-crm-pending-2026-10-30.mjs
        if ($LASTEXITCODE -ne 0) { throw 'CRM offline checks failed.' }
        Write-Host '=== 3. EXISTING CONTENT / QUESTIONNAIRE / TYPESCRIPT / BUILD ==='
        & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify-content-management-2026-10-23.ps1')
        if ($LASTEXITCODE -ne 0) { throw 'Existing verification failed.' }
        Write-Host 'PASS - CRM LOCAL STATIC AND OFFLINE VERIFICATION'
        Write-Host 'Real baptism activation, actual payment entries and deployment remain separate owner-run gates.'
        Write-Host 'No real database write, email, automation run, migration or deployment invoked.'
    } finally {
        Stop-Transcript | Out-Null
        Write-Host "Verification log: $log"
    }
}
