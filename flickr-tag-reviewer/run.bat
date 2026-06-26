@echo off
REM Convenience launcher for Windows (Command Prompt). Creates a venv, installs
REM deps, imports a suggestions file if one is passed, and starts the web app at
REM http://127.0.0.1:5057
REM Usage:  run.bat  [path\to\gallery-face-tag-suggestions.txt]
setlocal
cd /d "%~dp0"

REM Pick a Python launcher: prefer the "py" launcher, fall back to "python".
set "PY=python"
where py >nul 2>nul && set "PY=py -3"

if not exist ".venv\Scripts\python.exe" (
  echo Creating virtual environment...
  %PY% -m venv .venv
  if errorlevel 1 (
    echo Failed to create venv. Is Python 3 installed and on PATH?
    exit /b 1
  )
)

call ".venv\Scripts\activate.bat"
python -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo Failed to install dependencies.
  exit /b 1
)

if not "%~1"=="" (
  python scripts\import_suggestions.py "%~1"
)

python scripts\make_sample_image.py >nul 2>nul

if "%PORT%"=="" set "PORT=5057"
echo Starting reviewer at http://127.0.0.1:%PORT%
python -m reviewer.app
