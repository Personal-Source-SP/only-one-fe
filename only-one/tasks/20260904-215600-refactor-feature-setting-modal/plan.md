---
status: done
slug: refactor-feature-setting-modal
started_at: 2026-09-04
completed_at: 2026-09-04
pr_url: ~
branch: ~
---

# Plan: Refactor Chia Nhỏ FeatureSettingModal & Cấu Trúc Thư Mục Hooks / FeatureSettingModal

## Section 1. Current State (Hiện trạng & Phân tích Mã nguồn)
- **Cơ chế hiện tại**:
  - `FeatureSettingModal.tsx` (~368 dòng) nằm trực tiếp dưới `components/`, gánh cùng lúc logic version management, header badges, footer actions và tabs layout.
  - Các hooks của page đang được đặt trong một file `hooks.ts` duy nhất tại thư mục gốc của route.
- **Invariants**:
  - Giữ nguyên 100% contracts và props của `FeatureSettingModal` và hook `useDataProviderFeaturesPage`.
  - Barrel export tại `components/index.ts` và `hooks/index.ts` đảm bảo `page.tsx` và các component khác không bị gãy import path.
  - Giữ nguyên toàn bộ UI, behavior, disable states, và notification feedback.

## Section 2. Detailed Design (Thiết kế Kỹ thuật Chi tiết)
- **Cấu trúc thư mục mới**:
  ```text
  src/app/(root)/scraping/features/[dataProviderId]/
  ├── hooks/
  │   ├── index.ts
  │   ├── useDataProviderFeaturesPage.ts (chuyển từ hooks.ts)
  │   └── useFeatureVersionManager.ts (mới - quản lý versions & rollback)
  │
  ├── components/
  │   ├── FeatureSettingModal/
  │   │   ├── index.tsx (hoặc FeatureSettingModal.tsx)
  │   │   ├── FeatureModalHeader.tsx (mới)
  │   │   └── FeatureModalFooter.tsx (mới)
  │   ├── FeatureCard.tsx
  │   ├── FeatureHistoryModal.tsx
  │   ├── FeatureTestTab.tsx
  │   ├── ScrapingConfigForm.tsx
  │   ├── SearchConfigForm.tsx
  │   ├── CreateFeatureModal.tsx
  │   └── index.ts (re-export FeatureSettingModal từ ./FeatureSettingModal)
  ```

## Section 3. Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Reused Existing Utilities / Helpers | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeaturesPage.ts` | `useDataProviderFeaturesPage` | Chuyển từ `hooks.ts` | `None` | `npm run lint` |
| **2** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureVersionManager.ts` | `useFeatureVersionManager` | `@/hooks` (`useCustomData`, `useCustomMutationData`) | `None` | `npm run lint` |
| **3** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks/index.ts` | Barrel Exports | Re-export cả 2 hooks | `Order 1, 2` | `npm run lint` |
| **4** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/hooks.ts` | File cũ | Đã chuyển sang thư mục `hooks/` | `Order 1, 3` | `npm run lint` |
| **5** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx` | `FeatureModalHeader` | `@/libs` (`formatDate`), `../../utils` | `None` | `npm run lint` |
| **6** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx` | `FeatureModalFooter` | `@/components/custom-antd` | `None` | `npm run lint` |
| **7** | `[x]` | `[NEW]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx` | `FeatureSettingModal` | Tích hợp sub-components và `useFeatureVersionManager` | `Order 2, 5, 6` | `npm run lint` |
| **8** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal.tsx` | File cũ | Đã chuyển vào thư mục `components/FeatureSettingModal/` | `Order 7` | `npm run lint` |
| **9** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/features/[dataProviderId]/components/index.ts` | Barrel Exports | Re-export `FeatureSettingModal` từ thư mục con | `Order 7, 8` | `npm run lint` |

## Section 4. Code Changes (Unified Diff)

### 1. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useDataProviderFeaturesPage.ts`
> **Action**: Chuyển nội dung từ `hooks.ts` sang file độc lập trong thư mục `hooks/`.

