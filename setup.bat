@echo off
echo Setting up Percussion Analyzer...

REM Check for Python 3.8
python --version 2>nul | findstr "3.8" >nul
if %errorlevel% == 0 (
    set PYTHON_CMD=python
    echo Using Python 3.8.x
) else (
    py -3.8 --version 2>nul | findstr "3.8" >nul
    if %errorlevel% == 0 (
        set PYTHON_CMD=py -3.8
        echo Using py -3.8
    ) else (
        echo Warning: Python 3.8.x not found. Using default Python.
        echo The specified TensorFlow versions work best with Python 3.8.10
        set PYTHON_CMD=python
    )
)

REM Create necessary directories
if not exist "models" mkdir models
if not exist "audio_samples" mkdir audio_samples
if not exist "output" mkdir output

REM Setup Python virtual environment with specific Python version
echo Creating Python virtual environment with %PYTHON_CMD%...
if not exist "venv" (
    %PYTHON_CMD% -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

REM Activate virtual environment and install dependencies
echo Installing Python dependencies...
call venv\Scripts\activate.bat

REM Verify Python version in venv
python --version

pip install --upgrade pip

REM Install the known-good combo for Magenta onsets/frames
echo Installing TensorFlow and Magenta dependencies...
pip install tensorflow==2.11.1 tensorflow-estimator==2.11.0 tensorboard==2.11.2 keras==2.11.0 protobuf==3.19.6 tensorflow-probability==0.19.0 tf_slim==1.1.0 note-seq==0.0.3

REM Install other requirements
echo Installing remaining dependencies...
pip install -r backend\requirements.txt
echo Python dependencies installed.

REM Install Node.js dependencies
echo Installing Node.js dependencies...
npm install

REM Download pre-trained model if it doesn't exist
if not exist "models\train" (
    echo Downloading pre-trained Magenta model...
    cd models
    curl -L -o maestro_checkpoint.zip https://storage.googleapis.com/magentadata/models/onsets_frames_transcription/maestro_checkpoint.zip
    tar -xf maestro_checkpoint.zip
    del maestro_checkpoint.zip
    cd ..
)

echo.
echo Setup complete!
echo.
echo To start the application:
echo 1. For Docker: docker-compose up --build
echo 2. For local development: dev.bat
echo 3. Open http://localhost:3000 in your browser
echo.
echo The backend API will be available at http://localhost:8000
pause