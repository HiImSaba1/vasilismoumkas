& {
    $ErrorActionPreference = "Stop"
    Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
    $logDirectory = Join-Path (Get-Location) 'artifacts\verification'
    New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
    $report = Join-Path $logDirectory ("education-projects-eslint-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.txt')
    $files = @(
        'next.config.ts',
        'scripts/verify-content-management-2026-10-23.mjs',
        'scripts/audit-education-contact-2026-10-29.mjs',
        'src/app/(site)/contact/ContactPageClient.tsx',
        'src/app/(site)/education/page.tsx',
        'src/app/(site)/portfolio/[category]/CategoryPortfolioClient.tsx',
        'src/app/(site)/portfolio/[category]/page.tsx',
        'src/app/(site)/portfolio/project/[slug]/page.tsx',
        'src/app/admin/pages/PageContentForm.tsx',
        'src/app/admin/pages/[page]/page.tsx',
        'src/app/admin/pages/[page]/preview/page.tsx',
        'src/app/admin/pages/actions.ts',
        'src/app/admin/pages/page.tsx',
        'src/app/sitemap.ts',
        'src/components/admin/ContentFields.tsx',
        'src/components/animations/CinematicSlider.tsx',
        'src/components/core/Navbar.tsx',
        'src/components/sections/EducationPage',
        'src/components/sections/ManagedEducation.tsx',
        'src/components/sections/Projects/ProjectCard.tsx',
        'src/components/sections/Projects/ProjectHero.tsx',
        'src/lib/education-content.ts',
        'src/lib/portfolio-categories.ts',
        'src/lib/project-presentation.ts',
        'src/lib/public-page-content.ts',
        'src/lib/email-renderer.ts',
        'src/providers/EducationContentContext.tsx'
    )
    Write-Host '=== EDUCATION / PROJECT / CONTACT COMPONENT LINT ==='
    & node node_modules/eslint/bin/eslint.js --no-cache --format stylish --output-file $report @files
    $lintExit = $LASTEXITCODE
    if (Test-Path -LiteralPath $report) { Get-Content -LiteralPath $report }
    if ($lintExit -ne 0) { throw "Scoped ESLint failed. Send $report" }
    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify-content-management-2026-10-23.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'Content management verification failed. Preserve its verification log.' }
    Write-Host 'PASS - EDUCATION / PROJECT / CONTACT STATIC AND BUILD VERIFICATION'
    Write-Host 'Browser screenshots, real iPhone/Instagram acceptance and live host redirect checks remain separate.'
    Write-Host 'No database writes, migration, real email, form submission, port change or deployment invoked.'
}