```typescript
'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { IDataProvider } from '@/app/(root)/scraping/data-providers/types';
import { API_ENDPOINT } from '@/config';
import {
    DataProviderFeatureStatus,
    DataProviderFeatureType,
    MessageType,
    ScraperServiceEnum,
} from '@/enums';
import { useCustomList, useCustomMutationData, useCustomOne } from '@/hooks';
import type {
    FeatureModalState,
    FeatureModalTab,
    HistoryModalState,
    IDataProviderFeature,
} from '../types';

export const useDataProviderFeaturesPage = () => {
    const params = useParams();
    const router = useRouter();
    const dataProviderId = (params?.dataProviderId as string) || '';

    const [modalState, setModalState] = useState<FeatureModalState>({
        open: false,
        feature: null,
        activeTab: 'config',
    });

    const [historyModalState, setHistoryModalState] = useState<HistoryModalState>({
        open: false,
        feature: null,
    });

    const { handleCustomMutationData } = useCustomMutationData();

    // 1. Query Data Provider details
    const { query: providerQuery, data: provider } = useCustomOne<IDataProvider>({
        resource: API_ENDPOINT.DATA_PROVIDERS.BASE,
        id: dataProviderId,
        enabled: Boolean(dataProviderId),
    });

    // 2. Query all Features for this provider
    const { query: featuresQuery, data: features = [] } = useCustomList<IDataProviderFeature>({
        resource: API_ENDPOINT.DATA_PROVIDER_FEATURES.BY_PROVIDER(dataProviderId),
        queryOptions: {
            enabled: Boolean(dataProviderId),
        },
        transform: (list) => (list && list.length > 0 ? list : provider?.features || []),
    });

    const refetchAll = useCallback(async (): Promise<void> => {
        await Promise.all([providerQuery.refetch(), featuresQuery.refetch()]);
    }, [providerQuery, featuresQuery]);

    const handleSwitchStatus = (
        featureId: string,
        currentStatus: DataProviderFeatureStatus,
    ): void => {
        const nextStatus =
            currentStatus === DataProviderFeatureStatus.READY
                ? DataProviderFeatureStatus.DISABLED
                : DataProviderFeatureStatus.READY;

        handleCustomMutationData({
            method: 'put',
            url: `data-provider-features/${featureId}/switch-status/${nextStatus}`,
            successNotification: () => {
                refetchAll();
                return {
                    type: MessageType.SUCCESS,
                    message: 'Cập nhật trạng thái thành công',
                };
            },
            errorNotification: (error) => ({
                type: MessageType.ERROR,
                message: 'Cập nhật trạng thái thất bại',
                description: error?.message,
            }),
        });
    };

    const openFeatureModal = (
        feature: IDataProviderFeature,
        tab: FeatureModalTab = 'config',
    ): void => {
        setModalState({ open: true, feature, activeTab: tab });
    };

    const openConfigByType = (type: DataProviderFeatureType): void => {
        const existing = features.find((f) => f.type === type);
        if (existing) {
            setModalState({ open: true, feature: existing, activeTab: 'config' });
            return;
        }

        const draftFeature: IDataProviderFeature = {
            id: '',
            dataProviderId,
            type,
            service: ScraperServiceEnum.GENERIC,
            status: DataProviderFeatureStatus.UNCONFIGURED,
            consecutiveFailures: 0,
            config: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            dataProvider: provider,
        };
        setModalState({ open: true, feature: draftFeature, activeTab: 'config' });
    };

    const closeFeatureModal = (): void => {
        setModalState((prev) => ({ ...prev, open: false }));
    };

    const openHistoryModal = useCallback((feature: IDataProviderFeature): void => {
        setHistoryModalState({ open: true, feature });
    }, []);

    const closeHistoryModal = useCallback((): void => {
        setHistoryModalState((prev) => ({ ...prev, open: false }));
    }, []);

    return {
        router,
        provider,
        features,
        modalState,
        historyModalState,
        dataProviderId,
        isLoading: providerQuery.isLoading || featuresQuery.isLoading,
        refetchAll,
        setModalState,
        openFeatureModal,
        openConfigByType,
        closeFeatureModal,
        openHistoryModal,
        closeHistoryModal,
        handleSwitchStatus,
    };
};
```

