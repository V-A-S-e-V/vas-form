<#
PowerShell script to download SVG flags for all countries from Rest Countries.
Usage: Open PowerShell in project root and run:
  .\scripts\download_flags.ps1

This will create a 'flags' directory and save files like 'ng.svg', 'fr.svg', etc.
#>

$api = 'https://restcountries.com/v3.1/all?fields=cca2,flags'
$outDir = Join-Path -Path $PSScriptRoot -ChildPath '..\flags' | Resolve-Path -Relative -ErrorAction SilentlyContinue
if (-not $outDir) {
    $outDir = Join-Path $PSScriptRoot '..\flags'
}

if (-not (Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir | Out-Null
}

try {
  Write-Host "Fetching country list from Rest Countries..."
  $data = Invoke-RestMethod -Uri $api -UseBasicParsing
} catch {
  Write-Error "Failed to fetch country list: $_"
  exit 1
}

foreach ($c in $data) {
  $code = ($c.cca2 -as [string])?.ToLower()
  if (-not $code) { Write-Warning "Skipping country with missing code"; continue }
  $svgUrl = $c.flags.svg -or $c.flags.png
  if (-not $svgUrl) { Write-Warning "No flag URL for $code"; continue }
  $dest = Join-Path $outDir ("$code.svg")
  try {
    Write-Host "Downloading $code -> $dest"
    Invoke-WebRequest -Uri $svgUrl -OutFile $dest -UseBasicParsing -ErrorAction Stop
  } catch {
    Write-Warning "Failed to download $svgUrl : $_"
  }
}

Write-Host "Done. Flags saved to $outDir"
