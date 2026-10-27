& {
    $ErrorActionPreference = "Stop"
    Set-Location (Split-Path -Parent $PSScriptRoot)
    Write-Host '=== MOBILE FOLLOWUP COMPONENT LINT ==='
    $files = @(
        'src/ClientLayout.tsx',
        'src/app/(site)/layout.tsx',
        'src/app/(site)/contact/ContactPageClient.tsx',
        'src/app/admin/pages/[page]/preview/page.tsx',
        'src/components/core/Footer.tsx',
        'src/components/core/Navbar.tsx',
        'src/components/sections/AboutPage/AboutQuoteSection.tsx',
        'src/components/sections/AboutPage/AboutGallerySection.tsx',
        'src/components/sections/HomePage/HomeMarqueeImages.tsx',
        'src/components/sections/ManagedPages.tsx',
        'src/components/ui/CTAButton.tsx',
        'src/components/ui/SeoImage.tsx',
        'src/lib/public-page-content.ts'
    )
    & npx.cmd eslint @files
    if ($LASTEXITCODE -ne 0) { throw 'Mobile followup ESLint failed.' }

    & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'verify-content-management-2026-10-23.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'Content management verification failed.' }
    Write-Host 'PASS - MOBILE FOLLOWUP STATIC AND BUILD CHECKS'
    Write-Host 'Desktop/mobile screenshots, Safari/Instagram acceptance and live URL audit remain pending.'
    Write-Host 'No form submission, email, migration, deployment or port change invoked.'
}
