@echo off
echo ========================================================
echo   Smart Pharmacy Inventory System - Streamlit Launcher
echo ========================================================
echo.

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
    echo Download Python from https://www.python.org/downloads/
    echo IMPORTANT: Make sure to check "Add python.exe to PATH"
    pause
    exit /b 1
)

echo [1/3] Installing requirements...
%PYTHON_CMD% -m pip install -r requirements.txt

echo [2/3] Seeding database...
%PYTHON_CMD% seed_data.py

echo [3/3] Starting Streamlit on localhost...
%PYTHON_CMD% -m streamlit run dashboard.py

pause
