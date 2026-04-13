@echo off
echo ===================================================
echo Starting JobNova Backend and Frontend Servers...
echo ===================================================

echo [1/2] Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "JobNova Backend" cmd /k "npm run dev"

echo [2/2] Starting Frontend Server (React - Port 3000)...
cd /d "%~dp0frontend"
start "JobNova Frontend" cmd /k "npm start"

echo.
echo ===================================================
echo DONE! Two new command prompt windows have opened.
echo Keep those windows open while you are working.
echo ===================================================
pause
