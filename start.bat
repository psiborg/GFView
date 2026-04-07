@echo off
echo Starting GFView...
start "" http://localhost:8084
python -m http.server 8084
