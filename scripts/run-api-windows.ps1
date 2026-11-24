$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$environmentFile = Join-Path $projectRoot '.env'

if (-not (Test-Path $environmentFile))
{
  throw 'Thiếu .env. Sao chép .env.example thành .env.'
}

$configuration = @{}

Get-Content $environmentFile | ForEach-Object {
  $entry = $_.Trim()

  if ($entry -and -not $entry.StartsWith('#'))
  {
    $key, $value = $entry -split '=', 2
    $configuration[$key] = $value
  }
}

$env:ConnectionStrings__Postgres = 'Host=127.0.0.1;Port=5432;' +
  "Database=$($configuration['POSTGRES_DB']);" +
  "Username=$($configuration['POSTGRES_USER']);" +
  "Password=$($configuration['POSTGRES_PASSWORD'])"

Set-Location (Join-Path $projectRoot 'backend/Tbt360.Api')
dotnet run --launch-profile http
