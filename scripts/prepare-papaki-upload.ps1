$ErrorActionPreference = "Stop"

throw @"
This legacy full-source ZIP release path is disabled.

Papaki must receive the minimal Linux standalone runtime, not a Windows build,
the full source tree, or the complete Next.js runtime.

Run this owner-controlled command after WSL and Node.js 22 are available:
  .\scripts\prepare-papaki-built-release.ps1 -ReleaseLabel standalone

Then follow PAPAKI_STANDALONE_DEPLOYMENT.md.
"@
