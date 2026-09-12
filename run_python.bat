@echo off
echo ========================================================
echo   Smart Pharmacy Inventory System - Windows Launcher
echo ========================================================
echo.

REM Move to the python_project directory
cd /d "%~dp0python_project"

REM Detect Python executable (try py first, then python)
set PYTHON_CMD=
where py >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set PYTHON_CMD=py
) else (
    where python >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        set PYTHON_CMD=python
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python is not installed or not added to your Windows PATH!
    echo.
    echo Please install Python from https://www.python.org/downloads/
    echo IMPORTANT: Make sure to check the box "Add python.exe to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo [OK] Found Python command: %PYTHON_CMD%
echo.

echo [1/3] Installing dependencies from requirements.txt...
%PYTHON_CMD% -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo [WARNING] pip encountered an issue. Retrying with --user...
    %PYTHON_CMD% -m pip install --user -r requirements.txt
)

echo.
echo [2/3] Seeding database with initial pharmacy records...
%PYTHON_CMD% seed_data.py

echo.
echo [3/3] Launching Streamlit Dashboard on localhost...
echo The browser will open automatically at http://localhost:8501
echo.
%PYTHON_CMD% -m streamlit run dashboard.py

pause
