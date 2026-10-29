[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet("Upload", "CleanupInventory", "CleanupTemporary")]
    [string]$Action,

    [Parameter(Mandatory)]
    [ValidatePattern('^[0-9]+$')]
    [string]$ArtifactNumber,

    [Parameter(Mandatory)]
    [ValidatePattern('^[0-9]+$')]
    [string]$Sprint,

    [string]$ZipPath,
    [string]$ExpectedZipSha256,
    [string]$ExpectedBuildId,
    [switch]$ConfirmCleanup,
    [string]$SshTarget = "c179367pav@213.158.90.80",
    [int]$SshPort = 2234
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$FixedRelease = "/var/www/vhosts/sabaweb.gr/vasilismoumkas.com/releases/github-16-20261016-sprint47"
$Incoming = "/var/www/vhosts/sabaweb.gr/vasilismoumkas-app/incoming-github-$ArtifactNumber-sprint$Sprint"
$Staged = "/var/www/vhosts/sabaweb.gr/vasilismoumkas-app/releases/github-$ArtifactNumber-sprint$Sprint"

function Invoke-RemoteScript {
    param([Parameter(Mandatory)][string]$Script)
    # Windows PowerShell may prefix piped UTF-8 with a BOM. Strip it remotely
    # before Bash parses the first command, and normalize remaining CR bytes.
    ($Script -replace "`r`n", "`n") | ssh -p $SshPort $SshTarget "LC_ALL=C sed '1s/^\xEF\xBB\xBF//' | tr -d '\015' | bash -se"
    if ($LASTEXITCODE -ne 0) { throw "Remote command failed with exit code $LASTEXITCODE." }
}

function Invoke-Upload {
    if (-not $ZipPath -or -not $ExpectedZipSha256) {
        throw "Upload requires -ZipPath and -ExpectedZipSha256."
    }
    if (-not (Test-Path -LiteralPath $ZipPath -PathType Leaf)) {
        throw "Artifact ZIP does not exist: $ZipPath"
    }

    Write-Host "=== 1. VERIFY GITHUB ZIP ==="
    $actualZipSha = (Get-FileHash -LiteralPath $ZipPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualZipSha -ne $ExpectedZipSha256.ToLowerInvariant()) {
        throw "GitHub ZIP digest mismatch."
    }
    Write-Host "PASS - GITHUB ZIP VERIFIED"

    Write-Host "=== 2. EXTRACT AND VERIFY INTERNAL ARCHIVE ==="
    $output = Join-Path (Split-Path -Parent $ZipPath) ("moumkas-papaki-standalone-" + $ArtifactNumber)
    if (Test-Path -LiteralPath $output) {
        throw "Output directory already exists: $output"
    }
    Expand-Archive -LiteralPath $ZipPath -DestinationPath $output
    $tar = Get-ChildItem -LiteralPath $output -File -Filter "*.tar.gz" | Select-Object -First 1
    if (-not $tar) { throw "Artifact TAR was not found after extraction." }
    $checksum = Get-Item -LiteralPath ($tar.FullName + ".sha256") -ErrorAction Stop
    $expectedInternal = ((Get-Content -LiteralPath $checksum.FullName -Raw).Trim() -split '\s+')[0].ToLowerInvariant()
    $actualInternal = (Get-FileHash -LiteralPath $tar.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualInternal -ne $expectedInternal) { throw "Internal TAR checksum mismatch." }
    Write-Host "PASS - INTERNAL RELEASE VERIFIED"

    Write-Host "=== 3. CREATE ISOLATED INCOMING DIRECTORY ==="
    $prepare = @"
set -eu
incoming='$Incoming'
test ! -e "`$incoming"
mkdir -p "`$incoming"
chmod 750 "`$incoming"
echo 'PASS - INCOMING DIRECTORY CREATED'
"@
    Invoke-RemoteScript $prepare

    Write-Host "=== 4. UPLOAD TAR AND CHECKSUM ==="
    scp -P $SshPort $tar.FullName $checksum.FullName "${SshTarget}:${Incoming}/"
    if ($LASTEXITCODE -ne 0) { throw "Artifact upload failed." }

    $verify = @"
set -eu
incoming='$Incoming'
cd "`$incoming"
sha256sum -c '$($checksum.Name)'
ls -lh '$($tar.Name)' '$($checksum.Name)'
echo 'PASS - RELEASE UPLOADED AND VERIFIED'
echo 'LIVE PRODUCTION: UNCHANGED'
echo 'DATABASE: UNCHANGED'
echo 'PLESK PATHS: UNCHANGED'
"@
    Invoke-RemoteScript $verify
}

