param([string]$file)
$search = Get-Content 'search_after.txt' -Raw
$replace = Get-Content 'replace_after.txt' -Raw
$content = Get-Content $file -Raw
$content = $content.Replace($search, $replace)
Set-Content -Path $file -Value $content -NoNewline
Write-Host "Done"