### 2. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/useFeatureVersionManager.ts`
> **Action**: Tạo hook quản lý versioning & rollback.

```typescript
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormInstance } from 'antd';
import { API_ENDPOINT } from '@/config';
import { MessageType } from '@/enums';
import { useCustomData, useCustomMutationData } from '@/hooks';
import type { IConfigVersion, IDataProviderFeature } from '../types';

export interface UseFeatureVersionManagerProps {
    open: boolean;
    feature: IDataProviderFeature;
    form: FormInstance;
    onSuccess: () => void;
}

export const useFeatureVersionManager = ({
    open,
    feature,
    form,
    onSuccess,
}: UseFeatureVersionManagerProps) => {
    const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
    const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>();

    // Fetch version history for existing feature
    const { result: versionsResult, query: versionsQuery } = useCustomData({
        url: API_ENDPOINT.DATA_PROVIDER_FEATURES.VERSIONS(feature.id),
        enabled: Boolean(open && feature.id),
    });

    const versions = useMemo(
        () => (versionsResult?.data?.data || []) as IConfigVersion[],
        [versionsResult],
    );

    const activeVersion = useMemo(() => versions.find((v) => v.isActive), [versions]);
    const { handleCustomMutationData } = useCustomMutationData();

    // Reset or set selected version whenever activeVersion loads or modal opens
    useEffect(() => {
        if (open && activeVersion) {
            setSelectedVersionId(activeVersion.versionId);
        } else if (!open) {
            setSelectedVersionId(undefined);
            form.resetFields();
        }
    }, [open, activeVersion, form]);

    const selectedVersion = useMemo(
        () => versions.find((v) => v.versionId === selectedVersionId) || activeVersion || null,
        [versions, selectedVersionId, activeVersion],
    );

    const isViewingHistory = Boolean(selectedVersion && !selectedVersion.isActive);

    const handleRollback = (targetVersionId?: number) => {
        const vId = targetVersionId || selectedVersion?.versionId;
        if (!feature.id || !vId) return;

        setIsRollingBack(true);
        handleCustomMutationData({
            method: 'post',
            url: API_ENDPOINT.DATA_PROVIDER_FEATURES.ROLLBACK(feature.id, vId),
            successNotification: () => {
                setIsRollingBack(false);
                versionsQuery.refetch();
                onSuccess();
                return {
                    type: MessageType.SUCCESS,
                    message: `Đã khôi phục về phiên bản v${vId}`,
                };
            },
            errorNotification: (error) => {
                setIsRollingBack(false);
                return {
                    type: MessageType.ERROR,
                    message: 'Khôi phục phiên bản thất bại',
                    description: error?.message,
                };
            },
        });
    };

    const authorName = useMemo(() => {
        if (!selectedVersion) return null;
        if (selectedVersion.user) {
            const fullName = `${selectedVersion.user.firstName || ''} ${
                selectedVersion.user.lastName || ''
            }`.trim();
            return fullName || selectedVersion.user.email || selectedVersion.user.userName;
        }
        return selectedVersion.createdBy || null;
    }, [selectedVersion]);

    return {
        versions,
        selectedVersion,
        selectedVersionId,
        isViewingHistory,
        isRollingBack,
        authorName,
        setSelectedVersionId,
        handleRollback,
    };
};
```

### 3. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/hooks/index.ts`
> **Action**: Barrel export cho thư mục `hooks/`.

```typescript
export * from './useDataProviderFeaturesPage';
export * from './useFeatureVersionManager';
```

### 4. `[DELETE]` `src/app/(root)/scraping/features/[dataProviderId]/hooks.ts`
> **Action**: Xóa file `hooks.ts` cũ (đã chuyển vào `hooks/useDataProviderFeaturesPage.ts`).

