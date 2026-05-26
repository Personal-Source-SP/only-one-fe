## 1. Contract And Domain Flow

- [x] 1.1 Xác định request/response cho nghiệp vụ đăng ký local folder vào `data-provider`, bao gồm thông tin thư mục, trạng thái create-or-reuse của `item`, và lỗi duplicate.
- [x] 1.2 Chốt quy tắc ánh xạ local folder sang `item` và `data-provider-item`, bao gồm khóa nhận diện thư mục và quy tắc chống tạo trùng trong cùng provider.

## 2. Local Provider UI

- [x] 2.1 Tách phần UI của `LOCAL` trong `ScrapeSetting` để có thể gắn action `add folder` mà không làm tăng thêm độ phình của component cha.
- [x] 2.2 Tạo local folder modal hoặc flow riêng để chọn thư mục và lấy metadata định danh thư mục, kèm validation và thông báo khi trình duyệt không hỗ trợ.
- [x] 2.3 Kết nối submit của local folder flow với nghiệp vụ đăng ký thư mục và hiển thị feedback thành công/thất bại rõ ràng cho người dùng.

## 3. Refresh And Verification

- [x] 3.1 Làm mới dữ liệu provider và provider-item liên quan ngay sau khi thêm folder thành công để người dùng thấy kết quả mà không cần reload tay.
- [x] 3.2 Xác minh các case chính: provider `LOCAL` có action mới, provider khác không bị ảnh hưởng, thêm mới thành công, tái sử dụng `item`, và duplicate folder bị chặn đúng thông báo.

## 4. Browser Compatibility Fallback

- [x] 4.1 Thay flow chọn thư mục `LOCAL` sang progressive enhancement: ưu tiên `showDirectoryPicker`, nhưng fallback sang cơ chế vẫn chỉ phục vụ việc lấy metadata thư mục khi browser không hỗ trợ File System Access API.
- [x] 4.2 Chuẩn hóa dữ liệu thư mục lấy từ fallback flow để vẫn suy ra được folder root name, request submit, và quy tắc duplicate ở mức browser có thể cung cấp.
- [x] 4.3 Cập nhật thông báo lỗi cho trường hợp cả `showDirectoryPicker` và fallback đều không khả dụng, để người dùng biết rõ cần chuyển browser hay dùng flow khác.
- [ ] 4.4 Kiểm thử lại trên browser hiện tại của người dùng với case không có `showDirectoryPicker`, đồng thời xác nhận flow không upload, preview, hay sync file mà chỉ thêm `item`/`provider-item`.

## 5. Flow Correction

- [x] 5.1 Rà lại `LocalFolderModal` và wording UI để bỏ mọi tín hiệu khiến người dùng hiểu đây là luồng sync/upload file.
- [x] 5.2 Đảm bảo request gửi đi từ `add folder` chỉ chứa metadata cần cho việc tạo hoặc liên kết `item`/`data-provider-item`, không gửi file content hay danh sách file.
- [x] 5.3 Xác minh implementation không tái sử dụng logic, state, hay semantics từ `SyncLocal` ngoài phần kỹ thuật tối thiểu để lấy tên thư mục khi browser bắt buộc dùng fallback.

## 6. Browser Constraint Correction

- [x] 6.1 Loại bỏ fallback `webkitdirectory` trong `LocalFolderModal` vì browser hiển thị prompt kiểu upload nhiều file, trái với semantics của `add folder`.
- [x] 6.2 Thiết kế fallback không-upload cho browser thiếu `showDirectoryPicker`, ưu tiên form nhập/xác nhận metadata như `folderName`, `folderPath`, hoặc `folderReference`.
- [x] 6.3 Mở rộng contract và duplicate rule để dùng metadata path/name cần thiết cho việc tạo hoặc liên kết `item` và `data-provider-item`, nhưng vẫn không gửi file content hay file list.
- [ ] 6.4 Kiểm thử lại trên browser hiện tại của người dùng để xác nhận không còn popup kiểu “tải N tệp”, đồng thời flow vẫn tạo hoặc tái sử dụng `item`/`data-provider-item` đúng nghiệp vụ.
