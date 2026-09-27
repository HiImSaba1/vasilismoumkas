param(
  [ValidatePattern('^[a-z0-9][a-z0-9-]{0,31}$')]
  [string]$ReleaseLabel = "standalone"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$linuxBuilder = Join-Path $PSScriptRoot "build-papaki-linux-release.sh"

Set-Location -LiteralPath $projectRoot

if (-not (Test-Path -LiteralPath $linuxBuilder)) {
  throw "Linux release builder was not found: $linuxBuilder"
}

$wslOutput = (& wsl.exe --list --quiet 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or $wslOutput -match "not installed" -or [string]::IsNullOrWhiteSpace($wslOutput)) {
  throw @"
WSL with a Linux distribution is required. A Windows-generated standalone runtime
must not be uploaded to Papaki.

Owner-run setup (run PowerShell as Administrator):
  wsl --install -d Ubuntu

After Windows finishes the setup/restart, open Ubuntu once and install Node.js
22 plus npm. Then rerun:
  .\scripts\prepare-papaki-built-release.ps1 -ReleaseLabel $ReleaseLabel
"@
}

$linuxBuilderPath = (& wsl.exe wslpath -a $linuxBuilder 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($linuxBuilderPath)) {
  throw "WSL could not translate the Linux builder path."
}

Write-Host "Building a minimal Papaki standalone release inside Linux/WSL..."
& wsl.exe bash $linuxBuilderPath $ReleaseLabel
if ($LASTEXITCODE -ne 0) {
  throw "Papaki Linux release build failed with exit code $LASTEXITCODE."
}

Write-Host "The .tar.gz archive and its .sha256 checksum are ready under: $projectRoot\tmp"
Write-Host "No production environment file or private client upload was packaged."
