## ADDED Requirements

### Requirement: Session bootstrap shows a blocking loader until resolved

While `useSession` reports `status === 'loading'`, the application SHALL NOT render route-specific interactive content that depends on authentication; it SHALL show the shared `Loading` component until status is `authenticated` or `unauthenticated`.

#### Scenario: Cold load of any route

- **WHEN** the application hydrates and session status is still loading
- **THEN** the user MUST see the global loading state and MUST NOT see flicker of the wrong shell (e.g. login form briefly before redirect to dashboard)

### Requirement: Authenticated users are redirected off public auth pages

If `status === 'authenticated'` and the current pathname is listed in `AUTH_PUBLIC_PAGES`, the system SHALL `router.replace` to `/dashboard` (or the post-login default agreed with product) without requiring a full page reload.

#### Scenario: Logged-in user visits login

- **WHEN** a user with a valid session navigates to `/login`
- **THEN** the client MUST replace the location with `/dashboard` and MUST NOT leave them on the login form

### Requirement: Return URL storage uses a single session key

Any code path that stores the intended post-login URL in `sessionStorage` (including logout preparing redirect back after sign-in) MUST use `KEY_SESSION_STORAGE.RETURN_URL` from `@/constants` and MUST NOT use alternate string literals for the same concept.

#### Scenario: Logout from protected area

- **WHEN** the user logs out from a protected route
- **THEN** the stored return URL key MUST match `KEY_SESSION_STORAGE.RETURN_URL` so a subsequent successful login can read the same key as other flows

### Requirement: Expired session triggers controlled sign-out on protected routes

If the session expiry indicates an invalid session while the user is on a non-public page, the system SHALL persist the return URL with `KEY_SESSION_STORAGE.RETURN_URL` and SHALL invoke `signOut` with `callbackUrl` pointing to `/login`.

#### Scenario: Expired token on dashboard

- **WHEN** the session is expired and the pathname is not in `AUTH_PUBLIC_PAGES`
- **THEN** the user MUST be signed out and redirected toward login with return URL preserved consistently

### Requirement: Auth errors are surfaced accurately

Login and register flows SHALL surface failure reasons using clear, user-safe text in the application locale used today; they MUST NOT silently swallow errors when Refine or NextAuth returns `success: false` without an error object. Raw provider error strings MUST NOT be shown verbatim unless they are already appropriate for end users.

#### Scenario: Credentials rejected

- **WHEN** `signIn` returns `ok: false` with an error code or message
- **THEN** the user MUST receive a clear error notification or inline message that reflects a safe, mapped explanation of the failure
