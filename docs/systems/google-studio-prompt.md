# Android Studio Gemini – App Generation Prompt

> Đây là prompt đầy đủ để dùng với **Android Studio + Gemini AI** (hoặc Gemini CLI / Firebase Genkit) nhằm generate một Android Admin Dashboard App theo kiến trúc chuẩn.
>
> Kiến trúc này được thiết kế theo hướng modular, domain-driven, có cấu trúc rõ ràng để mở rộng lâu dài.

---

## CÁCH SỬ DỤNG

### Cách 1 — Android Studio Gemini AI
1. Mở **Android Studio** (Meerkat trở lên)
2. Mở **Gemini AI sidebar** (icon Gemini góc phải hoặc `View > Tool Windows > Gemini`)
3. Chọn **"Generate"** hoặc gõ vào chat
4. Dán toàn bộ nội dung trong phần `PROMPT` bên dưới
5. Điền thông tin vào các `[PLACEHOLDER]` trước khi submit

### Cách 2 — Firebase Studio (Project IDX)
1. Mở [Firebase Studio](https://studio.firebase.google.com/)
2. Chọn **Android** → **Kotlin + Compose**
3. Dán prompt vào phần mô tả app
4. Chọn **"Build with AI"**

---

## PROMPT

```
Build an Android Admin Dashboard app with the following strict architecture. Do not deviate from this structure.

===== APP OVERVIEW =====

App name: [YOUR_APP_NAME]
Package name: [com.yourcompany.yourapp]
Description: [YOUR_APP_DESCRIPTION]
Backend API: [YOUR_BACKEND_API_URL] (REST, external server, JWT auth)
Target SDK: 35 (Android 15)
Min SDK: 26 (Android 8.0)
Domain features: [LIST YOUR FEATURES, e.g. "users, products, orders, reports, settings"]

===== TECHNOLOGY STACK (MANDATORY) =====

Language: Kotlin (100%, no Java)
UI: Jetpack Compose (no XML layouts)
Architecture: MVVM + Clean Architecture (3 layers: data, domain, presentation)
Navigation: Navigation Compose
Dependency Injection: Hilt
HTTP Client: Retrofit 2 + OkHttp 3
Serialization: Kotlinx Serialization (not Gson)
Image loading: Coil 3
Local storage: DataStore Preferences (for settings/token) + Room (for offline cache if needed)
Async: Kotlin Coroutines + Flow / StateFlow
Authentication: JWT token (Bearer), stored in EncryptedSharedPreferences
State: ViewModel + UiState sealed class
i18n: Android string resources (strings.xml)
Testing: JUnit 5, MockK, Turbine (Flow testing)
Build: Gradle Kotlin DSL (build.gradle.kts), Version Catalog (libs.versions.toml)

===== PROJECT STRUCTURE (MANDATORY) =====

Use multi-module architecture with feature modules:

app/
├── src/main/
│   ├── java/[package]/
│   │   ├── MainActivity.kt
│   │   ├── MainApplication.kt
│   │   └── navigation/
│   │       ├── AppNavHost.kt
│   │       └── AppDestination.kt
│   └── res/
│       ├── drawable/
│       ├── values/
│       │   ├── strings.xml
│       │   ├── colors.xml
│       │   └── themes.xml
│       └── mipmap/

core/
├── core-ui/                    ← shared design system
│   ├── theme/
│   │   ├── AppTheme.kt
│   │   ├── Color.kt
│   │   ├── Typography.kt
│   │   └── Shape.kt
│   ├── component/              ← reusable composables
│   │   ├── AppButton.kt
│   │   ├── AppCard.kt
│   │   ├── AppTextField.kt
│   │   ├── AppTopBar.kt
│   │   ├── AppBottomNav.kt
│   │   ├── AppNavigationDrawer.kt
│   │   ├── AppLoadingIndicator.kt
│   │   ├── AppErrorState.kt
│   │   ├── AppEmptyState.kt
│   │   ├── AppDataTable.kt
│   │   ├── AppFilterRow.kt
│   │   ├── AppSearchBar.kt
│   │   ├── AppStatCard.kt
│   │   ├── AppStatusBadge.kt
│   │   ├── AppConfirmDialog.kt
│   │   └── AppFormDialog.kt
│   └── util/
│       ├── UiExtensions.kt
│       └── ComposeUtils.kt
│
├── core-data/                  ← base data infrastructure
│   ├── network/
│   │   ├── ApiClient.kt
│   │   ├── AuthInterceptor.kt
│   │   ├── TokenRefreshInterceptor.kt
│   │   └── NetworkResultCall.kt
│   ├── model/
│   │   ├── ApiResponse.kt
│   │   ├── PaginatedResponse.kt
│   │   └── ApiError.kt
│   └── util/
│       ├── NetworkResult.kt
│       └── DataMappers.kt
│
├── core-domain/                ← base domain contracts
│   ├── model/
│   │   └── ResultState.kt
│   └── usecase/
│       └── BaseUseCase.kt
│
└── core-auth/                  ← auth infrastructure
    ├── TokenManager.kt
    ├── SessionManager.kt
    └── AuthRepository.kt

feature/
├── feature-auth/               ← login, register, forgot password
├── feature-dashboard/          ← home dashboard
├── feature-[domain-a]/         ← each feature module
├── feature-[domain-b]/
├── feature-settings/           ← app settings

Each feature module structure:
feature-[name]/
├── data/
│   ├── api/
│   │   └── [Feature]Api.kt         ← Retrofit interface
│   ├── model/
│   │   ├── [Feature]Dto.kt         ← API response DTOs
│   │   └── [Feature]Request.kt     ← API request bodies
│   ├── mapper/
│   │   └── [Feature]Mapper.kt      ← DTO → Domain model
│   └── repository/
│       └── [Feature]RepositoryImpl.kt
├── domain/
│   ├── model/
│   │   └── [Feature].kt            ← domain model (pure Kotlin)
│   ├── repository/
│   │   └── [Feature]Repository.kt  ← interface
│   └── usecase/
│       ├── Get[Feature]ListUseCase.kt
│       ├── Get[Feature]DetailUseCase.kt
│       ├── Create[Feature]UseCase.kt
│       ├── Update[Feature]UseCase.kt
│       └── Delete[Feature]UseCase.kt
└── presentation/
    ├── list/
    │   ├── [Feature]ListScreen.kt
    │   ├── [Feature]ListViewModel.kt
    │   └── [Feature]ListUiState.kt
    ├── detail/
    │   ├── [Feature]DetailScreen.kt
    │   └── [Feature]DetailViewModel.kt
    └── form/
        ├── [Feature]FormDialog.kt
        └── [Feature]FormViewModel.kt

===== MANDATORY ARCHITECTURE RULES =====

1. MVVM + Clean Architecture layers:
   - Presentation: Composables + ViewModels (knows domain, NOT data)
   - Domain: UseCases + Interfaces (knows NOTHING about Android)
   - Data: Repositories + API + DTOs (implements domain interfaces)

2. One-way data flow:
   Screen → ViewModel event → UseCase → Repository → API
   API → DTO → Mapper → Domain Model → UiState → Recompose Screen

3. UiState must be a sealed class or data class:
   data class [Feature]ListUiState(
     val items: List<[Feature]> = emptyList(),
     val isLoading: Boolean = false,
     val error: String? = null,
     val pagination: PaginationState = PaginationState(),
     val filters: [Feature]Filters = [Feature]Filters(),
     val isRefreshing: Boolean = false,
   )

4. ViewModels must use StateFlow, NOT LiveData:
   private val _uiState = MutableStateFlow([Feature]ListUiState())
   val uiState: StateFlow<[Feature]ListUiState> = _uiState.asStateFlow()

5. Network calls return NetworkResult<T> sealed class:
   sealed class NetworkResult<out T> {
     data class Success<T>(val data: T) : NetworkResult<T>()
     data class Error(val code: Int, val message: String) : NetworkResult<Nothing>()
     object Loading : NetworkResult<Nothing>()
   }

6. Use UseCases for business logic, NOT in ViewModels directly.

7. Hilt for ALL dependency injection. No manual service locator.

===== MANDATORY CORE MODULES =====

--- core-ui/theme/AppTheme.kt ---
Implement Material 3 dynamic color with:
  - Light and dark theme
  - Custom color palette (primary, secondary, tertiary, surface, error)
  - Custom Typography (use Google Fonts via downloadable fonts)
  - Custom Shapes
  - Apply to entire app via CompositionLocalProvider

--- core-ui/component/ (Reusable Composables) ---

AppTopBar.kt:
  Parameters: title, navigationIcon, actions, scrollBehavior
  Use LargeTopAppBar with collapsing behavior

AppNavigationDrawer.kt:
  Reads from navigation config (list of NavItem).
  Highlights active route.
  Supports nested sections with expandable groups.
  Closes on mobile when item selected.
  Adapts: permanent drawer on tablet/desktop, modal drawer on mobile.

AppBottomNav.kt:
  Shows top-level navigation items on mobile (max 5 items).
  Used alongside AppNavigationDrawer.

AppButton.kt:
  Variants: primary, secondary, outlined, text, danger.
  Parameters: text, onClick, isLoading, isEnabled, icon.
  Shows CircularProgressIndicator when isLoading = true.

AppTextField.kt:
  Parameters: value, onValueChange, label, placeholder, error, leadingIcon, trailingIcon, keyboardType, isPassword.
  Shows error text below field.

AppCard.kt:
  Wraps Material 3 Card with consistent padding and elevation.
  Parameters: title, content, actions.

AppDataTable.kt (LazyColumn-based):
  Parameters: columns (list of ColumnDef), items, isLoading, onRefresh.
  Supports: swipe-to-refresh, pull-to-refresh, empty state, loading shimmer.
  Each ColumnDef: { header: String, weight: Float, render: @Composable (item) -> Unit }

AppFilterRow.kt:
  Horizontal scrollable row of filter chips and input fields.
  Parameters: filters (list of FilterConfig), onFilterChange.

AppSearchBar.kt:
  Material 3 SearchBar with debounce.
  Parameters: query, onQueryChange, placeholder.

AppStatCard.kt:
  Parameters: title, value, subtitle, icon, trend (up/down/neutral), trendValue.
  Used on dashboard.

AppStatusBadge.kt:
  Parameters: status (enum), labelMap (enum → display string + color).

AppConfirmDialog.kt:
  Parameters: title, message, onConfirm, onDismiss, isDestructive.

AppFormDialog.kt:
  Bottom sheet or dialog wrapper for forms.
  Parameters: title, content (slot), onSubmit, onDismiss, isLoading.

AppLoadingIndicator.kt:
  Full-screen and inline variants.

AppEmptyState.kt:
  Parameters: message, icon, action (optional button).

AppErrorState.kt:
  Parameters: message, onRetry.

--- core-data/network/ ---

ApiClient.kt:
  Creates Retrofit instance.
  Base URL from BuildConfig.API_BASE_URL.
  OkHttp with: AuthInterceptor, TokenRefreshInterceptor, logging interceptor, 30s timeout.

AuthInterceptor.kt:
  Adds Authorization: Bearer <token> to every request.
  Reads token from TokenManager.

TokenRefreshInterceptor.kt:
  On 401 response:
    1. Pause request
    2. Call POST /auth/refresh with refreshToken
    3. If success: save new tokens, retry original request
    4. If fail: clear tokens, trigger logout event

NetworkResultCall.kt:
  Retrofit CallAdapter that wraps responses in NetworkResult<T>.

--- core-data/model/ ---

ApiResponse.kt:
  data class ApiResponse<T>(
    val data: T,
    val message: String,
    val statusCode: Int,
  )

PaginatedResponse.kt:
  data class PaginatedResponse<T>(
    val data: List<T>,
    val total: Int,
    val page: Int,
    val limit: Int,
  )

ApiError.kt:
  data class ApiError(
    val message: String,
    val statusCode: Int,
    val errors: Map<String, List<String>>? = null,
  )

--- core-auth/ ---

TokenManager.kt:
  Stores accessToken, refreshToken in EncryptedSharedPreferences.
  Functions: saveTokens(access, refresh), getAccessToken(), getRefreshToken(), clearTokens(), isLoggedIn().

SessionManager.kt:
  Holds current UserInfo in memory (SharedFlow for logout events).
  Functions: setUser(user), getUser(), logout().
  Emits logoutEvent when token refresh fails.

===== MANDATORY FEATURE: AUTH =====

feature-auth/
├── data/
│   ├── api/AuthApi.kt              ← POST /auth/login, POST /auth/refresh, POST /auth/logout
│   ├── model/LoginRequest.kt       ← { username, password }
│   ├── model/AuthResponse.kt       ← { accessToken, refreshToken, user: UserDto }
│   └── repository/AuthRepositoryImpl.kt
├── domain/
│   ├── model/UserInfo.kt           ← { id, username, email, role }
│   ├── repository/AuthRepository.kt
│   └── usecase/
│       ├── LoginUseCase.kt
│       ├── LogoutUseCase.kt
│       └── GetCurrentUserUseCase.kt
└── presentation/
    ├── login/
    │   ├── LoginScreen.kt          ← form with username + password + submit
    │   ├── LoginViewModel.kt
    │   └── LoginUiState.kt
    ├── register/
    │   ├── RegisterScreen.kt
    │   └── RegisterViewModel.kt
    └── forgot-password/
        ├── ForgotPasswordScreen.kt
        └── ForgotPasswordViewModel.kt

Login flow:
  1. LoginScreen collects username + password
  2. User taps login → LoginViewModel.login()
  3. LoginViewModel calls LoginUseCase
  4. LoginUseCase calls AuthRepository.login()
  5. AuthRepositoryImpl calls AuthApi.login()
  6. On success: save tokens via TokenManager, save user via SessionManager
  7. Emit navigation event → navigate to Dashboard
  8. On error: show error in UiState

===== MANDATORY FEATURE: DASHBOARD =====

feature-dashboard/
├── data/api/DashboardApi.kt        ← GET /dashboard/stats
├── domain/model/DashboardStats.kt  ← { totalUsers, totalOrders, revenueToday, ... }
└── presentation/
    ├── DashboardScreen.kt
    ├── DashboardViewModel.kt
    └── DashboardUiState.kt

DashboardScreen.kt:
  - LazyVerticalGrid of AppStatCard
  - Recent activity list
  - Quick action buttons to main features
  - Pull to refresh

===== MANDATORY LIST PAGE PATTERN =====

Every feature list screen MUST follow this pattern:

[Feature]ListUiState.kt:
  data class [Feature]ListUiState(
    val items: List<[Feature]> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val page: Int = 1,
    val totalPages: Int = 1,
    val hasNextPage: Boolean = false,
    val filters: [Feature]Filters = [Feature]Filters(),
    val selectedItems: Set<String> = emptySet(),
    val showDeleteConfirm: Boolean = false,
    val showFormDialog: Boolean = false,
    val editingItem: [Feature]? = null,
  )

[Feature]ListViewModel.kt:
  - loadItems(): load first page
  - loadNextPage(): append next page (pagination)
  - refresh(): reload from page 1
  - onFilterChange(filters): apply new filters, reload
  - onSearch(query): search with debounce
  - onCreateClick(): set showFormDialog = true
  - onEditClick(item): set editingItem + showFormDialog = true
  - onDeleteClick(item): set showDeleteConfirm = true
  - onConfirmDelete(): call DeleteUseCase, reload list
  - onSubmitForm(data): call Create/UpdateUseCase, close dialog, reload

[Feature]ListScreen.kt:
  @Composable
  fun [Feature]ListScreen(
    uiState: [Feature]ListUiState,
    onEvent: ([Feature]ListEvent) -> Unit
  ) {
    Scaffold(
      topBar = { AppTopBar(title = "...") },
      floatingActionButton = { AppFab(onClick = { onEvent(OpenCreateForm) }) }
    ) {
      Column {
        AppSearchBar(...)
        AppFilterRow(...)
        AppDataTable(
          items = uiState.items,
          isLoading = uiState.isLoading,
          onRefresh = { onEvent(Refresh) },
        )
        // Load more on scroll to bottom
      }
    }
    if (uiState.showFormDialog) {
      AppFormDialog(title = "...", onDismiss = { onEvent(CloseForm) }) {
        [Feature]FormContent(...)
      }
    }
    if (uiState.showDeleteConfirm) {
      AppConfirmDialog(
        title = "Delete?",
        isDestructive = true,
        onConfirm = { onEvent(ConfirmDelete) },
        onDismiss = { onEvent(DismissDeleteConfirm) }
      )
    }
  }

===== MANDATORY NAVIGATION =====

AppDestination.kt:
  sealed class AppDestination(val route: String) {
    // Auth
    object Login : AppDestination("auth/login")
    object Register : AppDestination("auth/register")
    object ForgotPassword : AppDestination("auth/forgot-password")

    // Main
    object Dashboard : AppDestination("main/dashboard")
    object [Feature]List : AppDestination("main/[feature]/list")
    object [Feature]Detail : AppDestination("main/[feature]/detail/{id}")
    object Settings : AppDestination("main/settings")
    object UserManagement : AppDestination("main/settings/users")
    object Appearance : AppDestination("main/settings/appearance")
  }

AppNavHost.kt:
  Use NavHost with two nav graphs:
    - authNavGraph: Login, Register, ForgotPassword (no bottom nav, no drawer)
    - mainNavGraph: Dashboard + all features (with AppNavigationDrawer + AppBottomNav)
  
  Auth guard: On app start, check TokenManager.isLoggedIn():
    - If logged in → navigate to Dashboard
    - If not → navigate to Login

  Listen to SessionManager.logoutEvent:
    - On logout event → clear backstack → navigate to Login

Navigation config (single source of truth):
  Create NavItem data class:
    data class NavItem(
      val destination: AppDestination,
      val label: String,
      val icon: ImageVector,
      val selectedIcon: ImageVector = icon,
      val children: List<NavItem> = emptyList(),
    )

  Create NAV_ITEMS: List<NavItem> in a constant file.
  AppNavigationDrawer reads from NAV_ITEMS.
  AppBottomNav reads top-level items from NAV_ITEMS.

===== MANDATORY DEPENDENCY INJECTION =====

Use Hilt modules organized by feature:

CoreModule.kt (@Module, @InstallIn(SingletonComponent)):
  - Provides Retrofit instance
  - Provides OkHttpClient
  - Provides TokenManager (EncryptedSharedPreferences)
  - Provides SessionManager
  - Provides DataStore

AuthModule.kt:
  - Provides AuthApi (Retrofit service)
  - Provides AuthRepository (binds AuthRepositoryImpl)

[Feature]Module.kt (per feature):
  - Provides [Feature]Api
  - Provides [Feature]Repository (binds [Feature]RepositoryImpl)

===== MANDATORY STATE MANAGEMENT =====

UiEvent sealed class (per screen):
  sealed class [Feature]ListEvent {
    object LoadItems : [Feature]ListEvent()
    object Refresh : [Feature]ListEvent()
    object LoadNextPage : [Feature]ListEvent()
    object OpenCreateForm : [Feature]ListEvent()
    data class OpenEditForm(val item: [Feature]) : [Feature]ListEvent()
    data class DeleteClick(val item: [Feature]) : [Feature]ListEvent()
    object ConfirmDelete : [Feature]ListEvent()
    object DismissDeleteConfirm : [Feature]ListEvent()
    object CloseForm : [Feature]ListEvent()
    data class SubmitForm(val data: [Feature]FormData) : [Feature]ListEvent()
    data class FilterChange(val filters: [Feature]Filters) : [Feature]ListEvent()
    data class SearchChange(val query: String) : [Feature]ListEvent()
  }

ViewModel handles events via onEvent(event: [Feature]ListEvent) function.
Screen only knows about UiState and onEvent — no direct ViewModel dependency in composables.

===== MANDATORY RESPONSIVE LAYOUT =====

Detect window size class and adapt:
  val windowSizeClass = calculateWindowSizeClass(activity)
  
  When Compact (phone portrait):
    - Use AppBottomNav for main navigation
    - Use ModalNavigationDrawer (hidden by default)
    - Full-width content
  
  When Medium (phone landscape / small tablet):
    - Use NavigationRail
    - Two-pane layout where applicable
  
  When Expanded (tablet / desktop):
    - Use PermanentNavigationDrawer (always visible)
    - List-Detail pane layout
    - More columns in grid/table

===== MANDATORY SETTINGS FEATURE =====

feature-settings/:
  presentation/
    ├── SettingsScreen.kt            ← list of settings categories
    ├── appearance/
    │   ├── AppearanceScreen.kt      ← theme toggle, font size, color scheme
    │   └── AppearanceViewModel.kt   ← reads/writes DataStore
    └── users/
        ├── UserListScreen.kt        ← user management (admin only)
        └── UserListViewModel.kt

Appearance settings (stored in DataStore):
  - Theme: System / Light / Dark
  - Dynamic color: enabled/disabled (Android 12+)
  - Color scheme: primary color picker

===== MANDATORY GRADLE SETUP =====

Use Gradle Version Catalog (libs.versions.toml):
  [versions]
  kotlin = "2.0.x"
  agp = "8.x.x"
  compose-bom = "2024.x.x"
  hilt = "2.x"
  retrofit = "2.x"
  okhttp = "4.x"
  coil = "3.x"
  room = "2.x"
  datastore = "1.x"
  kotlinx-serialization = "1.x"
  coroutines = "1.x"
  navigation = "2.x"
  lifecycle = "2.x"
  
  [libraries]
  # Compose BOM
  compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }
  compose-ui = { group = "androidx.compose.ui", name = "ui" }
  compose-material3 = { group = "androidx.compose.material3", name = "material3" }
  # ... (full list)
  
  [plugins]
  android-application = { id = "com.android.application", version.ref = "agp" }
  kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
  hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
  compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
  kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }

BuildConfig fields (set in app/build.gradle.kts):
  buildConfigField("String", "API_BASE_URL", "\"${System.getenv("API_BASE_URL") ?: "https://api.example.com"}\"")

===== NAMING CONVENTIONS (NON-NEGOTIABLE) =====

- Files: PascalCase for classes (LoginScreen.kt), camelCase for functions
- Composables: PascalCase, annotated with @Composable
- ViewModels: [Feature][Screen]ViewModel.kt
- UiState: [Feature][Screen]UiState.kt (data class)
- Events: [Feature][Screen]Event.kt (sealed class)
- APIs: [Feature]Api.kt (Retrofit @interface)
- DTOs: [Feature]Dto.kt / [Feature]Response.kt / [Feature]Request.kt
- Domain models: [Feature].kt (pure Kotlin data class)
- Repositories: [Feature]Repository.kt (interface) + [Feature]RepositoryImpl.kt (impl)
- UseCases: [Action][Entity]UseCase.kt (e.g. GetUserListUseCase.kt)
- Mappers: [Feature]Mapper.kt (extension functions)
- Modules (Hilt): [Name]Module.kt

===== ANTI-PATTERNS TO AVOID =====

NEVER do any of the following:
1. Use XML layouts — Compose only
2. Use LiveData — StateFlow only
3. Call repository directly from ViewModel — use UseCases
4. Share ViewModel between unrelated screens
5. Put business logic in Composable functions
6. Use Gson — use Kotlinx Serialization
7. Store token in SharedPreferences (unencrypted) — use EncryptedSharedPreferences
8. Make network calls on main thread
9. Expose mutable state from ViewModel (no MutableStateFlow public)
10. Use hardcoded strings — always use string resources

===== GENERATE IN THIS ORDER =====

1. Project setup: build.gradle.kts files, libs.versions.toml, AndroidManifest.xml
2. core-data: ApiClient, AuthInterceptor, NetworkResult, ApiResponse models
3. core-auth: TokenManager, SessionManager
4. core-domain: BaseUseCase, ResultState
5. core-ui/theme: AppTheme, Color, Typography, Shape
6. core-ui/component: All reusable composables (AppButton, AppCard, AppDataTable, etc.)
7. feature-auth: AuthApi, AuthRepository, LoginUseCase, LoginViewModel, LoginScreen
8. AppNavHost + AppDestination + NAV_ITEMS constant
9. MainActivity + MainApplication (Hilt)
10. feature-dashboard: DashboardApi, DashboardViewModel, DashboardScreen
11. Each feature module in order: data → domain → presentation
12. feature-settings: AppearanceScreen, UserListScreen
13. Hilt modules: CoreModule, AuthModule, per-feature modules

===== SUCCESS CRITERIA =====

The generated app is correct if:
1. Project builds without errors
2. Auth flow works: Login → save tokens → navigate to Dashboard
3. Token refresh works automatically on 401 response
4. Logout clears tokens and navigates to Login
5. Each list screen follows UiState + onEvent pattern
6. Navigation drawer reads from NAV_ITEMS constant
7. App adapts layout to phone/tablet screen sizes
8. No direct repository calls in ViewModels (only via UseCases)
9. All state is StateFlow, no LiveData
10. Hilt provides all dependencies correctly
```

---

## GHI CHÚ SAU KHI GENERATE

### Kiểm tra ngay sau khi generate

```bash
# Build debug
./gradlew assembleDebug

# Chạy unit tests
./gradlew test

# Kiểm tra lint
./gradlew lint

# Kiểm tra Kotlin compilation
./gradlew compileDebugKotlin
```

### Những gì cần điều chỉnh thủ công

| File | Điều chỉnh |
|---|---|
| `app/build.gradle.kts` | `applicationId`, `API_BASE_URL` BuildConfig |
| `NavItem` constant | Thêm đúng feature sections của app |
| `AuthApi.kt` | Endpoint login/refresh khớp với backend thật |
| `AuthInterceptor.kt` | Header format Bearer token |
| `libs.versions.toml` | Cập nhật version mới nhất |
| `strings.xml` | Dịch label theo ngôn ngữ app |

### Thêm feature mới sau này

```
Add a new feature module to the existing Android admin app:

Feature name: [FEATURE_NAME]
Package: [com.yourapp.feature.[featurename]]
Resources:
  - List screen: shows [Entity] items with fields [field1, field2, field3]
  - Detail screen: shows full [Entity] info
  - Form dialog: create + edit [Entity]

API endpoints:
  - GET /[feature] → paginated list
  - GET /[feature]/{id} → detail
  - POST /[feature] → create
  - PUT /[feature]/{id} → update
  - DELETE /[feature]/{id} → delete

Follow the exact same architecture:
- data/: [Feature]Api, [Feature]Dto, [Feature]RepositoryImpl
- domain/: [Feature] model, [Feature]Repository interface, 5 UseCases
- presentation/list/: [Feature]ListScreen + ViewModel + UiState + Event sealed class
- presentation/form/: AppFormDialog with [Feature]FormContent composable
- Hilt module: [Feature]Module
- Add NavItem to NAV_ITEMS constant
```

---

## THAM KHẢO NHANH

### Architecture layers

```
Screen (Composable)
  ↓ event
ViewModel (StateFlow<UiState>)
  ↓ call
UseCase (business logic)
  ↓ call
Repository (interface)
  ↓ implement
RepositoryImpl → Api (Retrofit) → Backend
              → LocalDb (Room) → Cache
```

### State pattern

```kotlin
// UiState — immutable data class
data class UserListUiState(
  val users: List<User> = emptyList(),
  val isLoading: Boolean = false,
  val error: String? = null,
)

// Event — sealed class
sealed class UserListEvent {
  object Load : UserListEvent()
  data class Delete(val id: String) : UserListEvent()
}

// ViewModel
class UserListViewModel @Inject constructor(
  private val getUserListUseCase: GetUserListUseCase,
) : ViewModel() {
  private val _uiState = MutableStateFlow(UserListUiState())
  val uiState = _uiState.asStateFlow()

  fun onEvent(event: UserListEvent) = when (event) {
    is UserListEvent.Load -> loadUsers()
    is UserListEvent.Delete -> deleteUser(event.id)
  }
}

// Screen
@Composable
fun UserListScreen(viewModel: UserListViewModel = hiltViewModel()) {
  val uiState by viewModel.uiState.collectAsStateWithLifecycle()
  UserListContent(uiState = uiState, onEvent = viewModel::onEvent)
}
```

### Dependency pattern

```kotlin
// Hilt Module
@Module
@InstallIn(SingletonComponent::class)
object UserModule {
  @Provides @Singleton
  fun provideUserApi(retrofit: Retrofit): UserApi =
    retrofit.create(UserApi::class.java)

  @Provides @Singleton
  fun provideUserRepository(impl: UserRepositoryImpl): UserRepository = impl
}
```

### Import pattern (không dùng deep import)

```kotlin
// Đúng
import com.yourapp.core.ui.component.AppButton
import com.yourapp.core.ui.component.AppDataTable
import com.yourapp.feature.user.domain.model.User

// Sai
import androidx.compose.material3.Button  // trong feature screen
```
