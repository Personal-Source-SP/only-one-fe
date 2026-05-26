## Context

`ScrapeSetting` đang là nơi cấu hình chi tiết cho từng `data-provider`, trong đó nhánh `LOCAL` chỉ hiển thị các trường phù hợp cho nguồn cục bộ. Tuy nhiên luồng vận hành hiện tại vẫn buộc người dùng đi qua nhiều màn để tự tạo `item` rồi tạo tiếp `data-provider-item`, trong khi với local folder đây thực chất là một hành động nghiệp vụ duy nhất: đăng ký một thư mục nguồn cho nhà cung cấp đang cấu hình.

Thay đổi này chạm vào nhiều ranh giới cùng lúc:

- UI cấu hình `data-provider` cho `LOCAL`.
- Logic chọn thư mục cục bộ trên trình duyệt.
- Domain mapping giữa `item`, `data-provider-item`, và `data-provider`.

Mục tiêu là gom các bước đó vào một flow ngắn, rõ ràng, và có khả năng chống tạo trùng dữ liệu.

## Goals / Non-Goals

**Goals:**

- Thêm một flow `add folder` ngay trong cấu hình `LOCAL`.
- Cho phép chọn thư mục local bằng UX tương đồng với luồng local/google drive hiện có.
- Đảm bảo thao tác thêm thư mục tạo đầy đủ quan hệ `item` và `data-provider-item` cho `data-provider` hiện tại.
- Giữ semantics của flow ở mức metadata-only: chọn thư mục để định danh nguồn, không sync hay upload toàn bộ file.
- Giảm tối đa thao tác tay và lỗi phát sinh do người dùng phải qua nhiều màn CRUD riêng lẻ.
- Giữ thay đổi khu trú, không làm thay đổi hành vi của `API` và `GENERIC`.

**Non-Goals:**

- Không thay thế hoặc refactor toàn bộ màn `items` hay `provider-items`.
- Không mở rộng sang batch import nhiều thư mục trong cùng một submit.
- Không biến flow này thành biến thể của `SyncLocal`.
- Không upload, preview, scan, hay đồng bộ toàn bộ file trong thư mục.
- Không bổ sung quản trị cây thư mục hay hierarchy ngoài một thư mục nguồn được gắn vào provider.

## Decisions

### 1. Đặt `add folder` trong chính `ScrapeSetting` của `LOCAL`

`ScrapeSetting` đã là entry point khi người dùng cấu hình `data-provider`, nên thêm action tại đây giúp flow liền mạch và giảm chuyển trang/modal không cần thiết. Phương án thay vào màn `provider-items` bị loại vì vẫn buộc người dùng phải rời khỏi ngữ cảnh cấu hình hiện tại.

### 2. Tách riêng local folder modal/component thay vì nhét toàn bộ logic vào `ScrapeSetting`

`ScrapeSetting.tsx` đã lớn và đang chứa logic cho nhiều scraper service. Việc thêm picker, validation, submit state, và xử lý feedback của local folder nên được đóng gói thành component con riêng để giữ ranh giới trách nhiệm rõ ràng và tránh làm component cha tiếp tục phình to.

Alternative considered:

- Nhúng trực tiếp form thêm thư mục vào `FormLocal`: nhanh hơn lúc code nhưng làm khó bảo trì và khiến nhánh `LOCAL` khó kiểm thử độc lập.

### 3. Chỉ dùng folder picking khi browser hỗ trợ đúng semantics, không dùng fallback kiểu upload

`showDirectoryPicker` vẫn là hướng UX tốt nhất trên web vì nó thể hiện rõ người dùng đang chọn một thư mục, không phải tải file lên. Tuy nhiên, `webkitdirectory` trên hidden input dù technically chỉ được dùng để suy ra metadata vẫn khiến browser hiển thị prompt kiểu upload nhiều file, làm sai hoàn toàn mental model của người dùng. Vì vậy fallback này cần bị loại khỏi thiết kế chấp nhận được.

Khi browser không có `showDirectoryPicker`, flow nên fallback sang form nhập metadata thư mục thay vì giả lập chọn folder bằng file input. Form này có thể bao gồm `folderName` và `folderPath` hoặc một `folderReference` tương đương, tùy contract backend chốt sau cùng. Cách này giữ đúng semantics nghiệp vụ: người dùng đang đăng ký một source folder bằng metadata, không phải cấp file list cho frontend.

Điểm quan trọng là không có bước preview file, upload file, thống kê số lượng file, hay gửi binary/file content về backend. Nếu một browser mechanism tự thân đã khiến UX trông như sync hoặc upload, cơ chế đó không còn phù hợp với flow `add folder`.

Alternative considered:

