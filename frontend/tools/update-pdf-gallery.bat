@echo off
setlocal
cd /d "%~dp0\.."

set "PYTHON_CMD=python"
set "BUNDLED_PYTHON=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED_PYTHON%" set "PYTHON_CMD=%BUNDLED_PYTHON%"

"%PYTHON_CMD%" -c "import pypdfium2, PIL" >nul 2>&1
if errorlevel 1 (
	echo Preparing PDF preview tools. This is needed only the first time...
	"%PYTHON_CMD%" -m pip install pypdfium2 Pillow
	if errorlevel 1 (
		echo.
		echo Could not install the PDF preview tools.
		pause
		exit /b 1
	)
)

echo Updating automatic semester and subject cards...
"%PYTHON_CMD%" "tools\generate-resource-catalog.py"

if errorlevel 1 (
	echo.
	echo Resource catalog update failed.
	pause
	exit /b 1
)

echo.
echo Done. Semester, subject and PDF cards are up to date.
pause
