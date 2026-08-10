# Kế hoạch Tách `DataProviderSettingModal` Thành 2 Modal Riêng Biệt & Đưa Phần Dùng Chung Ra Ngoài

Kế hoạch này đề xuất phương án tách [DataProviderSettingModal](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/index.tsx) thành **2 Modal độc lập** (`DataProviderTargetModal` và `DataProviderSearchModal`), đồng thời đưa các thành phần dùng chung (`TestConfigTab`, `types.ts`, `hooks.ts`) ra thư mục bên ngoài theo đúng yêu cầu tinh chỉnh của người dùng.

---

## Section 1. Current state (Trạng thái hiện tại)

### Flow thực thi hiện tại
Hiện tại, `DataProviderSettingModal` đang cố gắng xử lý cả 2 loại cấu hình ("Cào dữ liệu" - `target` và "Tìm kiếm" - `search`) trong cùng một Modal thông qua cờ điều kiện `configType`.

### Các file và symbol tham gia
- [DataProviderSettingModal/index.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/index.tsx): Modal chung nhận prop `configType`.
- [TargetConfigTab.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/TargetConfigTab.tsx): Form cấu hình hàm cào.
- [SearchConfigTab.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/SearchConfigTab.tsx): Form cấu hình hàm tìm kiếm.
- [TestConfigTab.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/TestConfigTab.tsx): Tab chạy thử nghiệm parser.
- [hooks.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts): Chứa custom hook `useDataProviderSettingModal` xử lý rẽ nhánh logic API test và API save.
- [types.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/types.ts): Chứa các interface khai báo props.

### Hạn chế của thiết kế gộp hiện tại
1. **Phức tạp về mặt logic**: Cả Hook và Component đều chứa nhiều câu lệnh rẽ nhánh `if (configType === 'search')`.
2. **Khác biệt về API contract của Backend**: 
   - Hàm Cào (Target): Gọi `POST parsers/test-parser-function` và `PUT data-providers/:id/target-config`.
   - Hàm Tìm kiếm (Search): Gọi `POST data-providers/test-search-function` và `PUT data-providers/:id/search-config` với DTO hoàn toàn khác (`TestSearchFunctionRequestDto` & `UpdateSearchConfigRequestDto`).
3. **Phụ thuộc lồng nhau**: Tab Thử nghiệm (`TestConfigTab`) bị nằm sâu trong thư mục `DataProviderSettingModal`, khó tái sử dụng độc lập.

---

## Section 2. Design (Phương án thực hiện)

### Phương án: Tách 2 Modal Độc Lập & Đưa Thành Phần Dùng Chung Ra Ngoài (Đề xuất)

- **Cách hoạt động**:
  1. **Đưa các thành phần dùng chung ra ngoài**:
     - Sub-component **[TestConfigTab.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/TestConfigTab.tsx)** được đưa ra ngoài thư mục `components/` để cả 2 Modal dùng chung.
     - Các Types & Interfaces được khai báo tại **[types.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/types.ts)**.
     - Tách Custom Hooks trong **[hooks.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/hooks.ts)** thành:
       - `useDataProviderTargetModal`: Xử lý riêng cho Modal Cào (Target).
       - `useDataProviderSearchModal`: Xử lý riêng cho Modal Tìm kiếm (Search) (khớp 100% Backend DTO).
  2. **Tạo 2 Modal riêng biệt**:
     - **`DataProviderTargetModal`**: Chuyên trách cấu hình hàm cào dữ liệu (`targetConfig`).
     - **`DataProviderSearchModal`**: Chuyên trách cấu hình hàm tìm kiếm (`searchConfig`).
  3. **Tạo Facade Wrapper `DataProviderSettingModal`**:
     - Giữ file [DataProviderSettingModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal.tsx) đóng vai trò điều hướng mỏng (Thin wrapper). Nếu `configType === 'search'` sẽ render `DataProviderSearchModal`, ngược lại render `DataProviderTargetModal`.
     - Giúp trang [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx) không cần sửa code cũ mà vẫn tận dụng được 2 Modal riêng biệt.

