@echo off
REM === Build and Run Local Docker Container for Static Site ===

REM Stop and remove any previous container
FOR /F "tokens=1" %%i IN ('docker ps -aq -f name=mport-media-site-local') DO docker stop %%i & docker rm %%i

REM Build the Docker image

echo Building Docker image...
docker build -t mport-media-site:local .
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker build failed.
    pause
    exit /b 1
)

echo Running Docker container on http://localhost:8080 ...
docker run -d --name mport-media-site-local -p 8080:80 mport-media-site:local
if %ERRORLEVEL% neq 0 (
    echo ERROR: Docker run failed. Is Docker Desktop running?
    pause
    exit /b 1
)

echo.
echo Your site is now running locally at: http://localhost:8080
start http://localhost:8080
pause 