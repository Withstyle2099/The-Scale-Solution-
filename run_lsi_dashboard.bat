@echo off
REM LSI Predictive Model - Streamlit Web Interface Runner
REM This script launches the interactive dashboard

echo.
echo ========================================
echo LSI Predictive AI Model Dashboard
echo ========================================
echo.
echo Starting Streamlit application...
echo This will open your default web browser to http://localhost:8501
echo.

cd /d "%~dp0"
python -m streamlit run lsi_streamlit_app.py

pause
