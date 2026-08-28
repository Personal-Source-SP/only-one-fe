---
status: done
slug: integrate-scraping-discovery-api
started_at: 2026-08-28
completed_at: 2026-08-28
pr_url: ~
branch: ~
---

# Plan: Tích hợp REST API cho Scraping Discovery Frontend

## Section 1. Context & Architecture Overview

### 1.1 Bối cảnh & Mục tiêu
Giao diện **Scraping Discovery** tại `src/app/(root)/scraping/discovery` trên `only-one-fe` trước đây sử dụng mock data cục bộ (`mock-data.ts`) để hiển thị danh sách phiên, thông tin chi tiết và danh sách URL. 
Sau khi backend `only-one-be` đã hoàn thành toàn bộ hệ thống API (`/v1/discovery-sessions`, `/v1/discovery-urls`), kế hoạch này sẽ thay thế hoàn toàn tầng mock data bằng các hook API chuẩn (`useCustomList`, `useCustomOne`, `useCustomMutationData`, `useSelectDataProvider`).

### 1.2 Luồng Dữ liệu & Tương tác (End-to-End Flow)
```
                                     [Frontend (only-one-fe)]
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     [Discovery Sessions List]                                     [Discovery Detail Page]
      - useCustomList / Table                                       - useCustomOne (Session Summary)
      - Filter by dataProviderId                                    - useCustomList (Discovered URLs)
      - Search sessionCode / targetUrl                              - Filter by status / matchResult
                 │                                                             │
                 ▼                                                             ▼
    [POST /discovery-sessions]                                     [POST /discovery-sessions/:id/enqueue-urls]
    CreateSessionModal Mutation                                    Batch Enqueue -> ScrapingData Queue
```

---

## Section 2. Detailed Technical Design & Seams

### 2.1 API Endpoints Configuration (`src/config/endpoint.ts`)
Bổ sung namespace `DISCOVERY_SESSIONS` và `DISCOVERY_URLS`:
- `API_ENDPOINT.DISCOVERY_SESSIONS`:
  - `BASE`: `discovery-sessions`
  - `ALL`: `discovery-sessions/all`
  - `DETAIL(id)`: `discovery-sessions/${id}`
  - `SUMMARY(id)`: `discovery-sessions/${id}/summary`
  - `VALIDATE(id)`: `discovery-sessions/${id}/validate`
  - `LATEST_BATCH(id)`: `discovery-sessions/${id}/validation-latest-batch`
  - `BULK_USER_ACTIONS(id)`: `discovery-sessions/${id}/bulk-user-actions`
  - `ENQUEUE_URLS(id)`: `discovery-sessions/${id}/enqueue-urls`
- `API_ENDPOINT.DISCOVERY_URLS`:
  - `BASE`: `discovery-urls`
  - `ALL`: `discovery-urls/all`
  - `DETAIL(id)`: `discovery-urls/${id}`
  - `USER_ACTION(id)`: `discovery-urls/${id}/user-action`
  - `REVALIDATE(id)`: `discovery-urls/${id}/re-validate`
  - `LOGS(id)`: `discovery-urls/${id}/validation-logs`

### 2.2 TypeScript Type Definitions (`src/app/(root)/scraping/discovery/types.ts`)
Cập nhật `IDiscoverySession` và `IDiscoveryUrl` đồng bộ 100% với DTO từ `only-one-be`:
- `IDiscoverySession`: `id`, `sessionCode`, `dataProviderId`, `dataProvider`, `targetUrl`, `status`, `totalDiscovered`, `totalValidated`, `totalQueued`, `depth`, `maxUrls`, `durationSeconds`, `createdAt`, `updatedAt`.
- `IDiscoveryUrl`: `id`, `sessionId`, `dataProviderId`, `url`, `domain`, `title`, `foundAtDepth`, `status`, `validationStatus`, `matchResult`, `confidenceScore`, `priceDetected`, `detectedPrice`, `detectedCurrency`, `userAction`, `finalValidationStatus`, `createdAt`.

