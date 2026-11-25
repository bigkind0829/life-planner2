@echo off
cd /d "%~dp0"
echo Starting Life Planner Local Dashboard on http://127.0.0.1:4310 ...
start "" http://127.0.0.1:4310
node server.js
