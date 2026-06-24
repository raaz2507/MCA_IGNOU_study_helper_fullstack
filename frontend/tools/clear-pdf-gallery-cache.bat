@echo off
setlocal
cd /d "%~dp0\.."

echo Clearing central PDF preview cache...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$project = (Resolve-Path -LiteralPath '.').Path;" ^
  "$cache = Join-Path $project 'assets\images\pdf-gallery-cache';" ^
  "if (Test-Path -LiteralPath $cache) {" ^
  "  $resolved = (Resolve-Path -LiteralPath $cache).Path;" ^
  "  if ($resolved.StartsWith($project, [System.StringComparison]::OrdinalIgnoreCase)) {" ^
  "    Get-ChildItem -LiteralPath $resolved -Force | Remove-Item -Force -Recurse;" ^
  "  }" ^
  "};" ^
  "Write-Host 'Central PDF preview cache cleared.'"

if errorlevel 1 (
	echo.
	echo Cache cleanup failed.
	pause
	exit /b 1
)

echo.
echo Done. Run tools\update-pdf-gallery.bat to generate fresh previews.
pause