function Invoke-CleanupInventory {
    if (-not $ExpectedBuildId) { throw "Cleanup inventory requires -ExpectedBuildId." }
    $script = @"
set -eu
active='$FixedRelease'
incoming='$Incoming'
staged='$Staged'
test "`$(cat "`$active/.next/standalone/.next/BUILD_ID")" = '$ExpectedBuildId'
echo '=== ACTIVE FIXED RELEASE ==='
du -sh "`$active"
echo '=== TEMPORARY DEPLOYMENT COPIES ==='
for target in "`$incoming" "`$staged"; do
  if [ -e "`$target" ]; then du -sh "`$target"; else echo "MISSING: `$target"; fi
done
echo '=== LIVE RELEASE DIRECTORIES ==='
find '/var/www/vhosts/sabaweb.gr/vasilismoumkas.com/releases' -mindepth 1 -maxdepth 1 -type d -print0 | while IFS= read -r -d '' directory; do du -sh "`$directory"; done
df -h '/var/www/vhosts/sabaweb.gr'
echo 'PASS - CLEANUP INVENTORY COMPLETE'
echo 'NO FILES DELETED'
"@
    Invoke-RemoteScript $script
}

function Invoke-CleanupTemporary {
    if (-not $ConfirmCleanup) { throw "Cleanup requires the explicit -ConfirmCleanup switch." }
    if (-not $ExpectedBuildId) { throw "Cleanup requires -ExpectedBuildId." }
    $script = @"
set -eu
active='$FixedRelease'
incoming='$Incoming'
staged='$Staged'
test "`$(cat "`$active/.next/standalone/.next/BUILD_ID")" = '$ExpectedBuildId'
echo '=== VALIDATE EXACT TEMPORARY TARGETS ==='
for target in "`$incoming" "`$staged"; do
  case "`$target" in
    /var/www/vhosts/sabaweb.gr/vasilismoumkas-app/incoming-github-$ArtifactNumber-sprint$Sprint|/var/www/vhosts/sabaweb.gr/vasilismoumkas-app/releases/github-$ArtifactNumber-sprint$Sprint) ;;
    *) echo "STOP - unexpected cleanup target: `$target"; exit 1 ;;
  esac
  test -e "`$target"
  du -sh "`$target"
done
echo 'PASS - TEMPORARY TARGETS VALIDATED'
echo '=== DELETE TEMPORARY COPIES ==='
rm -rf -- "`$incoming" "`$staged"
test ! -e "`$incoming"
test ! -e "`$staged"
health="`$(curl -fsS --max-time 15 'https://vasilismoumkas.com/api/health?cleanup=1')"
homepage="`$(curl -sS --max-time 15 -o /dev/null -w '%{http_code}' 'https://vasilismoumkas.com/?cleanup=1')"
echo "`$health"
echo "Homepage HTTP: `$homepage"
echo "`$health" | grep -q '"ok":true'
test "`$homepage" = '200'
echo 'PASS - TEMPORARY DEPLOYMENT COPIES REMOVED'
echo 'ROLLBACKS AND DATABASE BACKUPS: UNCHANGED'
echo 'PLESK PATHS: UNCHANGED'
"@
    Invoke-RemoteScript $script
}

switch ($Action) {
    "Upload" { Invoke-Upload }
    "CleanupInventory" { Invoke-CleanupInventory }
    "CleanupTemporary" { Invoke-CleanupTemporary }
}
