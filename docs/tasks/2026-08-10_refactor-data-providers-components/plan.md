# Kế hoạch Refactor `data-providers/components` dạng Folder

Kế hoạch này chi tiết hóa việc tái cấu trúc (refactor) thư mục [components](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components) của tính năng Data Providers. Thư mục hiện tại chứa component [DataProviderSettingModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal.tsx) bị monolith (hơn 700 dòng mã nguồn) kết hợp quá nhiều trách nhiệm: quản lý form state, gọi API chạy thử nghiệm parser, lưu cấu hình và render giao diện 3 tab phức tạp. 

Mục tiêu refactor là tách nhỏ component thành cấu trúc dạng thư mục (Folder-based pattern) chuẩn hóa theo định hướng trong quy chuẩn [component-architecture.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/references/component-architecture.md).

---

## Section 1. Current state (Trạng thái hiện tại)

### Flow thực thi & Cấu trúc hiện tại
Hiện tại, thư mục `components` của Data Providers có cấu trúc flat:
```text
src/app/(root)/scraping/data-providers/components/
├── DataProviderFormModal.tsx      (123 lines - Modal tạo/sửa Data Provider)
├── DataProviderSettingModal.tsx   (719 lines - Modal cấu hình hàm cào & tìm kiếm)
└── index.ts                       (Barrel export file)
```

### Các file và symbol tham gia
- [DataProviderSettingModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderSettingModal.tsx):
  - State: `form`, `isSaving`, `isLoading`, `activeTab`, `isTestHtmlContent`, `testResultData`, `testUrl`, `htmlContentString`, `functionGenerator`.
  - Handlers: `handleScraperServiceChange`, `handleTestParser`, `handleSaveConfig`.
  - Renderers: `renderTargetConfigFields`, `renderSearchConfigFields`, `renderConfigTab`, `renderTestTab`, `renderTitle`, `renderFooter`.
- [DataProviderFormModal.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx):
  - Form modal đơn giản quản lý thông tin tên, mã, URL cơ sở, nhà cung cấp cha.
- [index.ts](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/components/index.ts):
  - Export `DataProviderFormModal` và `DataProviderSettingModal`.
- [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx):
  - Import cả 2 modal từ `./components` để render trên trang danh sách nhà cung cấp.

### Vấn đề cần giải quyết
1. **Vi phạm SRP (Single Responsibility Principle)**: `DataProviderSettingModal.tsx` ôm đồm xử lý state, side-effects (mutation API test/save), validate form và render toàn bộ UI của 2 loại cấu hình (Target vs Search) cùng giao diện Thử nghiệm (Test tab).
2. **Vượt ngưỡng dung lượng component**: File dài 719 dòng, vượt xa định hướng 200 dòng/file đối với React component.
3. **Khó bảo trì và mở rộng**: Khi cần bổ sung field mới cho Target Config hoặc thay đổi giao diện Test tab, dev phải chỉnh sửa file monolith lớn, dễ dẫn đến rủi ro sụt giảm hiệu năng hoặc regression bug.

---

## Section 2. Design (Phương án thực hiện)

### Phương án 1: Folder-based Modular Component & Custom Hook (Đề xuất)
- **Cách hoạt động**: 
  - Tách `DataProviderSettingModal` thành một thư mục riêng `DataProviderSettingModal/`.
  - Trích xuất toàn bộ logic form, state management và các API mutation handler (`handleTestParser`, `handleSaveConfig`, `handleScraperServiceChange`) ra custom hook `useDataProviderSettingModal.ts`.
  - Tách các tab giao diện thành các sub-components riêng biệt trong thư mục `components/`: `TargetConfigTab.tsx`, `SearchConfigTab.tsx`, `TestConfigTab.tsx`.
  - Chuẩn hóa `DataProviderFormModal` thành thư mục `DataProviderFormModal/index.tsx` để đồng bộ kiến trúc folder.
