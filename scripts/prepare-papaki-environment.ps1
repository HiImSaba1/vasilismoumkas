param(
  [string]$DatabaseHost = "127.0.0.1",
  [int]$DatabasePort = 3306
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$developmentPath = Join-Path $projectRoot ".env.development.local"
$adminPath = Join-Path $projectRoot ".env.local"
$productionPath = Join-Path $projectRoot ".env.production.local"

function Read-EnvironmentFile([string]$Path) {
  $values = [ordered]@{}
  if (-not (Test-Path -LiteralPath $Path)) { return $values }
  foreach ($line in Get-Content -LiteralPath $Path) {
    if ($line -notmatch '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') { continue }
    $value = $Matches[2]
    if ($value.Length -ge 2 -and $value.StartsWith('"') -and $value.EndsWith('"')) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    $values[$Matches[1]] = $value
  }
  return $values
}

function Protect-EnvironmentValue([string]$Value) {
  $escaped = $Value.Replace('\', '\\').Replace('"', '\"').Replace("`r", '').Replace("`n", '\n')
  return '"' + $escaped + '"'
}

$settings = Read-EnvironmentFile $developmentPath
$adminSettings = Read-EnvironmentFile $adminPath
$databasePassword = Read-Host "Papaki DB_PASSWORD (input is hidden)" -AsSecureString
$databasePasswordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($databasePassword)

try {
  $plainDatabasePassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($databasePasswordPointer)
  if ([string]::IsNullOrWhiteSpace($plainDatabasePassword)) { throw "DB_PASSWORD cannot be empty." }

  $settings["NODE_ENV"] = "production"
  $settings["ADMIN_USERNAME"] = if ($settings["ADMIN_USERNAME"]) { $settings["ADMIN_USERNAME"] } else { "VASILIS" }
  $settings["ADMIN_PASSWORD"] = if ($adminSettings["ADMIN_PASSWORD"]) { $adminSettings["ADMIN_PASSWORD"] } else { $settings["ADMIN_PASSWORD"] }
  $settings["DB_HOST"] = $DatabaseHost
  $settings["DB_PORT"] = [string]$DatabasePort
  $settings["DB_NAME"] = "next_vasilismoumkas"
  $settings["DB_USER"] = "vasilismoumkas"
  $settings["DB_PASSWORD"] = $plainDatabasePassword

  $required = @(
    "ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET",
    "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD",
    "SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USERNAME", "SMTP_PASSWORD",
    "SMTP_FROM_EMAIL", "SMTP_ENABLED", "INQUIRY_NOTIFICATION_EMAIL",
    "AUTOMATION_SECRET", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_RECENT_GALLERY_URL",
    "GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET",
    "GOOGLE_CALENDAR_REDIRECT_URI", "GOOGLE_CALENDAR_TOKEN_KEY"
  )
  $missing = @($required | Where-Object { -not $settings.Contains($_) -or [string]::IsNullOrWhiteSpace($settings[$_]) })
  if ($missing.Count) { throw "Missing required settings: $($missing -join ', ')" }

  $siteUrl = ([string]$settings["NEXT_PUBLIC_SITE_URL"]).TrimEnd('/')
  $expectedCalendarRedirect = "$siteUrl/api/admin/google-calendar/callback"
  if ([string]$settings["GOOGLE_CALENDAR_REDIRECT_URI"] -ne $expectedCalendarRedirect) {
    throw "GOOGLE_CALENDAR_REDIRECT_URI must exactly match $expectedCalendarRedirect"
  }
  if (([string]$settings["GOOGLE_CALENDAR_TOKEN_KEY"]).Length -lt 32) {
    throw "GOOGLE_CALENDAR_TOKEN_KEY must contain at least 32 characters."
  }

  $lines = foreach ($key in $required) { "$key=$(Protect-EnvironmentValue ([string]$settings[$key]))" }
  Set-Content -LiteralPath $productionPath -Value $lines -Encoding utf8
  Write-Host "Created ignored production environment file: $productionPath"
  Write-Host "No secret values were printed. Do not include this file in a public archive or source control."
} finally {
  if ($databasePasswordPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($databasePasswordPointer)
  }
  $plainDatabasePassword = $null
}