- **Ưu điểm**:
  - Mã nguồn sạch sẽ, không còn rẽ nhánh rườm rà.
  - Tương thích 100% với DTO của Backend NestJS (`data-providers/test-search-function` & `data-providers/:id/search-config`).
  - Phân tách rõ ràng trách nhiệm của từng Modal và thành phần dùng chung.

---

## Section 3. Implementation architecture (Kiến trúc triển khai)

### Cấu trúc thư mục mục tiêu

```text
src/app/(root)/scraping/data-providers/
├── hooks.ts                             [MODIFY] (Tách useDataProviderTargetModal & useDataProviderSearchModal)
├── types.ts                             [MODIFY] (Thêm DataProviderTargetModalProps & DataProviderSearchModalProps)
└── components/
    ├── DataProviderFormModal.tsx        (Modal tạo/sửa nhà cung cấp - giữ nguyên)
    ├── DataProviderTargetModal.tsx      [NEW] (Modal cấu hình cào dữ liệu)
    ├── DataProviderSearchModal.tsx      [NEW] (Modal cấu hình tìm kiếm dữ liệu)
    ├── DataProviderSettingModal.tsx     [MODIFY] (Thin facade wrapper điều hướng sang Target/Search Modal)
    ├── TestConfigTab.tsx                [NEW] (Sub-component dùng chung cho tab Thử nghiệm)
    ├── DataProviderSettingModal/        [DELETE] (Xóa thư mục lồng cũ)
    └── index.ts                         [MODIFY] (Export các Modals & Hooks)
```

---

## Section 4. Implementation code examples (Ví dụ mã nguồn triển khai)

#### [NEW] `src/app/(root)/scraping/data-providers/components/TestConfigTab.tsx`

**Overview:** Component dùng chung render Tab thử nghiệm URL / HTML Content cho cả Target Modal và Search Modal.

```tsx
'use client';

import { CodeDisplay } from '@/components/common';
import { CustomButton, CustomCard, CustomForm, CustomInput, CustomSwitch, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { TestConfigTabProps } from '../types';

export const TestConfigTab = ({
    form,
    title = 'Thử nghiệm parser',
    inputLabel = 'URL thử nghiệm',
    isLoading,
    isTestHtmlContent,
    testResultData,
    htmlContentString,
    onTestHtmlContentChange,
    onTestParser,
}: TestConfigTabProps) => {
    return (
        <div className="space-y-4">
            <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                    <Icon icon="lucide:flask-conical" className="text-hub-primary shrink-0" />
                    <span>{title}</span>
                </h4>

                <CustomForm.Item name="testUrl" label={inputLabel} className="!mb-3">
                    <CustomInput placeholder="https://shopee.vn/product/123" />
                </CustomForm.Item>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <CustomSwitch checked={isTestHtmlContent} onChange={onTestHtmlContentChange} />
                        <span className="text-sm text-hub-muted">Sử dụng HTML content mẫu thay cho URL</span>
                    </div>

                    <CustomButton type="primary" loading={isLoading} onClick={onTestParser} icon={<Icon icon="lucide:play" />} className="w-full sm:w-auto">
                        Chạy thử nghiệm
                    </CustomButton>
                </div>

                {isTestHtmlContent && (
                    <CustomForm.Item name="htmlContentString" label="Nội dung HTML mẫu" className="!mb-0 mt-3">
                        <CodeDisplay expanded language="html" code={htmlContentString || ''} onCodeChange={(newCode) => form.setFieldValue('htmlContentString', newCode)} />
                    </CustomForm.Item>
                )}
            </div>

            {testResultData && (
                <CustomCard className="border-hub-border bg-hub-section/20 shadow-xs rounded-xl">
                    <CustomTypography.Title level={5} className="!mb-3 flex items-center gap-2">
                        <Icon icon="lucide:check-circle-2" className="text-emerald-500 shrink-0" />
                        <span>Kết quả trích xuất:</span>
                    </CustomTypography.Title>
                    <CodeDisplay isDisplayLanguage language="json" title="Dữ liệu kết quả" code={JSON.stringify(testResultData, null, 2)} />
                </CustomCard>
            )}
        </div>
    );
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderTargetModal.tsx`

