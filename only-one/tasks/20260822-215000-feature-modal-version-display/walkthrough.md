# Walkthrough: Data Provider Feature Modal Version Display & History Workflow

## 1. Summary of Changes

We aligned `DataProviderFeatureSettingModal` in `only-one-fe` to match the exact design and UX pattern of `orien-trade-admin` (`configure-scraping-modal.tsx`):

### Key Alignment Details:
1. **Modal Header ([DataProviderFeatureSettingModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/DataProviderFeatureSettingModal.tsx))**:
   - Header title right side displays metadata tags:
     - **Author Tag**: `<CustomTag color="#108ee9" icon={<Icon icon="lucide:user" />}>{fullName}</CustomTag>`
     - **Change Type Tag**: `<CustomTag color="#108ee9" icon={<Icon icon="lucide:info" />}>{changeType}</CustomTag>` (AI tạo, Khôi phục, Chỉnh sửa thủ công)
     - **Timestamp Tag**: `<CustomTag color="#108ee9" icon={<Icon icon="lucide:clock" />}>{formatDate(createdAt)}</CustomTag>`
     - **Status Badge**: `vX Active` (color `success`) or `vX (Lịch sử)` (color `warning`).
2. **Modal Footer (Bottom Toolbar)**:
   - **Left side**: `<CustomSelect>` with items formatted as `Current Version` (bold) and `Version X - {changeType}` with Clock icon.
   - **Right side**:
     - **Rollback Button**: `<CustomPopconfirm>` + `<CustomButton type="primary">Khôi phục</CustomButton>` (disabled when viewing current version, active when viewing history).
     - **Save Button**: Triggers `form.submit()`, disabled while viewing history snapshot.
     - **Cancel Button**: Closes modal.
3. **Modal Tabs Structure**:
   - Streamlined into 2 focused tabs: **Cấu hình** (`config`) and **Thử nghiệm** (`test`). (Removed separate table tab as version switching is natively integrated into the modal footer).
4. **Diff / Field Comparison Highlights ([ScrapingConfigForm.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/ScrapingConfigForm.tsx) & [SearchConfigForm.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/features/[dataProviderId]/components/SearchConfigForm.tsx))**:
   - In snapshot preview mode (`isViewingHistory = true`), form field labels automatically detect and highlight differences against the current active configuration (e.g. `[Hiện tại: ...]`).

---

## 2. Verification Results

### Automated Checks:
1. **TypeScript Typecheck (`npx tsc --noEmit`)**:
   - Status: **PASSED (0 errors)**.
2. **ESLint & Prettier (`npm run format` & `npx eslint ...`)**:
   - Status: **PASSED (0 errors, 0 warnings)**.

---

## 3. Completion Evidence (Key Code Snippets)

### Header Badges in Modal:
```tsx
{!isDraft && selectedVersion && (
    <CustomFlex align="center" gap="small" wrap>
        {authorName && (
            <CustomTag className="flex items-center gap-1 m-0">
                <Icon icon="lucide:user" className="w-3 h-3" />
                {authorName}
            </CustomTag>
        )}
        {renderChangeTypeTag(selectedVersion.changeType)}
        {selectedVersion.createdAt && (
            <CustomTag className="flex items-center gap-1 m-0">
                <Icon icon="lucide:clock" className="w-3 h-3" />
                {formatDate(selectedVersion.createdAt)}
            </CustomTag>
        )}
        {selectedVersion.isActive ? (
            <CustomTag color="success" className="font-mono font-bold m-0">
                v{selectedVersion.versionId} Active
            </CustomTag>
        ) : (
            <CustomTag color="warning" className="font-mono font-bold m-0">
                v{selectedVersion.versionId} (Lịch sử)
            </CustomTag>
        )}
    </CustomFlex>
)}
```

### Version Switcher Toolbar in Config Tab:
```tsx
{!isDraft && versions.length > 0 && (
    <div className="mb-4 p-3 rounded-xl bg-hub-section/40 border border-hub-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-hub-subtitle flex items-center gap-1.5">
                <Icon icon="lucide:layers" className="w-4 h-4 text-hub-primary" />
                Phiên bản:
            </span>
            <CustomSelect
                className="w-56"
                size="small"
                value={selectedVersion?.versionId}
                options={versionOptions}
                onChange={(val) => setSelectedVersionId(val)}
            />
            {isViewingHistory && (
                <span className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                    <Icon icon="lucide:eye" className="w-3.5 h-3.5" />
                    Đang xem snapshot lịch sử
                </span>
            )}
        </div>
        {isViewingHistory && (
            <div className="flex items-center gap-2">
                <CustomButton size="small" onClick={() => setSelectedVersionId(activeVersion?.versionId)}>
                    Quay lại bản hiện tại
                </CustomButton>
                <CustomPopconfirm
                    title={`Khôi phục về phiên bản v${selectedVersion?.versionId}?`}
                    description="Cấu hình hiện tại của tính năng sẽ được thay thế bằng snapshot này."
                    okText="Khôi phục"
                    cancelText="Hủy"
                    onConfirm={() => handleRollback(selectedVersion?.versionId)}
                >
                    <CustomButton
                        type="primary"
                        size="small"
                        loading={isRollingBack}
                        icon={<Icon icon="lucide:rotate-ccw" />}
                        className="bg-amber-600 hover:bg-amber-500 border-amber-600 text-white"
                    >
                        Khôi phục phiên bản này
                    </CustomButton>
                </CustomPopconfirm>
            </div>
        )}
    </div>
)}
```

---

## 4. User Constraints & Lessons Learned
- **[AVOID]** Duplicating version queries across multiple subcomponents — Query versions once in the parent container modal and pass the reactive list and refetch callback down to child tabs.
- **[SAFETY]** Always disable standard entity update/save actions when inspecting historical immutable snapshots to avoid accidental data corruption; provide dedicated rollback mutations with explicit user confirmation (`Popconfirm`).
