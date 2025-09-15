@echo off
echo Starting development servers...

REM Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Start backend in background
echo Starting backend server...
cd backend
start /b python main.py
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend server...
start /b npm run dev

echo.
echo Development servers started:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:8000
echo.
echo Press any key to stop servers and exit...
pause >nul

REM Kill processes (basic cleanup)
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1