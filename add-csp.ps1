# PowerShell скрипт для добавления CSP во все HTML файлы

$csp = @'
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.steamstatic.com https://avatars.steamstatic.com https://ui-avatars.com; connect-src 'self' https://fearproject.ru https://reafsavers.vercel.app;">
'@

$securityUtils = @'
    <script src="js/SecurityUtils.js"></script>
'@

$htmlFiles = Get-ChildItem -Path . -Filter *.html

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    $content = Get-Content $file.FullName -Raw
    
    # Проверяем, есть ли уже CSP
    if ($content -notmatch "Content-Security-Policy") {
        # Добавляем CSP после <meta charset>
        $content = $content -replace '(<meta charset="UTF-8">)', "`$1`n$csp"
        Write-Host "  Added CSP to $($file.Name)"
    } else {
        Write-Host "  CSP already exists in $($file.Name)"
    }
    
    # Проверяем, подключен ли SecurityUtils
    if ($content -notmatch "SecurityUtils.js") {
        # Добавляем перед первым <script src=
        $content = $content -replace '(<script src=")', "$securityUtils`n    `$1"
        Write-Host "  Added SecurityUtils to $($file.Name)"
    } else {
        Write-Host "  SecurityUtils already in $($file.Name)"
    }
    
    # Сохраняем файл
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "`nDone! Processed $($htmlFiles.Count) HTML files."
