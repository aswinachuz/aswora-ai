# Aswora AI — Android APK Build & Release Guide

This document describes the workflow for generating an installable Android APK (`com.aswora.ai`) using Capacitor and Gradle.

---

## 1. Current Environment Status & Prerequisites

### Build Environment Status:
- **Frontend Assets**: Fully compiled to production bundles (`client/dist`).
- **Capacitor Configuration**: Configured with `appId: com.aswora.ai`, app name `Aswora AI`, status bar and splash screen plugins.
- **Android Native Project**: Generated at `aswora-ai/android` and `aswora-ai/client/android`.
- **Host Tooling Check**:
  - `Node.js`: v24.19.0 (Installed)
  - `npm`: v11.17.0 (Installed)
  - `JDK / Java`: **Not found in system PATH**. (Required by Gradle to compile bytecode into APK).

### Prerequisites to Install:
1. **JDK 17 or 21**:
   - Download Eclipse Temurin or Oracle JDK 17+: [https://adoptium.net/](https://adoptium.net/)
   - Set environment variable:
     - `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.x`
     - Add `%JAVA_HOME%\bin` to system `PATH`.
2. **Android SDK / Android Studio** (Optional but recommended):
   - Install Android Studio: [https://developer.android.com/studio](https://developer.android.com/studio)
   - Ensure Android SDK Platform 34 or 35 and Build Tools are installed.

---

## 2. Fast Build Workflow

### Step 1 — Build Frontend Assets
In `aswora-ai/client`:
```bash
npm run build
```

### Step 2 — Synchronize with Android Project
```bash
npx cap sync android
```
*(This transfers the compiled assets from `client/dist` directly into `android/app/src/main/assets/public`).*

### Step 3 — Compile Debug APK using Gradle
Navigate to `aswora-ai/android` (or `aswora-ai/client/android`):

**On Windows (PowerShell / Command Prompt)**:
```powershell
.\gradlew.bat assembleDebug
```

**On macOS / Linux**:
```bash
./gradlew assembleDebug
```

Once Gradle finishes, the debug APK is generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 3. Installing & Testing the APK on a Physical Android Device

### Connect device with USB Debugging enabled:
1. On your Android phone, go to **Settings > About Phone > Tap "Build Number" 7 times** to unlock Developer Options.
2. In **Developer Options**, toggle **USB Debugging** ON.
3. Connect your phone via USB cable and allow the authorization prompt.

### Install via ADB:
```bash
adb devices
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Testing Checklist on Device:
- [ ] Splash screen displays Aswora AI logo smoothly on launch.
- [ ] Welcome/Onboarding screen renders responsively.
- [ ] User can register and sign in.
- [ ] Token is saved securely in native storage and survives app kill/restart.
- [ ] Streaming AI responses display with smooth typing animations.
- [ ] Code block copy button copies clean code to clipboard.
- [ ] Mobile keyboard pops up and resizes composer without hiding active chat.
- [ ] Network offline banner appears when switching to airplane mode and recovers when reconnected.

---

## 4. Producing a Signed Production Release APK

To distribute the APK to users or the Google Play Store, generate a cryptographically signed release APK:

### Step 1 — Generate a Release Keystore
Run in terminal:
```bash
keytool -genkey -v -keystore aswora-release.keystore -alias aswora-key -keyalg RSA -keysize 2048 -validity 10000
```
Store this keystore file safely and do not commit it to public git repositories.

### Step 2 — Configure Gradle Signing
In `android/app/build.gradle`:
```groovy
android {
    signingConfigs {
        release {
            storeFile file("aswora-release.keystore")
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias "aswora-key"
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3 — Compile Signed Release
```powershell
.\gradlew.bat assembleRelease
```
The output APK is generated at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 5. Connecting Android App to Production Backend

By default in development, the frontend calls the local server via loopback or proxy. For mobile distribution:
1. Deploy your server to HTTPS (e.g., `https://api.aswora.ai` or your Render URL).
2. Set `VITE_API_URL=https://api.aswora.ai/api` in `client/.env.production`.
3. Run `npm run build && npx cap sync android`.
4. Rebuild the APK.
