@echo off
start cmd /k "node server.js"
timeout /t 5 /nobreak >nul
start http://localhost:3000 