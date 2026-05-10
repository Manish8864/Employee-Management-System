param([string]$file)
$search = Get-Content 'button_search.txt' -Raw
$replace = Get-Content 'button_replace.txt' -Raw
$content = Get-Content $file -Raw
$content = $content.Replace($search, $replace)
Set-Content -Path $file -Value $content -NoNewline
Write-Host "Done"
