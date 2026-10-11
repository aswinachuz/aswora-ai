@echo off
echo ===============================================
echo   Aswora AI -- Android APK Automated Build
echo ===============================================

echo.
echo Step 1/3: Compiling React Frontend...
cd client
call npm.cmd run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2/3: Synchronizing Capacitor Android...
call npx.cmd cap sync android
if %errorlevel% neq 0 (
    echo [ERROR] Capacitor sync failed.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 3/3: Building Android APK with Gradle...
cd ..\android
if defined JAVA_HOME (
    call gradlew.bat assembleDebug
    echo.
    echo [SUCCESS] APK generated at android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo [NOTICE] JAVA_HOME is not set on this machine.
    echo Please install JDK 17+ and run gradlew.bat assembleDebug in android\ to generate the APK.
)

cd ..
pause
