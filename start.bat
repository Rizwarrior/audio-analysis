@echo off
echo 🎵 Percussion Analyzer + Demucs Integration
echo ==========================================
echo.

REM Check if setup has been run
if not exist "venv" (
    echo 🔧 First time setup required...
    echo Running setup.sh...
    echo.
    bash setup.sh
    
    if errorlevel 1 (
        echo ❌ Setup failed. Please check the errors above.
        pause
        exit /b 1
    )
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Start the application
echo 🚀 Starting the integrated application...
bash dev.sh