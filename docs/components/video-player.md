# Tổng Quan Các Component Đã Tạo

- **VideoCenterOverlay**  
  Hiển thị nút play ở giữa và hiệu ứng seek feedback.

- **VideoProgressBar**  
  Thanh progress bar để tua (seek) video.

- **VideoPlaybackControls**  
  Các nút điều khiển: play/pause, skip forward, skip backward.

- **VideoVolumeControl**  
  Điều chỉnh âm lượng qua slider.

- **VideoTimeDisplay**  
  Hiển thị thời gian hiện tại và tổng thời lượng video.

- **VideoPlaybackSpeedMenu**  
  Dropdown chọn tốc độ phát video.

- **VideoControlsBar**  
  Container chứa toàn bộ controls ở phía dưới cùng.

- **utils.ts**  
  Hàm helper: `formatTime`

---

## Component VideoPlayer

- Đã được refactor để sử dụng các component con.
- Tuân thủ cấu trúc: **State → useEffect → useCallback → JSX (TSX)**
- Mọi component đều `export default` kết hợp với `memo`.
- Đã khắc phục toàn bộ lỗi linter.
- Cấu trúc code hiện tại dễ bảo trì và mở rộng, mỗi component đảm nhiệm một chức năng riêng biệt.