### 5. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalHeader.tsx`
> **Action**: Tạo header presentational component bên trong thư mục `FeatureSettingModal/`.

```typescript
'use client';

import { CustomFlex, CustomTag, CustomTypography } from '@/components/custom-antd';
import { ConfigVersionType } from '@/enums';
import { formatDate } from '@/libs';
import { Icon } from '@iconify/react';
import type { IConfigVersion, IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';

export interface FeatureModalHeaderProps {
    feature: IDataProviderFeature;
    isDraft: boolean;
    selectedVersion: IConfigVersion | null;
    authorName: string | null;
}

export const FeatureModalHeader = ({
    feature,
    isDraft,
    selectedVersion,
    authorName,
}: FeatureModalHeaderProps) => {
    const def = getFeatureDefinition(feature.type);
    const providerName = feature.dataProvider?.name;

    const renderChangeTypeTag = (changeType?: ConfigVersionType) => {
        if (!changeType) return null;
        let label = 'Chỉnh sửa thủ công';
        let icon = 'lucide:edit-3';
        if (changeType === ConfigVersionType.AI_GENERATED) {
            label = 'AI tạo';
            icon = 'lucide:sparkles';
        } else if (changeType === ConfigVersionType.ROLLBACK) {
            label = 'Khôi phục';
            icon = 'lucide:history';
        }

        return (
            <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                <Icon icon={icon} className="w-3 h-3" />
                {label}
            </CustomTag>
        );
    };

    return (
        <CustomFlex justify="space-between" align="center" className="w-full pr-6 flex-wrap gap-2">
            <CustomFlex align="center" gap="middle">
                <CustomFlex
                    align="center"
                    justify="center"
                    className={`p-2 rounded-xl shrink-0 ${
                        def?.accentClass || 'text-hub-primary bg-hub-primary/10'
                    }`}
                >
                    <Icon icon={def?.icon || 'lucide:sliders'} className="text-lg" />
                </CustomFlex>
                <CustomFlex vertical gap={2}>
                    <CustomFlex align="center" gap="small" wrap>
                        <CustomTypography.Text strong className="text-base text-hub-title">
                            {def?.getTitle
                                ? def.getTitle(isDraft, providerName)
                                : `${isDraft ? 'Thiết lập' : 'Cấu hình'}: ${feature.type}`}
                        </CustomTypography.Text>
                        {feature.service && (
                            <CustomTag className="font-mono text-xs m-0">
                                {feature.service}
                            </CustomTag>
                        )}
                    </CustomFlex>
                </CustomFlex>
            </CustomFlex>

            {/* Version Metadata Tags in Header */}
            {!isDraft && selectedVersion && (
                <CustomFlex align="center" gap="small" wrap>
                    {authorName && (
                        <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
                            <Icon icon="lucide:user" className="w-3 h-3" />
                            {authorName}
                        </CustomTag>
                    )}
                    {renderChangeTypeTag(selectedVersion.changeType)}
                    {selectedVersion.createdAt && (
                        <CustomTag color="#108ee9" className="flex items-center gap-1 m-0">
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
        </CustomFlex>
    );
};
```

### 6. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/FeatureModalFooter.tsx`
> **Action**: Tạo footer presentational component bên trong thư mục `FeatureSettingModal/`.

