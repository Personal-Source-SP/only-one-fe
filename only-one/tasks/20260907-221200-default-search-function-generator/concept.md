# Concept: Xây dựng Template Mặc định cho Search Function (HTML & API)

## 1. Problem & Goal (Vấn đề & Mục tiêu)

### Problem (Vấn đề & Điểm nghẽn Hiện tại)
- **Bối cảnh & Điểm kích hoạt**: Khi người dùng tạo hoặc cấu hình tính năng Tìm kiếm (`SEARCH`) trên giao diện Frontend (`SearchConfigForm`), hệ thống tự động điền các hàm mẫu mặc định (`functionGenerator`).
- **Hiện tượng & Khiếm khuyết kỹ thuật**:
  1. **Lỗi Schema / Sai lệch trường dữ liệu**: `DEFAULT_SEARCH_FUNCTION_GENERATOR` hiện tại vẫn chứa các trường giá cả (`price`, `currency`), không đồng bộ với Backend DTO chuẩn (`SearchResultItemDto`) và thiếu trường `metadata`.
  2. **Thiếu Template cho API Search**: Đối với service `ScraperServiceEnum.API`, `defaultSearchTemplate` hiện đang dùng chung `DEFAULT_API_FUNCTION_GENERATOR` (vốn định nghĩa hàm `extractData` phục vụ bài toán review/photo scraping cụ thể), thay vì cung cấp hàm mẫu chuẩn `searchData(data, axios)` để bóc tách kết quả tìm kiếm từ JSON payload.
  3. **Không đồng bộ khi chuyển đổi Service**: Khi người dùng chuyển đổi dropdown service giữa `GENERIC` (HTML) và `API`, biểu mẫu chưa switch sang đúng template generator tương ứng của Search.
- **Nguyên nhân cốt lõi (Root Cause)**: Các hằng số template code generator ban đầu được tạo cho Scraping và chưa được thiết kế riêng biệt cho bài toán Search HTML và Search API.
- **Tác động (Impact / Blast Radius)**: Người dùng mới tạo cấu hình Search cho API hoặc HTML phải tự viết lại toàn bộ function từ đầu; nguy cơ sinh lỗi runtime do sai lệch schema hoặc sai tên entrypoint function `searchData`.

### Goal (Mục tiêu Kỹ thuật Cần đạt)
- **Mục tiêu cốt lõi**: Chuẩn hóa `DEFAULT_SEARCH_FUNCTION_GENERATOR` (HTML) và tạo mới `DEFAULT_SEARCH_API_FUNCTION_GENERATOR` (API) đồng bộ 100% với schema `SearchResultItemDto`.
- **Tiêu chí nghiệm thu (Acceptance Criteria)**:
  - **HTML Search Template**: Định nghĩa `DEFAULT_SEARCH_FUNCTION_GENERATOR` nhận `(html)`, sử dụng Cheerio, bóc tách `url`, `title`, `imageUrl`, `relativeUrl`, `metadata: {}` (không có `price`, `currency`).
  - **API Search Template**: Định nghĩa `DEFAULT_SEARCH_API_FUNCTION_GENERATOR` nhận `(data, axios)`, tự động phân tích mảng dữ liệu tìm kiếm (`data.items`, `data.data`, hoặc `data`), trả về danh sách `SearchResultItemDto`.
  - **Metadata & Form Binding**: Cập nhật `SCRAPER_SERVICE_METADATA` trong `constants.ts` để `ScraperServiceEnum.API` trỏ tới `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`. Khi đổi service trong `SearchConfigForm`, form tự động load đúng template tương ứng.

---

## 2. Scope Boundaries (Ranh giới Phạm vi)

- **In-Scope**:
  - Cập nhật hằng số trong `src/constants/data-provider.constant.ts` (`DEFAULT_SEARCH_FUNCTION_GENERATOR`, thêm mới `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`).
  - Cập nhật cấu hình metadata trong `src/app/(root)/scraping/features/[dataProviderId]/constants.ts`.
  - Kiểm tra và đảm bảo tương thích trong `SearchConfigForm` và `SearchCodeSection`.

