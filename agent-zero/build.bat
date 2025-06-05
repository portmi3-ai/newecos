@echo off
echo Building Sasha...

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

REM Create icon
echo Creating icon...
python create_icon.py

REM Build executable
echo Building executable...
python build_exe.py

echo Build complete!
pause 