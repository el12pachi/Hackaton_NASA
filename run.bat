@echo off
echo ========================================
echo   ASTEROID IMPACT SIMULATOR
echo   NASA Hackathon 2025
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Run the application
echo.
echo Starting server...
echo Open your browser at: http://localhost:5000
echo.
python app.py

pause


