@echo off
REM 8 GATES - MERU: opens FOXGATE8-FRESH in your browser with sound.
REM Needs Python (python.org) OR Node (nodejs.org). Close this window to stop.
cd /d "%~dp0"
set PORT=8088
where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/FOXGATE8-FRESH.dc.html"
  python -m http.server %PORT%
  goto :eof
)
where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/FOXGATE8-FRESH.dc.html"
  py -m http.server %PORT%
  goto :eof
)
where npx >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:%PORT%/FOXGATE8-FRESH.dc.html"
  npx --yes http-server -p %PORT% -c-1
  goto :eof
)
echo.
echo Python or Node is needed to run the game locally.
echo Install Python from https://www.python.org/downloads/ (tick "Add to PATH"), then double-click this file again.
pause
