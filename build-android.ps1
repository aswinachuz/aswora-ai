# ===============================================
# Aswora AI — Android APK Automated Build Script
# ===============================================

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "⚡ Aswora AI — Building Android APK" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Step 1: Check if JAVA_HOME is configured
if (-not $env:JAVA_HOME) {
    Write-Host "⚠️ Warning: JAVA_HOME is not set in your environment." -ForegroundColor Yellow
    Write-Host "Please install JDK 17 or 21 (e.g. from https://adoptium.net) and set JAVA_HOME before running Gradle." -ForegroundColor Yellow
}

# Step 2: Build Client
Write-Host "`n📦 Step 1/3: Compiling React Frontend Production Bundle..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\client"
npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed." -ForegroundColor Red
    exit 1
}

# Step 3: Capacitor Sync
Write-Host "`n🔄 Step 2/3: Synchronizing Capacitor Android Assets..." -ForegroundColor Green
npx.cmd cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed." -ForegroundColor Red
    exit 1
}

# Step 4: Run Gradle
Write-Host "`n🔨 Step 3/3: Running Gradle to assemble Debug APK..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\android"

if ($env:JAVA_HOME) {
    cmd.exe /c gradlew.bat assembleDebug
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 SUCCESS! APK built at: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Gradle build encountered an error. See output above." -ForegroundColor Red
    }
} else {
    Write-Host "`nℹ️ Android project is fully synced and ready at '$PSScriptRoot\android'." -ForegroundColor Cyan
    Write-Host "Once JDK 17+ is installed, run '.\gradlew.bat assembleDebug' in the android folder to generate 'app-debug.apk'." -ForegroundColor Cyan
}

Set-Location -Path $PSScriptRoot
