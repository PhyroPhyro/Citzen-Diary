@echo off
chcp 65001 >nul
title Citizen Diary - Boot
color 0A

echo.
echo ========================================
echo   Citizen Diary - Automatic Boot
echo ========================================
echo.

REM --- Check PostgreSQL ---
echo [1/3] Checking PostgreSQL...
set PGPASSWORD=382356
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] PostgreSQL is running
) else (
    echo   [!!] PostgreSQL not found or not running
    echo   [!!] Please start PostgreSQL manually via Windows Services
    echo   [!!] Or run: net start postgresql-x64-18
    pause
    exit /b 1
)

REM --- Check Database exists ---
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'citizen_diary';" | findstr "citizen_diary" >nul 2>&1
if %errorlevel% neq 0 (
    echo   [!!] Database 'citizen_diary' not found
    echo   [!!] Creating database...
    "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE citizen_diary;"
    echo   [OK] Database created
) else (
    echo   [OK] Database 'citizen_diary' exists
)

REM --- Check Redis via Docker ---
echo.
echo [2/3] Checking Redis...
docker ps --filter "name=citizen-diary-redis" --format "{{.Names}}" | findstr "citizen-diary-redis" >nul 2>&1
if %errorlevel% equ 0 (
    echo   [OK] Redis container is running
) else (
    echo   [!!] Redis container not running
    docker ps -a --filter "name=citizen-diary-redis" --format "{{.Names}}" | findstr "citizen-diary-redis" >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [..] Starting existing container...
        docker start citizen-diary-redis
    ) else (
        echo   [..] Creating new container...
        docker run -d --name citizen-diary-redis -p 6379:6379 redis
    )
    timeout /t 3 /nobreak >nul
    echo   [OK] Redis is running
)

REM --- Verify Redis connection ---
node -e "const Redis=require('ioredis');const r=new Redis('redis://localhost:6379',{maxRetriesPerRequest:1,connectTimeout:3000});r.ping().then(res=>{console.log('  [OK] Redis PONG:',res);r.disconnect();process.exit(0);}).catch(err=>{console.error('  [!!] Redis error:',err.message);r.disconnect();process.exit(1);});" >nul 2>&1
if %errorlevel% neq 0 (
    echo   [!!] Redis connection failed. Waiting 5 more seconds...
    timeout /t 5 /nobreak >nul
)

REM --- Start Server ---
echo.
echo [3/3] Starting Citizen Diary server...
echo.
echo ========================================
echo   Server will open in a new window
echo   Press Ctrl+C in that window to stop
echo ========================================
echo.

start "Citizen Diary Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo [OK] Boot complete!
echo.
echo   Frontend: http://localhost:3000
echo   Admin:    http://localhost:3000/admin.html
echo   Health:   http://localhost:3000/health
echo.
echo Press any key to close this window...
pause >nul