```typescript
'use client';

import { useMemo } from 'react';
import type { FormInstance } from 'antd';
import {
    CustomButton,
    CustomFlex,
    CustomPopconfirm,
    CustomSelect,
    CustomSpace,
} from '@/components/custom-antd';
import { ConfigVersionType } from '@/enums';
import { Icon } from '@iconify/react';
import type { FeatureModalTab, IConfigVersion } from '../../types';

export interface FeatureModalFooterProps {
    activeTab: FeatureModalTab;
    isDraft: boolean;
    versions: IConfigVersion[];
    selectedVersion: IConfigVersion | null;
    isViewingHistory: boolean;
    isSaving: boolean;
    isRollingBack: boolean;
    form: FormInstance;
    onClose: () => void;
    onRollback: (versionId?: number) => void;
    onSelectVersion: (versionId: number) => void;
}

export const FeatureModalFooter = ({
    activeTab,
    isDraft,
    versions,
    selectedVersion,
    isViewingHistory,
    isSaving,
    isRollingBack,
    form,
    onClose,
    onRollback,
    onSelectVersion,
}: FeatureModalFooterProps) => {
    const versionOptions = useMemo(() => {
        if (!versions.length) return [];
        return [...versions]
            .sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                return b.versionId - a.versionId;
            })
            .map((v) => {
                let changeLabel = 'Thủ công';
                if (v.changeType === ConfigVersionType.AI_GENERATED) changeLabel = 'AI tạo';
                if (v.changeType === ConfigVersionType.ROLLBACK) changeLabel = 'Khôi phục';

                const text = v.isActive
                    ? 'Current Version'
                    : `Version ${v.versionId} - ${changeLabel}`;

                return {
                    value: v.versionId,
                    label: (
                        <CustomSpace size={6} className="w-full">
                            <Icon
                                icon="lucide:clock"
                                className="w-3.5 h-3.5 text-hub-subtitle shrink-0"
                            />
                            <span
                                className={
                                    v.isActive
                                        ? 'font-bold text-hub-primary'
                                        : 'font-medium text-hub-title'
                                }
                            >
                                {text}
                            </span>
                        </CustomSpace>
                    ),
                };
            });
    }, [versions]);

    switch (activeTab) {
        case 'config':
            return (
                <CustomFlex
                    justify="space-between"
                    align="center"
                    className="w-full flex-wrap gap-2"
                >
                    <CustomFlex align="center" gap="small">
                        {!isDraft && !!versions.length && (
                            <CustomSelect
                                className="w-64"
                                value={selectedVersion?.versionId}
                                options={versionOptions}
                                disabled={versionOptions.length <= 1}
                                onChange={onSelectVersion}
                                dropdownStyle={{ width: 280 }}
                            />
                        )}
                    </CustomFlex>
                    <CustomFlex align="center" gap="small">
                        {!isDraft && !!versions.length && (
                            <CustomPopconfirm
                                okText="Khôi phục"
                                cancelText="Hủy"
                                title={`Khôi phục phiên bản v${selectedVersion?.versionId}?`}
                                description="Cấu hình hiện tại của tính năng sẽ được thay thế bằng snapshot này."
                                onConfirm={() => onRollback(selectedVersion?.versionId)}
                            >
                                <CustomButton
                                    disabled={!isViewingHistory}
                                    type="primary"
                                    icon={<Icon icon="lucide:rotate-ccw" />}
                                    loading={isRollingBack}
                                    className={
                                        isViewingHistory
                                            ? 'bg-amber-600 hover:bg-amber-500 border-amber-600 text-white'
                                            : undefined
                                    }
                                >
                                    Khôi phục
                                </CustomButton>
                            </CustomPopconfirm>
                        )}
                        <CustomButton
                            type="primary"
                            disabled={isViewingHistory}
                            loading={isSaving}
                            onClick={() => form.submit()}
                            icon={<Icon icon="lucide:save" />}
                        >
                            Lưu cấu hình
                        </CustomButton>
                        <CustomButton onClick={onClose} disabled={isSaving || isRollingBack}>
                            Hủy
                        </CustomButton>
                    </CustomFlex>
                </CustomFlex>
            );
        case 'test':
        default:
            return (
                <CustomFlex justify="end" gap="small">
                    <CustomButton onClick={onClose}>Đóng</CustomButton>
                </CustomFlex>
            );
    }
};
```

### 7. `[NEW]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal/index.tsx`
> **Action**: Tạo component Orchestrator `FeatureSettingModal` trong thư mục `FeatureSettingModal/`.

