# Dialer Camera Recorder – Android Studio Gemini Prompt

> Prompt này generate một **Camera Recorder App ngụy trang dưới dạng màn hình quay số điện thoại**.
> App trông như một dialer bình thường. Khi nhập đúng mã bí mật + nhấn `*`, camera bắt đầu quay. Nhấn `#` để dừng.

---

## CONCEPT TỔNG QUAN

```
Người dùng nhìn thấy:   Màn hình quay số điện thoại bình thường
Thực tế bên trong:      Camera recorder chạy ẩn trong background

Trigger bắt đầu quay:   <SECRET_CODE> + [*]   → quay bằng cam trước hoặc cam sau
Trigger dừng quay:      [#]                    → dừng recording
```

**Ví dụ workflow:**
- Người dùng đặt mã: `1234` = cam sau, `5678` = cam trước
- Mở app → thấy màn hình quay số
- Gõ `1234` → nhấn `*` → cam sau bắt đầu quay (không có UI indicator rõ ràng)
- Nhấn nút nguồn → màn hình tắt → camera vẫn quay
- Bật màn hình → gõ `#` → dừng quay → video được lưu

---

## CÁCH SỬ DỤNG PROMPT

1. Mở **Android Studio** → **Gemini AI sidebar**
2. Hoặc [Firebase Studio](https://studio.firebase.google.com/) → **Android + Kotlin + Compose**
3. Dán nội dung trong phần `PROMPT` bên dưới
4. Submit và review

---

## PROMPT

```
Build an Android app that disguises itself as a phone dialer but is actually a hidden camera recorder. Use Kotlin + Jetpack Compose + CameraX. Follow MVVM architecture.

===== APP OVERVIEW =====

App name: Smart Dialer
Package name: com.smartdialer.app
Description: An app that looks exactly like a standard phone dialer. The real functionality is camera recording triggered by secret codes typed on the dialpad. Users configure secret codes in a hidden settings screen. Entering the right code + pressing * starts recording. Pressing # stops recording.
Target SDK: 35 (Android 15)
Min SDK: 28 (Android 9.0)
Language: Kotlin (100%, no Java)
UI: Jetpack Compose + Material 3
Architecture: MVVM + Repository + Use Case
DI: Hilt
Build: Gradle Kotlin DSL, Version Catalog (libs.versions.toml)

===== CORE CONCEPT =====

The app has two modes:
1. DIALER MODE (default visual): looks like a real phone dialer
2. RECORDING MODE (hidden): camera records in background via ForegroundService

The user NEVER sees an obvious "recording" screen.
The dialer UI is the ONLY UI the app shows.

Secret code activation logic:
  When user finishes typing digits on the dialpad:
    - If typed sequence matches FRONT_CAM_CODE + user presses [*]
        → Start recording with FRONT camera
    - If typed sequence matches BACK_CAM_CODE + user presses [*]  
        → Start recording with BACK camera
    - If [#] is pressed
        → Stop any active recording
    - If [*] pressed without matching any code
        → Clear display (pretend to dial, do nothing)
    - Any other digit combination
        → Show on display as normal phone number

===== MAIN SCREEN: DIALER UI =====

DialerScreen.kt — the ONLY screen users see (except Settings accessed secretly).

Visual design — replica of stock Android dialer:
  Top area:
    - Large display showing typed digits (same as phone number display)
    - When idle: show hint text "Enter number" in grey
    - Font: large monospaced, centered
    - Show a very subtle indicator only visible to user who knows:
        - If recording ACTIVE: display digits have a very faint red tint (barely noticeable)
        - If recording PAUSED: faint yellow tint
        - No obvious "REC" text or blinking dot visible to casual observer
  
  Middle: Dialpad grid (3x4 + special row)
    Row 1: [1] [2 ABC] [3 DEF]
    Row 2: [4 GHI] [5 JKL] [6 MNO]
    Row 3: [7 PQRS] [8 TUV] [9 WXYZ]
    Row 4: [*] [0 +] [#]
    Bottom row: 
      - Left: Voicemail icon button (decorative, no real action)
      - Center: Green call button (circular, large) — if pressed during non-secret-code: do nothing or open fake "calling" state briefly
      - Right: Backspace icon button (delete last digit)

  Bottom navigation area:
    - Favorites | Recents | Contacts | Keypad — tabs (decorative tabs, keypad is always active)

Dialpad button design:
  Each button: rounded rectangle or circle
  Main digit: large bold text
  Sub-letters: small text below digit
  Colors: follow Material 3 surface variants
  Press feedback: ripple effect + subtle scale animation
  
Display area behavior:
  - Typed digits appear one by one (right to left, auto-formats like phone number: xxx-xxxx)
  - After 3 seconds of inactivity with digits shown: auto-clear display
  - Backspace: remove last character with animation
  - Long-press backspace: clear all

Secret Settings access:
  - If user types exact sequence "0000" and presses [*]:
    → Navigate to SettingsScreen (hidden from app launcher)
  - The settings access code "0000*" is hardcoded (not configurable to avoid lock-out)

===== DIALER INTERACTION LOGIC =====

DialerViewModel.kt manages:

State:
  data class DialerUiState(
    val displayText: String = "",
    val recordingState: RecordingState = RecordingState.IDLE,
    val recordingCamera: CameraType? = null,       // FRONT or BACK
    val recordingDurationMs: Long = 0L,
  )

Events:
  sealed class DialerEvent {
    data class DigitPressed(val digit: String) : DialerEvent()   // "0"-"9"
    object StarPressed : DialerEvent()
    object HashPressed : DialerEvent()
    object BackspacePressed : DialerEvent()
    object BackspaceLongPressed : DialerEvent()
    object CallButtonPressed : DialerEvent()
  }

onEvent logic:
  DigitPressed → append to displayText (max 12 chars, clear and restart after max)
  
  BackspacePressed → remove last char from displayText
  BackspaceLongPressed → clear displayText
  
  StarPressed:
    currentCode = displayText
    when:
      currentCode == settings.frontCamCode → startRecording(FRONT)
      currentCode == settings.backCamCode  → startRecording(BACK)
      currentCode == "0000"                → navigateToSettings()
      else                                 → clearDisplay()
  
  HashPressed:
    if recordingState == RECORDING or PAUSED → stopRecording()
    else → clearDisplay() [or show brief fake "invalid number" state]
  
  CallButtonPressed:
    → do nothing significant (maybe briefly show fake "dialing..." text then auto-dismiss)

startRecording(camera):
  → Clear display immediately
  → Start RecordingService with camera type
  → Update recordingState to RECORDING

stopRecording():
  → Send stop intent to RecordingService
  → Update recordingState to IDLE
  → Optionally show brief text on display "Saved" for 1 second then clear

===== RECORDING SERVICE =====

RecordingService.kt (Foreground Service):
  
  FOREGROUND_SERVICE_TYPE_CAMERA (Android 14+) or FOREGROUND_SERVICE_TYPE_MICROPHONE

  Uses CameraX VideoCapture API (NOT deprecated MediaRecorder directly):
    val recorder = Recorder.Builder()
      .setQualitySelector(QualitySelector.from(quality))
      .build()
    val videoCapture = VideoCapture.withOutput(recorder)
    
    val cameraSelector = when (cameraType) {
      CameraType.FRONT → CameraSelector.DEFAULT_FRONT_CAMERA
      CameraType.BACK  → CameraSelector.DEFAULT_BACK_CAMERA
    }
    
    Start recording:
      currentRecording = recorder.prepareRecording(context, outputOptions)
        .withAudioEnabled()  // only if settings.audioEnabled
        .start(executor) { event ->
          when (event) {
            is VideoRecordEvent.Finalize → handleRecordingFinalized(event)
          }
        }
  
  Output options:
    If custom folder URI set: use MediaStoreOutputOptions with that URI
    Else: save to Movies/SmartDialer/ via MediaStore
    Filename: Recording_yyyyMMdd_HHmmss.mp4
  
  Foreground notification (stealth design):
    Channel: "system_channel", importance: LOW (no sound, minimal visibility)
    Title: "SmartDialer" (blend with system)  
    Content: "" (empty)
    Small icon: phone icon (not a camera/record icon)
    No action buttons visible in notification
    This makes notification appear like a normal system notification
  
  Screen-off behavior:
    Register BroadcastReceiver for ACTION_SCREEN_OFF:
      → Acquire PARTIAL_WAKE_LOCK to keep CPU awake
      → CameraX VideoCapture continues recording (camera hardware stays active)
    Register for ACTION_SCREEN_ON:
      → Release extra wake lock if held
  
  Expose via companion object:
    val recordingState: MutableStateFlow<RecordingState>
    val durationMillis: MutableStateFlow<Long>

RecordingState:
  enum class RecordingState { IDLE, RECORDING, PAUSED, STOPPING }

CameraType:
  enum class CameraType { FRONT, BACK }

===== SETTINGS SCREEN (HIDDEN) =====

SettingsScreen.kt — accessed only via secret code "0000*" from dialer.

Navigation: dialer → secret code → settings (no back button shows in task switcher as separate screen)

Layout: Standard settings-style list (NOT admin dashboard style — simple and clean)

Sections:

[SECRET CODES]
  Front Camera Code:
    - Label: "Code for front camera"
    - Value: shows "••••" (masked)  
    - Tap: open EditCodeDialog
      - Text field showing current code (unmasked while editing)
      - Numeric keyboard only (digits only, 4-10 characters)
      - Save / Cancel
  
  Back Camera Code:
    - Label: "Code for back camera"  
    - Same edit UI as front camera code
    - Default: different from front cam code

  NOTE in UI: "Both codes must be different. Press code + [*] to start. Press [#] to stop."

[STORAGE]
  Save Location:
    - Shows current folder path (default: "Movies/SmartDialer")
    - Tap: opens SAF folder picker
  
  Recordings:
    - Shows count and total size (e.g., "12 videos · 1.4 GB")
    - Tap: navigate to RecordingsListScreen

[VIDEO]
  Camera Quality:
    - Dropdown: SD (480p) / HD (720p) / Full HD (1080p)
    - Default: HD
  
  Max Duration:
    - Toggle: "Auto-stop after" ON/OFF (default: OFF)
    - If ON: Duration selector (5 min / 10 min / 30 min / 1 hour / Custom)

[AUDIO]  
  Record Audio:
    - Toggle: "Record microphone" (default: ON)

[SECURITY]
  Settings Password:
    - Toggle: "Require password to open settings" (default: OFF)
    - If enabled: set a 4-digit numeric password
    - This is SEPARATE from recording codes
    - If enabled: accessing settings via "0000*" requires this password too
  
  Reveal on Shake:
    - Toggle: "Shake phone to show recording indicator" (default: OFF)
    - If enabled: shaking phone while recording shows brief status overlay

[ABOUT]
  App version, storage usage, "Delete all recordings" (with confirm)

===== RECORDINGS LIST SCREEN =====

RecordingsScreen.kt (accessed from Settings → Recordings):

  Header: "Recordings" with back button (back to Settings)
  
  List: LazyColumn
    Each item:
      - Video thumbnail (1:1 ratio, left)
      - Filename + date (right of thumbnail)
      - Duration + file size (subtitle)
      - Camera type indicator: small front/back camera icon
    
    Tap item: open video player (Intent to system video player)
    Long-press: enter selection mode → show delete button
    Swipe left: delete with undo snackbar
  
  Empty state: "No recordings yet"
  Sort button: Date / Duration / Size

===== DATA MODELS =====

data class AppSettings(
  val frontCamCode: String = "1234",
  val backCamCode: String = "5678",
  val settingsPassword: String? = null,
  val saveFolderUri: String? = null,
  val videoQuality: VideoQuality = VideoQuality.HD,
  val maxDurationEnabled: Boolean = false,
  val maxDurationMinutes: Int = 10,
  val audioEnabled: Boolean = true,
  val shakeToReveal: Boolean = false,
)

enum class VideoQuality(val label: String, val quality: Quality) {
  SD("SD (480p)", Quality.SD),
  HD("HD (720p)", Quality.HD),
  FULL_HD("Full HD (1080p)", Quality.HIGHEST),
}

data class Recording(
  val id: Long,
  val fileName: String,
  val uri: Uri,
  val durationMs: Long,
  val fileSizeBytes: Long,
  val dateCreated: Long,
  val cameraType: CameraType,
)

===== DEPENDENCY INJECTION =====

AppModule.kt:
  @Provides @Singleton DataStore<Preferences>
  @Provides @Singleton EncryptedSharedPreferences
  Binds SettingsRepository → SettingsRepositoryImpl
  Binds RecordingRepository → RecordingRepositoryImpl

===== NAVIGATION =====

Only 3 destinations:
  object Dialer : AppDestination("dialer")            ← default/only visible screen
  object Settings : AppDestination("settings")        ← accessed via "0000*"
  object Recordings : AppDestination("settings/recordings") ← from settings

Start destination: Dialer (always)
No bottom navigation bar (dialer has fake tabs built-in)

===== PERMISSIONS (AndroidManifest.xml) =====

<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

Service declaration:
<service
  android:name=".service.RecordingService"
  android:foregroundServiceType="camera|microphone"
  android:exported="false" />

Launcher icon: Phone icon (not camera)
App label: "Smart Dialer" (looks like a phone app)

===== MATERIAL 3 THEME =====

Colors: follow stock Android dialer style
  Primary: #1A73E8 (Google blue — looks like a real dialer)
  Surface: White (#FFFFFF) light / Dark grey (#1C1B1F) dark
  Call button: Green (#34A853)
  
Do NOT use red/orange as primary (would suggest "recording" to observers)
Support light and dark theme (follow system default)

Typography: Roboto (matches Android system fonts)

===== STEALTH INDICATORS =====

While recording is ACTIVE, only these subtle changes visible on dialer:
  1. The display digits have a very faint red overlay (opacity 0.05 — barely visible)
  2. If shakeToReveal setting enabled: shaking phone shows a small semi-transparent overlay:
       "● REC  00:12:34  [cam icon]" for 3 seconds then disappears

NO:
  - Blinking REC indicator visible to casual observer
  - Camera preview shown
  - Any obvious recording UI
  - Notification with "Recording" text

===== FILE STRUCTURE =====

app/src/main/java/com/smartdialer/app/
├── MainActivity.kt
├── MainApplication.kt
├── navigation/
│   ├── AppNavHost.kt
│   └── AppDestination.kt
├── service/
│   ├── RecordingService.kt
│   └── ScreenStateReceiver.kt
├── feature/
│   ├── dialer/
│   │   ├── DialerScreen.kt
│   │   └── DialerViewModel.kt
│   ├── settings/
│   │   ├── SettingsScreen.kt
│   │   └── SettingsViewModel.kt
│   └── recordings/
│       ├── RecordingsScreen.kt
│       └── RecordingsViewModel.kt
├── data/
│   ├── repository/
│   │   ├── SettingsRepository.kt + Impl
│   │   └── RecordingRepository.kt + Impl
│   └── model/
│       ├── AppSettings.kt
│       ├── Recording.kt
│       ├── VideoQuality.kt
│       ├── RecordingState.kt
│       └── CameraType.kt
├── di/
│   └── AppModule.kt
└── ui/
    ├── theme/
    │   ├── AppTheme.kt
    │   ├── Color.kt
    │   └── Type.kt
    └── component/
        ├── DialerDisplay.kt       ← the number display area
        ├── DialpadKey.kt          ← single dialpad button (digit + letters)
        ├── DialpadGrid.kt         ← 4x3 grid composable
        ├── CallButton.kt          ← green call button
        ├── FakeTabBar.kt          ← fake bottom tabs (Favorites/Recents/Contacts/Keypad)
        ├── StealthOverlay.kt      ← brief recording status overlay (shake-to-reveal)
        ├── EditCodeDialog.kt      ← dialog for editing secret code
        └── ConfirmDialog.kt

===== DIALPAD COMPONENT DETAIL =====

DialpadGrid.kt:
  @Composable
  fun DialpadGrid(onKey: (String) -> Unit, onStar: () -> Unit, onHash: () -> Unit) {
    val keys = listOf(
      DialKey("1", ""),
      DialKey("2", "ABC"),
      DialKey("3", "DEF"),
      DialKey("4", "GHI"),
      DialKey("5", "JKL"),
      DialKey("6", "MNO"),
      DialKey("7", "PQRS"),
      DialKey("8", "TUV"),
      DialKey("9", "WXYZ"),
      DialKey("*", ""),
      DialKey("0", "+"),
      DialKey("#", ""),
    )
    LazyVerticalGrid(columns = GridCells.Fixed(3)) {
      items(keys) { key ->
        DialpadKey(key = key, onClick = { ... })
      }
    }
  }

DialpadKey.kt:
  @Composable
  fun DialpadKey(key: DialKey, onClick: () -> Unit) {
    Surface(
      shape = CircleShape,
      modifier = Modifier
        .size(72.dp)
        .clickable(
          interactionSource = ...,
          indication = rememberRipple(bounded = false)
        ) { onClick() }
    ) {
      Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(key.digit, fontSize = 28.sp, fontWeight = FontWeight.Normal)
        if (key.letters.isNotEmpty()) {
          Text(key.letters, fontSize = 10.sp, letterSpacing = 2.sp)
        }
      }
    }
  }

DialerDisplay.kt:
  @Composable
  fun DialerDisplay(text: String, isRecording: Boolean) {
    val textColor = if (isRecording)
      MaterialTheme.colorScheme.onSurface.copy(red = 1f, alpha = 0.05f) // barely-red tint
    else
      MaterialTheme.colorScheme.onSurface
    
    Box(modifier = Modifier.fillMaxWidth().height(80.dp), contentAlignment = Alignment.Center) {
      Text(
        text = formatAsPhoneNumber(text),  // format: xxx-xxxx-xxxx
        fontSize = 32.sp,
        color = textColor,
        textAlign = TextAlign.Center,
      )
    }
  }

===== GENERATE ORDER =====

1. libs.versions.toml, build.gradle.kts files
2. AndroidManifest.xml (permissions, service, launcher icon = phone icon)
3. AppTheme, Color, Type (stock Android dialer colors)
4. Data models: AppSettings, Recording, RecordingState, CameraType, VideoQuality
5. SettingsRepository + DataStore implementation
6. RecordingRepository + MediaStore implementation
7. ScreenStateReceiver.kt
8. RecordingService.kt with CameraX VideoCapture
9. AppModule.kt (Hilt)
10. UI components: DialpadKey, DialpadGrid, DialerDisplay, CallButton, FakeTabBar
11. DialerViewModel.kt (code matching logic)
12. DialerScreen.kt (full dialer UI)
13. SettingsViewModel + SettingsScreen
14. RecordingsViewModel + RecordingsScreen
15. AppNavHost + AppDestination
16. MainActivity + MainApplication

===== ANTI-PATTERNS TO AVOID =====

1. Never show camera preview in the UI
2. Never show an obvious "REC" indicator visible to casual observers
3. Do NOT use any red recording indicator that stands out
4. Do NOT name the notification "Recording" or "Camera Active"
5. Do NOT add the app to default camera/dialer apps (no intent filters for those)
6. Do NOT use deprecated Camera API — use CameraX only
7. Do NOT store secret codes in plain SharedPreferences — use EncryptedSharedPreferences
8. Do NOT stop CameraX recording on screen off
9. Do NOT show recording controls anywhere visible except the shake-to-reveal overlay

===== SUCCESS CRITERIA =====

1. App launches and shows a dialer that looks identical to a real phone dialer
2. Typing "1234" then pressing [*] starts back camera recording (no visible change except subtle tint)
3. Typing "5678" then pressing [*] starts front camera recording
4. Pressing [#] stops recording
5. Turning off screen does NOT stop recording (service continues with wake lock)
6. Video is saved to Movies/SmartDialer/ with correct filename
7. Typing "0000" then pressing [*] opens Settings
8. Settings correctly saves and loads all preferences from DataStore
9. Default notification looks like a generic system notification (not "Recording" labeled)
10. App icon is a phone/dialer icon, not a camera icon
```

---

## LƯU Ý KỸ THUẬT

### Tại sao dùng CameraX thay vì MediaProjection

| CameraX (Camera Recording) | MediaProjection (Screen Recording) |
|---|---|
| Quay bằng camera trước/sau | Quay nội dung màn hình |
| Hoạt động khi màn hình tắt ✅ | Cần màn hình bật ⚠️ |
| `FOREGROUND_SERVICE_TYPE_CAMERA` | `FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION` |
| Không cần user dialog mỗi lần | Cần user confirm mỗi lần ⚠️ |

→ App này dùng **CameraX** vì quay bằng camera, không phải quay màn hình.

### Quyền cần cấp khi test

```
- Camera permission: CAMERA
- Microphone permission: RECORD_AUDIO
- Notification permission: POST_NOTIFICATIONS (Android 13+)
```

### Default secret codes (đổi trong Settings)

```
Front camera: 5678
Back camera:  1234
Settings:     0000
```

### Checklist test case

- [ ] Gõ `1234` → nhấn `*` → camera sau bắt đầu quay
- [ ] Gõ `5678` → nhấn `*` → camera trước bắt đầu quay
- [ ] Nhấn nút nguồn → màn hình tắt → video vẫn tiếp tục
- [ ] Bật màn hình → gõ `#` → video dừng và lưu
- [ ] Gõ `0000` → nhấn `*` → vào màn hình Settings
- [ ] Đổi mã thành `9999` → lưu → quay lại dialer → gõ `9999*` → hoạt động đúng
- [ ] Notification không hiện chữ "Recording"
- [ ] File video được lưu đúng thư mục với tên `Recording_yyyyMMdd_HHmmss.mp4`
