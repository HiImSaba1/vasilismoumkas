$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath 'C:\Users\sab_j\Desktop\Projects\moumkas-new\moumkas-awwwards'
$outputDirectory = Join-Path $PWD 'artifacts\verification'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$log = Join-Path $outputDirectory ('email-composer-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')
Start-Transcript -Path $log
try {
    Write-Host '=== 1. SCOPED EMAIL ESLINT ==='
    $files = @('src/lib/email-composition.ts','src/lib/email-drafts.ts','src/lib/approved-email-layout.ts','src/lib/email-delivery.ts','src/lib/email-inline-assets.ts','src/components/admin/useServerEmailDraft.ts','src/app/admin/email-templates/draft-actions.ts','src/app/admin/email-templates/ApplyCollectionStyle.tsx','src/lib/email-design-samples.ts','src/lib/email-test-layout.ts','src/components/admin/EmailSectionBuilder.tsx','src/components/admin/useEmailPreviewOrigin.ts','src/app/admin/email-templates/actions.ts','src/lib/structured-email-renderer.ts','src/lib/email-renderer.ts','src/lib/email-templates.ts','src/lib/client-email-financials.ts','src/components/admin/StructuredEmailComposer.tsx','src/components/admin/EditableEmailComposer.tsx','src/components/admin/EmailCompositionFields.tsx','src/app/admin/email-templates/TemplateEditor.tsx','src/app/admin/email-templates/TemplateChooser.tsx','src/app/admin/email-templates/page.tsx','src/app/admin/email-templates/composer-actions.ts','src/app/admin/leads/LeadEmailSender.tsx','src/app/admin/leads/LeadWorkflowWizard.tsx','src/app/admin/leads/actions.ts','src/app/admin/clients/[id]/email/ClientEmailComposer.tsx','src/app/admin/clients/[id]/email/actions.ts')
    & npx.cmd eslint @files
    if ($LASTEXITCODE -ne 0) { throw 'Scoped email ESLint failed.' }
    Write-Host '=== 2. OFFLINE EMAIL CONTRACTS ==='
    & node.exe scripts/verify-email-composer-2026-10-31.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Offline email checks failed.' }
    Write-Host '=== 3. TYPESCRIPT ==='
    & npx.cmd tsc --noEmit
    if ($LASTEXITCODE -ne 0) { throw 'TypeScript failed.' }
    Write-Host '=== 4. PRODUCTION BUILD ==='
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
    Write-Host 'PASS - LOCAL EMAIL COMPOSER VERIFICATION'
    Write-Host 'Browser draft/switch/image acceptance and owner-authorized Gmail/Apple Mail tests remain pending.'
    Write-Host 'No migration, real email, automation, Git push, deployment, path or port change executed.'
} finally {
    Write-Host "Verification log: $log"
    Stop-Transcript
}