---

## Section 3. Implementation Architecture & Machine-Readable Task Matrix

### 3.1 Machine-Readable Task Matrix & Dependency Graph

| Order | Status | Action | File Path | Target Symbols / AST Seams | Depends On | Fast Test Command |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | `[x]` | `[MODIFY]` | `src/config/endpoint.ts` | `API_ENDPOINT.DISCOVERY_SESSIONS`, `API_ENDPOINT.DISCOVERY_URLS` | `None` | `npm run build` |
| **2** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/types.ts` | `IDiscoverySession`, `IDiscoveryUrl`, Enums & Form interfaces | `None` | `npm run build` |
| **3** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/hooks.ts` | `useDiscoveryPage` using `useCustomList`, `useSelectDataProvider`, `useCustomMutationData` | `Order 1, 2` | `npm run build` |
| **4** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/components/CreateSessionModal.tsx` | `CreateSessionModal` props and form submission binding | `Order 2` | `npm run build` |
| **5** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/page.tsx` | `DiscoveryPage` connecting loading states and pagination | `Order 3, 4` | `npm run build` |
| **6** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/hooks.tsx` | `useDiscoveryDetailPage` using `useCustomOne`, `useCustomList`, `useCustomMutationData` | `Order 1, 2` | `npm run build` |
| **7** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/components/SessionOverviewCard.tsx` | `SessionOverviewCard` rendering real session & summary metrics | `Order 2, 6` | `npm run build` |
| **8** | `[x]` | `[MODIFY]` | `src/app/(root)/scraping/discovery/[id]/page.tsx` | `DiscoveryDetailPage` loading skeleton & error handling | `Order 6, 7` | `npm run build` |
| **9** | `[x]` | `[DELETE]` | `src/app/(root)/scraping/discovery/mocks/mock-data.ts` | Remove mock data store | `Order 3, 6` | `npm run build` |

---

## Section 4. Implementation Code Examples (Mẫu Code Triển khai)

### 4.1 Discovery Sessions Hook (`src/app/(root)/scraping/discovery/hooks.ts`)
```typescript
// [TARGET SEAM]: useDiscoveryPage
// [RATIONALE]: Kết nối API backend qua useCustomList và useCustomMutationData
export const useDiscoveryPage = () => {
    const [selectedProviderId, setSelectedProviderId] = useState<string | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { options: dataProviderOptions } = useSelectDataProvider();
    const { handleCustomMutationData, isLoading: isCreating } = useCustomMutationData();

    const {
        data: sessions = [],
        query: { isLoading, refetch },
    } = useCustomList<IDiscoverySession>({
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        filters: [
            ...(selectedProviderId ? [{ field: 'dataProviderId', operator: 'eq' as const, value: selectedProviderId }] : []),
            ...(searchTerm ? [{ field: 'search', operator: 'contains' as const, value: searchTerm }] : []),
        ],
    });

    const handleCreateSession = async (values: CreateSessionFormValues) => {
        await handleCustomMutationData({
            resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
            values: {
                dataProviderId: values.dataProviderId,
                targetUrl: values.targetUrl,
                depth: values.depth || 1,
                maxUrls: values.maxUrls || 100,
                notes: values.notes,
            },
            method: 'post',
            successMessage: 'Tạo phiên khám phá thành công',
            onSuccess: () => {
                setIsCreateModalOpen(false);
                refetch();
            },
        });
    };

    return {
        sessions,
        isLoading,
        dataProviderOptions,
        selectedProviderId,
        setSelectedProviderId,
        searchTerm,
        setSearchTerm,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isCreating,
        handleCreateSession,
    };
};
```

