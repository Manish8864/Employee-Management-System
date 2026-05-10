param([string]$file, [string]$search, [string]$replace)
$content = Get-Content $file -Raw
$content = $content.Replace($search, $replace)
Set-Content -Path $file -Value $content -NoNewline
Write-Host "Done"
