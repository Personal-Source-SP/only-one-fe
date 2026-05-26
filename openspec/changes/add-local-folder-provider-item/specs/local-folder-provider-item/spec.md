## ADDED Requirements

### Requirement: Local provider configuration exposes folder registration

The system SHALL expose an `add folder` action inside the `LOCAL` data-provider configuration flow so users can register a local source folder without leaving the active provider context.

#### Scenario: Local provider shows add folder action

- **WHEN** a user opens `ScrapeSetting` for a saved `data-provider` whose `scraperService` is `local`
- **THEN** the UI shows an `add folder` action in the local configuration area

#### Scenario: Non-local providers do not show add folder action

- **WHEN** a user opens `ScrapeSetting` for a provider whose `scraperService` is not `local`
- **THEN** the `add folder` action is not shown

### Requirement: Registering a local folder provisions item relationships

The system MUST treat local folder registration as a single business action that resolves the target `item` and creates the corresponding `data-provider-item` for the active `data-provider`.

#### Scenario: New folder creates item and provider item

- **WHEN** the user selects a local folder that does not map to an existing `item`
- **THEN** the system creates a new `item`
- **THEN** the system creates a new `data-provider-item` linked to the active `data-provider`

#### Scenario: Existing item is reused

- **WHEN** the user selects a local folder that maps to an existing `item`
- **THEN** the system reuses that `item`
- **THEN** the system still creates the missing `data-provider-item` for the active `data-provider`

### Requirement: Folder selection is metadata-only

The system MUST use folder selection only to identify the folder being registered for the active `data-provider`; it MUST NOT turn the `add folder` flow into a file sync or upload flow.

#### Scenario: Add folder does not upload files

- **WHEN** the user selects a folder in the `add folder` flow
- **THEN** the system uses folder metadata only to prepare the registration request
- **THEN** the system does not upload or sync the folder's files as part of that action

#### Scenario: Add folder does not preview file contents

- **WHEN** the user opens the `add folder` flow
- **THEN** the UI does not show preview, progress, or batch-processing semantics for files inside the selected folder
- **THEN** the action remains focused on creating or linking `item` and `data-provider-item`

### Requirement: Local folder registration supports browser-compatible fallback without upload semantics

The system MUST provide a browser-compatible fallback when `File System Access API` is unavailable, but it MUST NOT use a mechanism that makes the `add folder` flow appear to upload or sync all files from the folder.

#### Scenario: Browser falls back to metadata entry when showDirectoryPicker is unavailable

- **WHEN** the user opens local folder registration in a browser without `showDirectoryPicker`
- **THEN** the UI offers a compatible fallback flow to enter or confirm folder metadata needed for registration
- **THEN** the user can still continue the registration flow without switching browsers
- **THEN** the fallback does not present upload-style wording for the entire folder contents

#### Scenario: Browser path limitations are handled explicitly

- **WHEN** the current browser cannot expose a full local folder path to the web app
- **THEN** the system does not assume it can read that path automatically
- **THEN** the UI asks the user to provide or confirm the path-like metadata required by the business flow

#### Scenario: Unsupported environment shows actionable guidance

- **WHEN** neither `showDirectoryPicker` nor the supported metadata fallback is available
- **THEN** the UI shows a clear error message
- **THEN** the message explains what capability is missing and what the user can do next

### Requirement: Duplicate local folder registration is prevented

The system MUST prevent the same local folder from being registered more than once for the same `data-provider`.

#### Scenario: Same provider cannot register the same folder twice

- **WHEN** the user submits a folder that is already linked to the active `data-provider`
- **THEN** the system rejects the request
- **THEN** the UI shows a validation or error message explaining that the folder already exists

### Requirement: Successful registration refreshes local configuration state

The system MUST give immediate feedback after folder registration and refresh related provider state so the new folder linkage is visible without a manual page reload.

#### Scenario: Success refreshes modal state

- **WHEN** a local folder registration succeeds
- **THEN** the UI shows a success notification
- **THEN** the relevant provider data and selectable provider-item state are refreshed
