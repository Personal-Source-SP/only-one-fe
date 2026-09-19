# Concept: Cập nhật Kiến trúc Skill only-one-nextjs-development theo Cấu trúc Codebase Mới

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Skill `only-one-nextjs-development` và các tài liệu tham khảo (`references/page-architecture.md`, `references/component-architecture.md`, `references/refine-hooks.md`) hiện đang mô tả kiến trúc cũ của dự án frontend (`only-one-fe`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. Tài liệu cũ hướng dẫn `ListContainer` nhận toàn bộ props `table={...}` và `formModal={[...]}` theo dạng monolithic all-in-one prop passing. Trong khi thực tế codebase mới (ví dụ: `scraping/data-providers`, `scraping/discovery`) đã refactor theo pattern **Compound Component Composition** (`<ListContainer>` bọc `<ListTable />` và render độc lập các `<FormModalContainer />` làm sibling components).
  2. Tài liệu cũ hướng dẫn khai báo trực tiếp `useCustomTable` và `useCustomModalForm` bên trong component `page.tsx`, khiến `page.tsx` dễ bị phình to. Cấu trúc thực tế mới tách toàn bộ state, query, mutation và logic mở form vào Custom Hook riêng tại `hooks/use<Feature>Page.ts`.
  3. Cấu trúc thư mục feature page và pattern tổ chức sub-route `[id]` (với `components/`, `hooks/`, `constants/`, `types/`, `enums/`) chưa được chuẩn hóa đồng bộ trong skill.
- **Nguyên nhân cốt lõi (Root Cause)**: Tài liệu hướng dẫn agent (`SKILL.md` và `references/`) không bắt kịp các đợt refactoring lớn của UI Core Primitives (`@/components/common`) và Feature Architecture Conventions.
- **Tác động (Impact / Blast Radius)**: Khi AI Agent được giao nhiệm vụ tạo mới hoặc sửa các trang feature frontend, Agent sẽ sinh code theo chuẩn cũ lỗi thời, gây lỗi type, không tương thích với UI primitives mới, và bắt buộc dev phải sửa lại bằng tay.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Đồng bộ hóa 100% tài liệu kiến trúc trong skill `only-one-nextjs-development` với patterns thực tế đang chạy ổn định tại `src/app/(root)/scraping/data-providers` và `src/app/(root)/scraping/discovery`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - Cập nhật `page-architecture.md` phản ánh chính xác cấu trúc thư mục chuẩn (`constants/`, `enums/`, `types/`, `hooks/use<Feature>Page.ts`, `components/`, `page.tsx`, `[id]/`).
  - Cập nhật pattern khai báo UI: `<ListContainer filters={filters} actions={actions}><ListTable ... /></ListContainer>` kết hợp `<FormModalContainer modalForm={...} />`.
  - Cập nhật `refine-hooks.md` và `component-architecture.md` theo signature mới của `useCustomTable`, `useCustomModalForm`, và convention `use<Feature>Page`.
  - Cập nhật `SKILL.md` (nếu cần) để đảm bảo Routing Matrix và Rule Invariants hướng dẫn Agent tuân thủ đúng cấu trúc mới.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật `only-one-fe/.agents/skills/only-one-nextjs-development/SKILL.md`.
  - Cập nhật `references/page-architecture.md` với code mẫu và giải thích theo chuẩn `data-providers` & `discovery`.
  - Cập nhật `references/component-architecture.md` làm rõ cách sử dụng `ListContainer`, `ListTable`, `FormModalContainer`, atomic inputs và custom AntD components.
  - Cập nhật `references/refine-hooks.md` làm rõ cách tổ chức `use<Feature>Page.ts` đóng gói `useCustomTable` và `useCustomModalForm`.
  - Rà soát các file `references/*.md` liên quan (`types-and-contracts.md`, `i18n-and-constants.md`) để đảm bảo tính nhất quán.
- **Explicit Out-of-Scope**:
  - Không sửa đổi mã nguồn ứng dụng trong `src/` (chỉ cập nhật skill và docs).
  - Không thay đổi logic backend (`only-one-be`).

---

## 3. Solution Architecture & Comparison (Giải pháp Đề xuất & So sánh)

### So sánh các Phương án Tiếp cận

| Tiêu chí | Phương án 1: Cập nhật Tối thiểu (Chỉ sửa `page-architecture.md`) | Phương án 2 (Khuyến nghị): Cập nhật Toàn diện & Đồng bộ Hệ thống Skill | Phương án 3: Viết lại hoàn toàn Skill mới |
| :--- | :--- | :--- | :--- |
| **Mô tả** | Chỉ sửa lại ví dụ code trong `page-architecture.md` cho giống `data-providers/page.tsx`. | Cập nhật đồng bộ `SKILL.md`, `page-architecture.md`, `component-architecture.md`, `refine-hooks.md` và `types-and-contracts.md` theo chuẩn mới từ `data-providers` & `discovery`. | Xóa bỏ skill cũ và sinh lại từ đầu. |
| **Ưu điểm** | Nhanh, ít thay đổi file. | Giữ được tính toàn vẹn của toàn bộ skill, mọi khía cạnh (hooks, components, page, types) đều nhất quán với codebase thực tế. | Tươi mới hoàn toàn. |
| **Nhược điểm** | Gây mâu thuẫn giữa `page-architecture.md` và `refine-hooks.md` / `component-architecture.md`. | Cần rà soát kỹ 3-4 files references. | Dễ làm mất các quy tắc chuẩn đã tích lũy từ trước (i18n, performance, runtime dev loop). |
| **Độ phức tạp** | Thấp | Vừa phải (Tối ưu nhất) | Cao |

---

## 4. Architectural Blueprint & Conventions (Kiến trúc Chi tiết)

### 4.1 Cấu trúc Thư mục Chuẩn của Feature Module

```text
src/app/(root)/<domain>/<feature>/
├── constants/
│   ├── <feature>-form.constants.ts     # Field options, defaults, form metadata
│   ├── <feature>-status.constants.ts   # Status maps, color badges, tag configurations
│   └── index.ts                        # Barrel export
├── enums/
│   ├── <feature>.enum.ts               # Domain-specific enums
│   └── index.ts                        # Barrel export
├── types/
│   ├── <feature>.type.ts               # Entity interfaces, form values, query types
│   └── index.ts                        # Barrel export
├── hooks/
│   ├── use<Feature>Page.ts             # Page hook: table, filters, create/edit modal forms, custom queries
│   └── index.ts                        # Barrel export
├── components/                         # Sub-components, custom cards, specialized modals
│   └── index.ts                        # Barrel export
├── [id]/                               # (Tùy chọn) Sub-route chi tiết / edit page
│   ├── components/
│   ├── hooks/
│   │   └── use<Feature>DetailPage.ts
│   └── page.tsx
└── page.tsx                            # Declarative Orchestrator (< 200 LOC)
```

### 4.2 Pattern Khai báo Hook Trang (`hooks/use<Feature>Page.ts`)

```typescript
'use client';

import { API_ENDPOINT } from '@/config';
import { useCustomModalForm, useCustomTable } from '@/hooks';
import type { IFeatureEntity, IFeatureFormValues } from '../types';

export const useFeaturePage = () => {
    const table = useCustomTable<IFeatureEntity>({
        resource: API_ENDPOINT.FEATURE.BASE,
    });

    const createModalForm = useCustomModalForm<
        IFeatureEntity,
        IFeatureFormValues,
        IFeatureEntity
    >({
        action: 'create',
        resource: API_ENDPOINT.FEATURE.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
    });

    const editModalForm = useCustomModalForm<
        IFeatureEntity,
        IFeatureFormValues,
        IFeatureEntity
    >({
        action: 'edit',
        resource: API_ENDPOINT.FEATURE.BASE,
        onMutationSuccess: async () => {
            await table.tableQuery.refetch();
        },
        initialValuesMapper: (record) => ({
            name: record.name,
            // ...map fields
        }),
    });

    return {
        table,
        debouncedSearch: table.debouncedSearch,
        createModalForm,
        editModalForm,
    };
};
```

### 4.3 Pattern Khai báo Orchestrator (`page.tsx`)

```tsx
'use client';

import {
    FormModalContainer,
    ListContainer,
    ListTable,
    type ICardAction,
    type IFilterField,
    type IFormField,
} from '@/components/common';
import { CustomButton, type ColumnsType } from '@/components/custom-antd';
import { RESOURCE } from '@/config';
import { formatDate } from '@/libs';
import { FormRuleType } from '@/utilities';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useFeaturePage } from './hooks';
import type { IFeatureEntity, IFeatureFormValues } from './types';

export default function FeaturePage() {
    const router = useRouter();
    const { table, debouncedSearch, createModalForm, editModalForm } = useFeaturePage();

    const columns: ColumnsType<IFeatureEntity> = [
        // Table columns definition with sorter, ellipsis, custom render
    ];

    const actions: ICardAction[] = [
        {
            label: 'Thêm mới',
            icon: <PlusOutlined />,
            permissionAction: 'create',
            component: (
                <CustomButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => createModalForm.show()}
                >
                    Thêm mới
                </CustomButton>
            ),
        },
    ];

    const filters: IFilterField[] = [
        {
            name: 'search',
            type: 'input',
            isPrimary: true,
            placeholder: 'Tìm kiếm...',
            onChange: (value) => debouncedSearch(value?.toString() ?? ''),
        },
    ];

    const formFields: IFormField<IFeatureFormValues>[] = [
        // Declarative form fields with rulesConfig (FormRuleType)
    ];

    return (
        <>
            <ListContainer filters={filters} actions={actions}>
                <ListTable<IFeatureEntity>
                    columns={columns}
                    table={table}
                    deleteResource={RESOURCE.FEATURE}
                    onEdit={(record) => editModalForm.show(record.id)}
                    onView={(record) => router.push(`/feature/${record.id}`)}
                />
            </ListContainer>

            <FormModalContainer
                modalForm={createModalForm}
                title="Thêm mới"
                sections={[{ type: 'plain', fields: formFields }]}
                createInitialValues={{ /* ... */ }}
            />
            <FormModalContainer
                modalForm={editModalForm}
                title="Chỉnh sửa"
                sections={[{ type: 'plain', fields: formFields }]}
            />
        </>
    );
}
```

---

## 5. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

- **Rủi ro mâu thuẫn giữa các references**: Nếu chỉ sửa `page-architecture.md` mà không cập nhật `refine-hooks.md` và `component-architecture.md`, Agent có thể đọc các file khác và áp dụng cấu trúc cũ.
  - *Giải pháp*: Triển khai theo **Phương án 2**, rà soát và cập nhật đồng bộ tất cả các reference files liên quan.
- **Giới hạn số dòng (< 200 LOC)**: Việc định nghĩa `formFields` và `columns` dài trong `page.tsx` có thể chạm trần 200 dòng.
  - *Giải pháp*: Quy định rõ trong tài liệu: nếu `formFields` hoặc `columns` quá dài (> 50-70 LOC), tách sang `constants/<feature>-form.constants.ts` hoặc `constants/<feature>-columns.constants.ts`.