- **Ưu điểm**:
  - Tách biệt hoàn toàn Business Logic (Hook) và UI Presentation (Components).
  - Mỗi file component chỉ dài khoảng 80-150 dòng, cực kỳ dễ đọc và bảo trì.
  - Tương thích 100% với quy chuẩn [component-architecture.md](file:///d:/Sources/Personal/only-one-fe/.agents/skills/only-one-nextjs-development/references/component-architecture.md).
  - Giữ nguyên giao diện người dùng và không làm gãy import ở [page.tsx](file:///d:/Sources/Personal/only-one-fe/src/app/(root)/scraping/data-providers/page.tsx).
- **Nhược điểm**: Tăng số lượng file trong dự án.
- **Đánh giá rủi ro**: Rất thấp, không ảnh hưởng API contract hay giao diện bên ngoài.

### Phương án 2: Tách sub-components dạng file phẳng trong thư mục root `components/`
- **Cách hoạt động**: Giữ nguyên `DataProviderSettingModal.tsx` tại vị trí cũ và tạo các file `DataProviderTargetConfigTab.tsx`, `DataProviderSearchConfigTab.tsx` trực tiếp tại thư mục `components/`.
- **Ưu điểm**: Không cần di chuyển vị trí file cũ.
- **Nhược điểm**: Thư mục `components/` bị phân tán, lộn xộn các sub-components vốn chỉ thuộc về duy nhất một modal.
- **Lý do không chọn**: Vi phạm nguyên tắc đóng gói (Encapsulation) của component phức tạp.

> [!TIP]
> **Khuyến nghị**: Lựa chọn **Phương án 1** để đảm bảo tính sạch đẹp của codebase, chuẩn hóa kiến trúc folder theo nguyên tắc Modular Component.

---

## Section 3. Implementation architecture (Kiến trúc triển khai)

### Cấu trúc cây thư mục mục tiêu

```text
src/app/(root)/scraping/data-providers/components/
├── DataProviderFormModal/
│   └── index.tsx                          [NEW] (Chuyển & chuẩn hóa từ DataProviderFormModal.tsx)
├── DataProviderSettingModal/
│   ├── components/
│   │   ├── SearchConfigTab.tsx            [NEW] (Sub-component form cấu hình hàm tìm kiếm)
│   │   ├── TargetConfigTab.tsx            [NEW] (Sub-component form cấu hình hàm cào)
│   │   └── TestConfigTab.tsx              [NEW] (Sub-component tab thử nghiệm parser)
│   ├── hooks/
│   │   └── useDataProviderSettingModal.ts [NEW] (Hook quản lý state & API handlers)
│   ├── index.tsx                          [NEW] (Component chính dựng Modal & CustomTabs)
│   └── types.ts                           [NEW] (Interfaces & Types cho Setting Modal)
├── DataProviderFormModal.tsx              [DELETE] (Xóa sau khi chuyển sang folder)
├── DataProviderSettingModal.tsx           [DELETE] (Xóa sau khi tách thành folder)
└── index.ts                               [MODIFY] (Cập nhật re-export)
```

### UI Wireframe (Giao diện Modal sau khi refactor)

```text
+-----------------------------------------------------------------------+
|  [Icon] Cấu hình hàm cào / tìm kiếm: Provider Name               [X]  |
+-----------------------------------------------------------------------+
|  [ Tab 1: Cấu hình & Script ]    [ Tab 2: Thử nghiệm ]               |
|  =============================   -------------------                  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | <TargetConfigTab />  HOẶC  <SearchConfigTab />                  |  |
|  | - Service Select & Main Selectors / Search URL Pattern          |  |
|  | - Limits & Retry Attempts / Delay                               |  |
|  | - Switches (Get Parent Element, Stealth Mode, Cloudflare)       |  |
|  | - CodeDisplay (Editor chỉnh sửa functionGenerator)              |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | <TestConfigTab /> (khi chọn Tab Thử nghiệm)                      |  |
|  | - Input Test URL & Switch HTML sample                           |  |
|  | - Button Chạy thử nghiệm                                       |  |
|  | - CodeDisplay HTML Sample / Result JSON Card                    |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
|                                              [ Hủy ] [ Lưu cấu hình ] |
+-----------------------------------------------------------------------+
```

---

## Section 4. Implementation code examples (Ví dụ mã nguồn triển khai)

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/types.ts`

**Overview:** Định nghĩa kiểu dữ liệu Props cho Modal và các Sub-components con.

**Symbols:** `SettingConfigType`, `DataProviderSettingModalProps`, `TargetConfigTabProps`, `SearchConfigTabProps`, `TestConfigTabProps`

```ts
import type { DataProviderRecord } from '@/app/(root)/scraping/data-providers/types';
import type { FormInstance } from 'antd';

export type SettingConfigType = 'target' | 'search';

export interface DataProviderSettingModalProps {
    open: boolean;
    configType?: SettingConfigType;
    record: DataProviderRecord | null;
    onClose: () => void;
    onSuccess?: () => void;
}

export interface TargetConfigTabProps {
    form: FormInstance;
    functionGenerator?: string;
    onScraperServiceChange: (value: any) => void;
}

export interface SearchConfigTabProps {
    form: FormInstance;
    functionGenerator?: string;
}

export interface TestConfigTabProps {
    form: FormInstance;
    configType: SettingConfigType;
    isLoading: boolean;
    isTestHtmlContent: boolean;
    testResultData: Record<string, unknown> | null;
    onTestHtmlContentChange: (checked: boolean) => void;
    onTestParser: () => void;
}
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/hooks/useDataProviderSettingModal.ts`

**Overview:** Encapsulate toàn bộ form logic, side-effects, API mutation handlers cho Setting Modal.

**Symbols:** `useDataProviderSettingModal`

**Design pattern:** Custom Hook Pattern — Tách biệt hoàn toàn UI rendering và State Management.

```ts
import { useEffect, useState } from 'react';
import { CustomForm } from '@/components/custom-antd';
import { useMainContext } from '@/contexts/MainContext';
import { useCustomMutationData } from '@/hooks';
import { MessageType, NotificationType, ScraperServiceEnum } from '@/enums';
import {
    DEFAULT_API_FUNCTION_GENERATOR,
    DEFAULT_HTML_CONTENT_STRING,
    DEFAULT_PARSER_FUNCTION_GENERATOR,
    DEFAULT_SEARCH_FUNCTION_GENERATOR,
} from '@/constants';
import type { DataProviderSettingModalProps } from '../types';
import type { NBaseApi, NDataProvider } from '@/interfaces';

export const useDataProviderSettingModal = ({
    open,
    configType = 'target',
    record,
    onClose,
    onSuccess,
}: DataProviderSettingModalProps) => {
    const { handleNotification } = useMainContext();
    const { handleCustomMutationData } = useCustomMutationData();

    const [form] = CustomForm.useForm();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('config');
    const [isTestHtmlContent, setIsTestHtmlContent] = useState<boolean>(false);
    const [testResultData, setTestResultData] = useState<Record<string, unknown> | null>(null);

    const testUrl = CustomForm.useWatch('testUrl', form);
    const htmlContentString = CustomForm.useWatch('htmlContentString', form);

    const functionGeneratorField =
        configType === 'search'
            ? ['searchConfig', 'functionGenerator']
            : ['targetConfig', 'functionGenerator'];
    const functionGenerator = CustomForm.useWatch(functionGeneratorField, form);

    useEffect(() => {
        if (open && record) {
            if (configType === 'search') {
                const initialSearchConfig = record.searchConfig ?? {
                    searchUrlPattern: `${record.baseUrl || ''}/search?q={query}`,
                    queryPlaceholder: '{query}',
                    mainContentSelector: '',
                    resultSelector: '',
                    maxResults: 10,
                    isGetParentElement: false,
                    functionGenerator: DEFAULT_SEARCH_FUNCTION_GENERATOR,
                };

                form.setFieldsValue({
                    searchConfig: initialSearchConfig,
                    testUrl: initialSearchConfig.searchUrlPattern || record.baseUrl || '',
                    htmlContentString: DEFAULT_HTML_CONTENT_STRING,
                });
            } else {
                const initialTargetConfig = record.targetConfig ?? {
                    maxResults: 10,
                    retryDelay: 1000,
                    retryAttempts: 3,
                    mainContentSelector: '',
                    isGetParentElement: false,
                    functionGenerator:
                        record.scraperService === ScraperServiceEnum.GENERIC
                            ? DEFAULT_PARSER_FUNCTION_GENERATOR
                            : DEFAULT_API_FUNCTION_GENERATOR,
                };

                form.setFieldsValue({
                    scraperService: record.scraperService || ScraperServiceEnum.API,
                    targetConfig: initialTargetConfig,
                    testUrl: record.baseUrl || '',
                    htmlContentString: DEFAULT_HTML_CONTENT_STRING,
                });
            }
            setTestResultData(null);
            setActiveTab('config');
        } else {
            form.resetFields();
            setTestResultData(null);
        }
    }, [open, record, configType, form]);

    const handleScraperServiceChange = (value: ScraperServiceEnum) => {
        if (configType === 'search') return;
        const currentGenerator = form.getFieldValue(['targetConfig', 'functionGenerator']);
        if (!currentGenerator) {
            if (value === ScraperServiceEnum.GENERIC) {
                form.setFieldValue(['targetConfig', 'functionGenerator'], DEFAULT_PARSER_FUNCTION_GENERATOR);
            } else if (value === ScraperServiceEnum.API) {
                form.setFieldValue(['targetConfig', 'functionGenerator'], DEFAULT_API_FUNCTION_GENERATOR);
            }
        }
    };

    const handleTestParser = async () => { /* Giữ nguyên logic test parser */ };
    const handleSaveConfig = async () => { /* Giữ nguyên logic save config */ };

    return {
        form,
        isSaving,
        isLoading,
        activeTab,
        setActiveTab,
        isTestHtmlContent,
        setIsTestHtmlContent,
        testResultData,
        functionGenerator,
        handleScraperServiceChange,
        handleTestParser,
        handleSaveConfig,
    };
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/components/TargetConfigTab.tsx`

**Overview:** Sub-component render các ô nhập liệu cấu hình hàm cào (Target Config).

**Symbols:** `TargetConfigTab`

```tsx
import { CodeDisplay } from '@/components/common';
import { CustomCol, CustomForm, CustomInput, CustomInputNumber, CustomRow, CustomSelect, CustomSwitch } from '@/components/custom-antd';
import { ScraperServiceEnum } from '@/enums';
import { Icon } from '@iconify/react';
import type { TargetConfigTabProps } from '../types';

export const TargetConfigTab = ({ form, functionGenerator, onScraperServiceChange }: TargetConfigTabProps) => {
    const configSection = (
        <div className="bg-hub-section/20 border border-hub-border/60 rounded-xl p-3 sm:p-4">
            <h4 className="text-sm font-semibold text-hub-title mb-3 flex items-center gap-2">
                <Icon icon="lucide:settings-2" className="text-hub-primary shrink-0" />
                <span>Cấu hình chung & Selectors</span>
            </h4>
            <CustomRow gutter={[16, 12]}>
                <CustomCol xs={24} md={12}>
                    <CustomForm.Item name="scraperService" label="Dịch vụ Scraper" rules={[{ required: true, message: 'Vui lòng chọn dịch vụ scraper' }]} className="!mb-0">
                        <CustomSelect placeholder="Chọn dịch vụ scraper" onChange={onScraperServiceChange} options={[
                            { label: 'API Scraper', value: ScraperServiceEnum.API },
                            { label: 'Generic HTML Parser', value: ScraperServiceEnum.GENERIC },
                            { label: 'Local Folder Scraper', value: ScraperServiceEnum.LOCAL },
                        ]} />
                    </CustomForm.Item>
                </CustomCol>
                <CustomCol xs={24} md={12}>
                    <CustomForm.Item name={['targetConfig', 'mainContentSelector']} label="Selector nội dung chính" className="!mb-0">
                        <CustomInput placeholder="Ví dụ: #product-detail, .item-list" />
                    </CustomForm.Item>
                </CustomCol>
            </CustomRow>
        </div>
    );

    return (
        <div className="space-y-4">
            {configSection}
            {/* Limit section, Switches section, CodeDisplay section */}
        </div>
    );
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/components/SearchConfigTab.tsx`

**Overview:** Sub-component render các ô nhập liệu cấu hình hàm tìm kiếm (Search Config).

**Symbols:** `SearchConfigTab`

```tsx
import { CodeDisplay } from '@/components/common';
import { CustomCol, CustomForm, CustomInput, CustomInputNumber, CustomRow, CustomSwitch } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { SearchConfigTabProps } from '../types';

export const SearchConfigTab = ({ form, functionGenerator }: SearchConfigTabProps) => {
    return (
        <div className="space-y-4">
            {/* Search URL Pattern, Selectors, Switches, CodeDisplay */}
        </div>
    );
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/components/TestConfigTab.tsx`

**Overview:** Sub-component render giao diện thử nghiệm parser (Test Tab), nhận URL/HTML mẫu và hiển thị JSON kết quả.

**Symbols:** `TestConfigTab`

```tsx
import { CodeDisplay } from '@/components/common';
import { CustomButton, CustomCard, CustomForm, CustomInput, CustomSwitch, CustomTypography } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import type { TestConfigTabProps } from '../types';

export const TestConfigTab = ({
    form,
    configType,
    isLoading,
    isTestHtmlContent,
    testResultData,
    onTestHtmlContentChange,
    onTestParser,
}: TestConfigTabProps) => {
    return (
        <div className="space-y-4">
            {/* Form testUrl, switch HTML content sample, button Run Test */}
        </div>
    );
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal/index.tsx`

**Overview:** Component chính của Modal, lắp ghép CustomTabs cùng các sub-components.

**Symbols:** `DataProviderSettingModal`

```tsx
'use client';

import { CustomButton, CustomFlex, CustomForm, CustomModal, CustomTabs } from '@/components/custom-antd';
import { Icon } from '@iconify/react';
import { TargetConfigTab } from './components/TargetConfigTab';
import { SearchConfigTab } from './components/SearchConfigTab';
import { TestConfigTab } from './components/TestConfigTab';
import { useDataProviderSettingModal } from './hooks/useDataProviderSettingModal';
import type { DataProviderSettingModalProps } from './types';

export const DataProviderSettingModal = (props: DataProviderSettingModalProps) => {
    const { open, configType = 'target', record, onClose } = props;
    const {
        form,
        isSaving,
        isLoading,
        activeTab,
        setActiveTab,
        isTestHtmlContent,
        setIsTestHtmlContent,
        testResultData,
        functionGenerator,
        handleScraperServiceChange,
        handleTestParser,
        handleSaveConfig,
    } = useDataProviderSettingModal(props);

    const titleContent = (
        <div className="flex items-center gap-2 text-sm sm:text-base font-semibold truncate pr-4">
            <Icon icon={configType === 'search' ? 'lucide:search' : 'lucide:code-2'} className="text-hub-primary text-lg sm:text-xl shrink-0" />
            <span className="truncate">{configType === 'search' ? `Cấu hình hàm tìm kiếm: ${record?.name || ''}` : `Cấu hình hàm cào: ${record?.name || ''}`}</span>
        </div>
    );

    const footerContent = (
        <CustomFlex justify="end" gap={8} className="w-full flex-row">
            <CustomButton onClick={onClose} disabled={isSaving || isLoading} className="flex-1 sm:flex-none">Hủy</CustomButton>
            <CustomButton type="primary" loading={isSaving} disabled={isLoading} onClick={handleSaveConfig} icon={<Icon icon="lucide:save" />} className="flex-1 sm:flex-none">Lưu cấu hình</CustomButton>
        </CustomFlex>
    );

    const tabItems = [
        {
            key: 'config',
            label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <Icon icon="lucide:sliders-horizontal" className="shrink-0" />
                    <span>Cấu hình & Script</span>
                </span>
            ),
            children: configType === 'search' ? (
                <SearchConfigTab form={form} functionGenerator={functionGenerator} />
            ) : (
                <TargetConfigTab form={form} functionGenerator={functionGenerator} onScraperServiceChange={handleScraperServiceChange} />
            ),
        },
        {
            key: 'test',
            label: (
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                    <Icon icon="lucide:flask-conical" className="shrink-0" />
                    <span>Thử nghiệm</span>
                </span>
            ),
            children: (
                <TestConfigTab
                    form={form}
                    configType={configType}
                    isLoading={isLoading}
                    isTestHtmlContent={isTestHtmlContent}
                    testResultData={testResultData}
                    onTestHtmlContentChange={setIsTestHtmlContent}
                    onTestParser={handleTestParser}
                />
            ),
        },
    ];

    return (
        <CustomModal zIndex={1100} modalProps={{ open, width: 920, onCancel: onClose, title: titleContent, footer: footerContent }}>
            <CustomForm form={form} layout="vertical" className="pt-1 pb-2">
                <CustomTabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
            </CustomForm>
        </CustomModal>
    );
};
```

---

#### [NEW] `src/app/(root)/scraping/data-providers/components/DataProviderFormModal/index.tsx`

**Overview:** Chuyển mã nguồn từ `DataProviderFormModal.tsx` vào file `index.tsx` bên trong thư mục `DataProviderFormModal`.

**Symbols:** `DataProviderFormModal`

*Không cần đổi logic, chỉ di chuyển vị trí file.*

---

#### [MODIFY] `src/app/(root)/scraping/data-providers/components/index.ts`

**Overview:** Cập nhật re-export barrel file trỏ đến các thư mục component mới.

```ts
export { ProcessScrapeData } from '@/app/(root)/scraping/scraping-data/components';
export { ImportData } from '@/app/(root)/scraping/items/components';
export { DataProviderFormModal } from './DataProviderFormModal';
export { DataProviderSettingModal } from './DataProviderSettingModal';
```

---

#### [DELETE] `src/app/(root)/scraping/data-providers/components/DataProviderSettingModal.tsx`
#### [DELETE] `src/app/(root)/scraping/data-providers/components/DataProviderFormModal.tsx`

---

## Section 5. Test cases (Kịch bản kiểm thử)

### Automated Tests & Type Check
- Chạy lệnh kiểm tra TypeScript compiler để đảm bảo không có lỗi type import hay missing props:
  ```bash
  npx tsc --noEmit
  ```
- Chạy linter kiểm tra cú pháp và định dạng code:
  ```bash
  npm run lint
  ```

### Manual Verification Path
1. **Kiểm tra DataProviderFormModal**:
   - Vào màn hình Nhà cung cấp dữ liệu -> Bấm nút **"Thêm nhà cung cấp"**.
   - Kiểm tra Modal hiển thị đầy đủ các trường nhập tên, mã, URL cơ sở, dropdown cha.
   - Thử chỉnh sửa một nhà cung cấp -> Đảm bảo thông tin cũ điền đúng vào form.

2. **Kiểm tra DataProviderSettingModal - Cấu hình hàm cào (Target Config)**:
   - Bấm icon bánh răng/cấu hình cào tại một dòng Data Provider.
   - Chuyển đổi Dịch vụ Scraper (API Scraper vs Generic HTML Parser) -> Đảm bảo `functionGenerator` tự động thay đổi mã mẫu tương ứng khi ô rỗng.
   - Nhập thông tin, bấm **"Lưu cấu hình"** -> Đảm bảo thông báo thành công và dữ liệu được lưu.

3. **Kiểm tra DataProviderSettingModal - Cấu hình hàm tìm kiếm (Search Config)**:
   - Bấm icon kính lúp/cấu hình tìm kiếm tại một dòng Data Provider.
   - Đảm bảo giao diện chuyển đúng sang `SearchConfigTab` hiển thị `searchUrlPattern` và `queryPlaceholder`.

4. **Kiểm tra Tab Thử nghiệm (Test Tab)**:
   - Chuyển sang Tab **"Thử nghiệm"** -> Nhập Test URL -> Bấm **"Chạy thử nghiệm"**.
   - Bật công tắc **"Sử dụng HTML content mẫu"** -> Nhập mã HTML -> Bấm chạy thử -> Đảm bảo kết quả JSON xuất hiện trong Card kết quả.