**Overview:** Modal cấu hình riêng cho hàm cào dữ liệu (`targetConfig`).

```tsx
'use client';

import { CustomButton, CustomFlex, CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useDataProviderTargetModal } from '../hooks';
import type { DataProviderTargetModalProps } from '../types';
import { TestConfigTab } from './TestConfigTab';
import { TargetConfigTab } from './TargetConfigTab'; // hoặc render trực tiếp

export const DataProviderTargetModal = (props: DataProviderTargetModalProps) => {
    const { open, record, onClose } = props;
    const {
        form,
        isSaving,
        isLoading,
        activeTab,
        setActiveTab,
        isTestHtmlContent,
        setIsTestHtmlContent,
        testResultData,
        htmlContentString,
        functionGenerator,
        handleScraperServiceChange,
        handleTestParser,
        handleSaveConfig,
    } = useDataProviderTargetModal(props);

    // Render CustomModal & CustomTabs riêng cho Target Config
    return (
        <CustomModal zIndex={1100} modalProps={{ open, width: 920, onCancel: onClose, title: `Cấu hình hàm cào: ${record?.name || ''}` }}>
            {/* CustomForm & Tabs */}
        </CustomModal>
    );
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSearchModal.tsx`

**Overview:** Modal cấu hình riêng cho hàm tìm kiếm (`searchConfig`), truyền đúng DTO sang Backend.

```tsx
'use client';

import { CustomButton, CustomFlex, CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { useDataProviderSearchModal } from '../hooks';
import type { DataProviderSearchModalProps } from '../types';
import { TestConfigTab } from './TestConfigTab';

export const DataProviderSearchModal = (props: DataProviderSearchModalProps) => {
    const { open, record, onClose } = props;
    const {
        form,
        isSaving,
        isLoading,
        activeTab,
        setActiveTab,
        isTestHtmlContent,
        setIsTestHtmlContent,
        testResultData,
        htmlContentString,
        functionGenerator,
        handleTestSearch,
        handleSaveSearchConfig,
    } = useDataProviderSearchModal(props);

    // Render CustomModal & CustomTabs riêng cho Search Config
    return (
        <CustomModal zIndex={1100} modalProps={{ open, width: 920, onCancel: onClose, title: `Cấu hình hàm tìm kiếm: ${record?.name || ''}` }}>
            {/* CustomForm & Tabs */}
        </CustomModal>
    );
};
```

---

#### [MODIFY] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal.tsx`

**Overview:** Thin wrapper facade component chuyển tiếp props sang `DataProviderTargetModal` hoặc `DataProviderSearchModal`.

```tsx
'use client';

import type { DataProviderSettingModalProps } from '../types';
import { DataProviderSearchModal } from './DataProviderSearchModal';
import { DataProviderTargetModal } from './DataProviderTargetModal';

export const DataProviderSettingModal = (props: DataProviderSettingModalProps) => {
    if (props.configType === 'search') {
        return <DataProviderSearchModal {...props} />;
    }
    return <DataProviderTargetModal {...props} />;
};
```

---

## Section 5. Test cases (Kịch bản kiểm thử)

### Automated Verification
```bash
cmd /c npx tsc --noEmit
```

### Manual Verification
1. Click nút Cấu hình cào (Target) -> Mở `DataProviderTargetModal` -> Kiểm tra form và chạy thử nghiệm parser.
2. Click nút Cấu hình tìm kiếm (Search) -> Mở `DataProviderSearchModal` -> Kiểm tra form và chạy thử nghiệm search (`POST data-providers/test-search-function`).
