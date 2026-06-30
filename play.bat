@echo off
title Call of Nature - Chrome Game Launcher
cls
echo =================================================================
echo   🌿 Call of Nature - Instant Chrome Web Game Launcher 🌿
echo =================================================================
echo.
echo [OK] Launching standalone HTML5 game directly in your browser...
echo.
echo You do NOT need Node.js or internet connection to play this game!
echo.

if exist "Call_of_Nature_Chrome_Game.html" (
    start "" "Call_of_Nature_Chrome_Game.html"
    exit
)

if exist "Double_Click_To_Play_Offline.html" (
    start "" "Double_Click_To_Play_Offline.html"
    exit
)

:: Fallback if developer wants to run local node dev server
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Game file not found and Node.js is not installed.
    echo Please double-click Call_of_Nature_Chrome_Game.html directly.
    pause
    exit /b
)

echo Starting local dev server...
start http://localhost:3000/
call npm run dev
pause

