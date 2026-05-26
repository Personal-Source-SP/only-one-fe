## Why

Luồng cấu hình `data-provider` cho `scraperService = local` hiện mới dừng ở nhập URL/thông số cào, trong khi nhu cầu thực tế là chọn trực tiếp một thư mục cục bộ giống trải nghiệm Google Drive để khởi tạo nguồn dữ liệu. Việc này cần được chuẩn hóa ngay vì nếu tiếp tục làm thủ công ở các màn `items` và `data-provider-items` sẽ gây tách luồng, dễ sai dữ liệu và tăng số bước thao tác cho người vận hành.

Sau vòng triển khai đầu tiên, đã xuất hiện một lệch hướng quan trọng: fallback hiện tại dùng `webkitdirectory` khiến browser hiển thị prompt kiểu “tải N tệp lên trang web này”. Dù frontend không thực sự upload file content, UX này vẫn làm người dùng hiểu rằng hệ thống đang sync hoặc upload toàn bộ file trong thư mục, trái với mục tiêu nghiệp vụ.

Ngoài ra, web browser cũng không cho frontend đọc full local path một cách tin cậy như ứng dụng desktop/native. Nếu nghiệp vụ cần `path` cùng với `name` để tạo `item` và `data-provider-item`, thiết kế cần phản ánh đúng giới hạn này: chỉ tự động lấy metadata browser cho phép, còn các giá trị path chi tiết phải do người dùng xác nhận/nhập tay hoặc được hỗ trợ bởi môi trường có capability phù hợp hơn.

## What Changes

- Thêm action `add folder` trong luồng cấu hình `LOCAL` của module `data-provider`.
- Cho phép người dùng chọn một thư mục cục bộ để lấy metadata định danh thư mục và thêm `item`/`data-provider-item`, nhưng không biến flow này thành luồng đồng bộ dữ liệu.
- Loại bỏ fallback dựa trên `webkitdirectory` vì browser sẽ hiển thị semantics upload file, gây sai mental model của người dùng.
- Dùng `showDirectoryPicker` như enhanced flow khi browser hỗ trợ; nếu không hỗ trợ thì fallback sang nhập metadata thư mục theo form (`folderName`, `folderPath` hoặc identifier tương đương) thay vì mở file-upload flow.
- Khi xác nhận thêm thư mục, hệ thống sẽ tạo mới hoặc tái sử dụng bản ghi `item` tương ứng rồi tạo `data-provider-item` gắn với `data-provider` đang cấu hình.
- Chuẩn hóa dữ liệu được tạo từ thư mục local để người dùng không cần sang màn `items` và `provider-items` thao tác tay cho cùng một thư mục.
- Khẳng định rõ rằng flow `add folder` không upload, sync, hay quét toàn bộ file trong thư mục như luồng đồng bộ local.
- Làm rõ giới hạn browser web: frontend không thể tự động lấy full local path nếu runtime không cung cấp capability tương ứng; path dùng cho mapping chỉ có thể là browser-exposed value hoặc giá trị người dùng nhập/xác nhận.
- Giữ nguyên hành vi hiện tại cho các `scraperService` khác và cho các luồng ngoài phạm vi `LOCAL`.

## Capabilities

### New Capabilities

- `local-folder-provider-item`: Cho phép cấu hình `data-provider` loại `local` thêm thư mục nguồn và tự đồng bộ thực thể `item` cùng `data-provider-item` liên quan trong một luồng thao tác.

### Modified Capabilities

- None.

## Impact

- Ảnh hưởng trực tiếp tới UI/UX của `src/components/module/data-provider`, đặc biệt phần cấu hình `LOCAL`.
- Cần đổi chiến lược fallback đa trình duyệt: không dùng cơ chế khiến browser hiểu là upload file, đồng thời vẫn giữ semantics “đăng ký metadata thư mục để thêm item”.
- Có thể cần bổ sung hoặc chuẩn hóa request/response giữa frontend với các resource `items`, `data-provider-items`, và `data-providers` để hỗ trợ tạo liên hoàn.
- Có thể cần mở rộng contract để nhận thêm `folderPath` hoặc `folderReference` khi nghiệp vụ cần định danh nhiều hơn `folderName`.
- Cần tránh reuse mental model từ `SyncLocal`, vì flow này không nhằm preview hoặc upload toàn bộ nội dung thư mục.