- Chỉ nhập tay mọi metadata ở mọi browser: đơn giản hơn về kỹ thuật nhưng làm mất enhanced UX trên browser có hỗ trợ chọn thư mục.
- Chỉ dùng `showDirectoryPicker`: gọn hơn về code nhưng chặn toàn bộ flow trên trình duyệt không hỗ trợ File System Access API.
- Hidden input với `webkitdirectory`: bị loại vì browser hiển thị semantics upload file, mâu thuẫn trực tiếp với nghiệp vụ “đăng ký thư mục bằng metadata”.
- Tái sử dụng trực tiếp flow `SyncLocal`: sai về nghiệp vụ vì luồng đó hướng tới đồng bộ dữ liệu file, không phải đăng ký thư mục như một item source.

### 4. Dùng một API nghiệp vụ chuyên biệt để tạo hoặc tái sử dụng `item` rồi tạo `data-provider-item` theo kiểu transaction

Hành vi “thêm local folder” thực chất là một nghiệp vụ liên hợp. Nếu frontend tự gọi tuần tự nhiều resource generic (`items` rồi `data-provider-items`) thì sẽ khó xử lý chống trùng, rollback, và race condition. Một endpoint nghiệp vụ riêng có thể:

- nhận `dataProviderId` + thông tin thư mục,
- tìm `item` phù hợp theo quy tắc đặt tên/mã,
- tạo mới nếu chưa có,
- kiểm tra trùng `data-provider-item` theo provider + folder path,
- trả về kết quả cuối cùng cho frontend trong một response.

Request của nghiệp vụ này chỉ chứa metadata thư mục cần cho việc định danh và mapping. Nó không nhận danh sách file, không upload file content, và không khởi động batch sync.

Nếu backend cần `path` để định danh chính xác hơn `folderName`, trường này phải được model hóa tường minh trong contract dưới dạng `folderPath` hoặc `folderReference`. Trên web, giá trị đó chỉ có thể đến từ:

- metadata mà runtime/browser thực sự expose,
- hoặc giá trị người dùng nhập/xác nhận bằng tay.

Thiết kế không được giả định frontend web có thể đọc full absolute local path như ứng dụng desktop.

Alternative considered:

- Chỉ orchestration ở frontend bằng nhiều request: ít thay đổi backend hơn nhưng làm tăng coupling UI-domain và tạo nhiều nhánh lỗi khó đồng bộ.

### 5. Refresh dữ liệu liên quan ngay sau khi thêm thư mục thành công

Sau khi submit thành công, UI cần làm mới `data-provider` hiện tại và các option liên quan để người dùng nhìn thấy kết quả ngay, thay vì phải đóng/mở lại modal hoặc reload trang thủ công. Đây là yêu cầu quan trọng để flow thật sự “một bước”.

## Risks / Trade-offs

- [Browser support for folder picker] → Chỉ một số trình duyệt hỗ trợ File System Access API; mitigation là progressive enhancement với manual metadata fallback, không dùng upload-style fallback.
- [Duplicate naming rules] → Tên thư mục local có thể trùng với `item` đang có; cần quy tắc create-or-reuse minh bạch và response nói rõ hệ thống đã tái sử dụng hay tạo mới.
- [Path availability] → Browser web không luôn cung cấp full local path ổn định; cần chốt rõ khi nào dùng `folderName`, khi nào yêu cầu `folderPath` do người dùng xác nhận, và duplicate key được chuẩn hóa ra sao.
- [Large component surface] → Nếu không tách component con, `ScrapeSetting` sẽ tiếp tục quá tải; mitigation là cô lập modal và submit hook/handler cho `LOCAL`.
- [Permission confusion] → Người dùng có thể hiểu nhầm flow là sync/upload; mitigation là không dùng browser APIs tạo prompt upload file và giữ copy/UI tập trung vào metadata registration.

## Migration Plan

Không cần migration dữ liệu hiện hữu vì thay đổi này chỉ thêm flow tạo mới. Triển khai theo hướng additive:

1. Thêm endpoint nghiệp vụ và payload/response tương ứng.
2. Thêm local folder modal/action ở frontend.
3. Kiểm thử với provider `LOCAL` mới và provider `LOCAL` đã có dữ liệu trên cả browser có `showDirectoryPicker` và browser phải dùng manual metadata fallback.
4. Nếu cần rollback, có thể ẩn action mới ở frontend và ngừng gọi endpoint mới mà không ảnh hưởng dữ liệu cũ.

## Open Questions

- Quy tắc sinh `code` cho `item` từ metadata thư mục sẽ là tự động hoàn toàn hay cho phép người dùng chỉnh trước khi submit?
- `folderPath` có phải là bắt buộc cho duplicate key hay chỉ là metadata bổ sung khi browser/runtime không thể auto-suy ra?
- Sau khi thêm thư mục thành công, UI có cần hiển thị danh sách các folder đã gắn ngay trong modal `ScrapeSetting` hay chỉ cần thông báo + refresh dữ liệu là đủ?