- **Explicit Out-of-Scope**:
  - Không sửa đổi backend runner hay database entity.
  - Không thay đổi các template của tính năng `SCRAPING` (`DEFAULT_PARSER_FUNCTION_GENERATOR`, `DEFAULT_API_FUNCTION_GENERATOR`).

---

## 3. Proposed Solution & Core Mechanism (Giải pháp Đề xuất & Cơ chế)

### 3.1. So sánh các Phương án Thiết kế (Solution Options)

| Tiêu chí | Option 1: Dedicated HTML & API Search Constants (Recommended) | Option 2: Single Dynamic Template Builder Function |
| :--- | :--- | :--- |
| **Mô tả** | Tách bạch 2 hằng số string độc lập `DEFAULT_SEARCH_FUNCTION_GENERATOR` và `DEFAULT_SEARCH_API_FUNCTION_GENERATOR`. | Sử dụng hàm builder sinh template động dựa trên service type. |
| **Ưu điểm** | - Đơn giản, rõ ràng, nhất quán với cách thiết kế `DEFAULT_PARSER_FUNCTION_GENERATOR` và `DEFAULT_API_FUNCTION_GENERATOR` hiện có.<br>- Dễ đọc, dễ chỉnh sửa trực tiếp trong Monaco Editor. | - Linh hoạt nếu có nhiều tham số cấu hình phụ. |
| **Nhược điểm** | - Thêm 1 hằng số mới được export. | - Phức tạp hóa luồng dữ liệu, khó bảo trì khi render trong constants file. |
| **Đánh giá** | ⭐ **Khuyến nghị lựa chọn** | Không cần thiết |

---

### 3.2. Core Template Specifications (Option 1 - Khuyến nghị)

#### 1. `DEFAULT_SEARCH_FUNCTION_GENERATOR` (HTML Cheerio)
```javascript
export const DEFAULT_SEARCH_FUNCTION_GENERATOR = `
const searchData = (html) => {
  const $ = cheerio.load(html);
  try {
    const productElements = $('${resultSelector}');
    const results = [];

    productElements.each((_, element) => {
      const $element = $(element);

      const product = {
        url: $element.find('a').attr('href') || '',
        title: $element.find('.product-title').text().trim() || '',
        imageUrl: $element.find('img').attr('src') || '',
        relativeUrl: $element.find('a').attr('href') || '',
        metadata: {}
      };

      results.push(product);
    });

    return results;
  } catch (error) {
    console.error('Error searching the HTML:', error);
    return null;
  }
};
`;
```

#### 2. `DEFAULT_SEARCH_API_FUNCTION_GENERATOR` (JSON Axios)
```javascript
export const DEFAULT_SEARCH_API_FUNCTION_GENERATOR = `
const searchData = async (data, axios) => {
  try {
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : [];

    const results = items.map((item) => ({
      url: item?.url || item?.link || item?.productUrl || '',
      title: item?.title || item?.name || '',
      imageUrl: item?.imageUrl || item?.thumbnail || item?.image || '',
      relativeUrl: item?.relativeUrl || '',
      metadata: item?.metadata || {}
    }));

    return results;
  } catch (error) {
    console.error('Error searching the API data:', error?.message);
    return null;
  }
};
`;
```

---

## 4. Critical Risks & Edge Cases (Rủi ro & Kịch bản Biên)

1. **User Overwrite Risk**:
   - *Rủi ro*: Khi người dùng đổi service trong form, nếu đã nhập code tùy chỉnh thì có thể bị mất code.
   - *Chiến lược xử lý*: `SearchConfigForm` giữ nguyên cơ chế xác nhận hoặc chỉ reset khi người dùng chủ động chuyển đổi service type trên giao diện.
2. **Backward Compatibility**:
   - *Rủi ro*: Các cấu hình đã lưu trong database không bị ảnh hưởng vì form chỉ áp dụng default template khi khởi tạo mới (hoặc khi `functionGenerator` trống).
