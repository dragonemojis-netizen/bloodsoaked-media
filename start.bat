@echo off
setlocal EnableExtensions
title Bloodsoaked Media

cd /d "%~dp0"

echo.
echo  ============================================
echo   Bloodsoaked Media - Launcher
echo  ============================================
echo.
echo   Project: %cd%
echo.
echo   1. Dev server       (http://localhost:3000)
echo   2. Production build
echo   3. Production start (run after build)
echo   4. Lint
echo   5. Exit
echo.

set /p "CHOICE=Select option [1-5]: "

if "%CHOICE%"=="1" goto dev
if "%CHOICE%"=="2" goto build
if "%CHOICE%"=="3" goto start
if "%CHOICE%"=="4" goto lint
if "%CHOICE%"=="5" goto end

echo Invalid choice.
pause
goto end

:dev
echo.
echo [Starting Next.js dev server...]
echo Open http://localhost:3000 in your browser.
echo Press Ctrl+C to stop.
echo.
call npm run dev
goto finish

:build
echo.
echo [Running production build...]
echo.
call npm run build
goto finish

:start
echo.
echo [Starting production server...]
echo Requires a successful build first. Open http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm run start
goto finish

:lint
echo.
echo [Running ESLint...]
echo.
call npm run lint
goto finish

:finish
echo.
if errorlevel 1 (
  echo *** Command failed with error code %errorlevel% ***
) else (
  echo Done.
)
echo.
pause

:end
endlocal