```typescript
'use client';

import { useState } from 'react';
import { CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useFeatureVersionManager } from '../../hooks';
import type { FeatureModalTab, IDataProviderFeature } from '../../types';
import { getFeatureDefinition } from '../../utils';
import { FeatureTestTab } from '../FeatureTestTab';
import { FeatureModalFooter } from './FeatureModalFooter';
import { FeatureModalHeader } from './FeatureModalHeader';

export type FeatureSettingModalProps = {
    open: boolean;
    activeTab: FeatureModalTab;
    feature: IDataProviderFeature;
    onClose: () => void;
    onSuccess: () => void;
    onTabChange: (tab: FeatureModalTab) => void;
};

export const FeatureSettingModal = ({
    open,
    activeTab,
    feature,
    onClose,
    onSuccess,
    onTabChange,
}: FeatureSettingModalProps) => {
    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const isDraft = !feature.id;
    const def = getFeatureDefinition(feature.type);
    const ConfigComponent = def?.ConfigComponent;

    const {
        versions,
        selectedVersion,
        isViewingHistory,
        isRollingBack,
        authorName,
        setSelectedVersionId,
        handleRollback,
    } = useFeatureVersionManager({
        open,
        feature,
        form,
        onSuccess,
    });

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-2">
                    <Icon icon="lucide:settings" className="w-4 h-4" />
                    Cấu hình
                </span>
            ),
            children: ConfigComponent ? (
                <ConfigComponent
                    feature={feature}
                    form={form}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onClose={onClose}
                    onSuccess={onSuccess}
                    setIsSaving={setIsSaving}
                />
            ) : (
                <div className="p-6 text-center text-hub-subtitle">
                    Chưa có biểu mẫu cấu hình cho tính năng này.
                </div>
            ),
        },
        ...(!isDraft
            ? [
                  {
                      key: 'test',
                      label: (
                          <span className="flex items-center gap-2">
                              <Icon icon="lucide:flask-conical" className="w-4 h-4" />
                              Thử nghiệm
                          </span>
                      ),
                      children: <FeatureTestTab feature={feature} />,
                  },
              ]
            : []),
    ];

    return (
        <CustomModal
            open={open}
            width={1000}
            footer={
                <FeatureModalFooter
                    form={form}
                    isDraft={isDraft}
                    onClose={onClose}
                    versions={versions}
                    isSaving={isSaving}
                    activeTab={activeTab}
                    isRollingBack={isRollingBack}
                    onRollback={handleRollback}
                    selectedVersion={selectedVersion}
                    isViewingHistory={isViewingHistory}
                    onSelectVersion={setSelectedVersionId}
                />
            }
            onCancel={onClose}
            title={
                <FeatureModalHeader
                    feature={feature}
                    isDraft={isDraft}
                    authorName={authorName}
                    selectedVersion={selectedVersion}
                />
            }
        >
            <CustomTabs
                items={tabItems}
                activeKey={activeTab}
                onChange={(key) => onTabChange(key as FeatureModalTab)}
            />
        </CustomModal>
    );
};
```

### 8. `[DELETE]` `src/app/(root)/scraping/features/[dataProviderId]/components/FeatureSettingModal.tsx`
> **Action**: Xóa file `FeatureSettingModal.tsx` đơn lẻ cũ.

### 9. `[MODIFY]` `src/app/(root)/scraping/features/[dataProviderId]/components/index.ts`
> **Action**: Cập nhật re-export `FeatureSettingModal` từ thư mục con.

```diff
@@ -1,8 +1,8 @@
 export * from './CreateFeatureModal';
 export * from './FeatureCard';
 export * from './FeatureHistoryModal';
-export * from './FeatureSettingModal';
+export * from './FeatureSettingModal';
 export * from './FeatureTestTab';
 export * from './ScrapingConfigForm';
 export * from './SearchConfigForm';
```

## Section 5. Test Cases & Verification
- **Automated Tests / Linter**:
  - `npx tsc --noEmit`
  - `npx eslint "src/app/(root)/scraping/features/[dataProviderId]/**"`
- **Manual Verification**:
  1. Mở modal cấu hình: xác nhận Header và Footer hiển thị chính xác.
  2. Thử nghiệm đổi version, rollback, lưu cấu hình và tab thử nghiệm.