### 4.2 Discovery Detail Hook (`src/app/(root)/scraping/discovery/[id]/hooks.tsx`)
```typescript
// [TARGET SEAM]: useDiscoveryDetailPage
// [RATIONALE]: Kết nối chi tiết phiên và danh sách URL thực tế
export const useDiscoveryDetailPage = (id: string) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const { handleCustomMutationData, isLoading: isEnqueuing } = useCustomMutationData();

    // 1. Fetch Session Detail
    const { data: session, query: sessionQuery } = useCustomOne<IDiscoverySession>({
        resource: API_ENDPOINT.DISCOVERY_SESSIONS.BASE,
        id,
        enabled: Boolean(id),
    });

    // 2. Fetch Discovered URLs
    const { data: urls = [], query: urlsQuery } = useCustomList<IDiscoveryUrl>({
        resource: API_ENDPOINT.DISCOVERY_URLS.BASE,
        filters: [
            { field: 'sessionId', operator: 'eq', value: id },
            ...(searchTerm ? [{ field: 'search', operator: 'contains' as const, value: searchTerm }] : []),
        ],
        queryOptions: { enabled: Boolean(id) },
    });

    const handleBatchEnqueue = async () => {
        if (!selectedRowKeys.length) return;
        await handleCustomMutationData({
            resource: API_ENDPOINT.DISCOVERY_SESSIONS.ENQUEUE_URLS(id),
            values: { urlIds: selectedRowKeys },
            method: 'post',
            successMessage: `Đã đẩy ${selectedRowKeys.length} URLs vào hàng đợi cào`,
            onSuccess: () => {
                setSelectedRowKeys([]);
                urlsQuery.refetch();
                sessionQuery.refetch();
            },
        });
    };

    return {
        session,
        urls,
        isLoading: sessionQuery.isLoading || urlsQuery.isLoading,
        isEnqueuing,
        selectedRowKeys,
        setSelectedRowKeys,
        handleBatchEnqueue,
        // columns, actions, filters...
    };
};
```

---

## Section 5. Test Cases & Verification Checklist

### 5.1 Manual & Automated Verification
- [ ] **TypeScript Build**: `npm run build` hoàn thành với exit code 0.
- [ ] **Linting & Code Formatting**: `npm run lint` hoàn thành không lỗi.
- [ ] **Session Creation Flow**: Mở modal -> Chọn provider -> Nhập URL -> Submit -> Nhận phản hồi API và danh sách tự reload.
- [ ] **Detail Page Loading**: Truy cập `/scraping/discovery/:id` -> Hiển thị đúng `sessionCode`, tiến độ, và danh sách URL thật.
- [ ] **Batch Enqueue Action**: Chọn nhiều dòng URL -> Bấm "Đẩy vào hàng đợi cào" -> Nhận thông báo thành công và tag trạng thái đổi sang `QUEUED`.

---

## Section 6. Technical English Key Patterns

### 1. Invalidation Pipeline
- **Meaning (VI)**: Quy trình hủy hiệu lực bộ nhớ đệm (cache invalidation) của React Query sau khi thực hiện thao tác thay đổi dữ liệu (mutation).
- **Grammar / Usage**: `<Action> triggers query invalidation to ensure downstream consumers display fresh server data.`
- **Engineering Example**: *"Batch enqueueing URLs triggers query invalidation on both the session details and URL tables to reflect updated queue counters."*

### 2. Defensive Unwrapping Elimination
- **Meaning (VI)**: Loại bỏ các đoạn code kiểm tra và bóc tách envelope thủ công (`res?.data?.data`) nhờ sử dụng hook chuẩn hóa.
- **Grammar / Usage**: `Rely on the hook's native unwrapping instead of defensive manual drilling.`
- **Engineering Example**: *"By adopting `useCustomList`, we eliminated defensive unwrapping and ensured standard pagination metadata propagation."*

### 3. Server-Driven Pagination
- **Meaning (VI)**: Cơ chế phân trang được xử lý trực tiếp trên server thay vì cắt mảng dữ liệu trên frontend.
- **Grammar / Usage**: `Delegate page slicing and sorting to the server-driven pagination pipeline.`
- **Engineering Example**: *"Server-driven pagination guarantees that large discovery sessions with thousands of URLs do not degrade client rendering performance."*
