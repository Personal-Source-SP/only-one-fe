## Context

Trang `src/app/(root)/scraping/data-providers/page.tsx` hiện đang gom nhiều khối UI vào một vùng render, dẫn đến mất cân đối không gian trên desktop và khó duy trì thứ tự ưu tiên thông tin. Đồng thời breadcrumb đang phụ thuộc header shell, làm giảm ngữ cảnh khi người dùng thao tác sâu trong module scraping.

Các ràng buộc chính gồm: giữ nguyên Refine CRUD flow hiện tại, không thay đổi resource `data-providers`, không chạm backend/API, và tuân thủ chuẩn responsive mobile/tablet/desktop cùng i18n cho mọi text hiển thị.

## Goals / Non-Goals

**Goals:**

- Chuẩn hóa bố cục trang data providers thành 3 section tách biệt: page heading + actions, filters, table.
- Ổn định UI trên desktop (>=1024px) và đảm bảo hành vi responsive nhất quán trên tablet/mobile.
- Chuyển breadcrumb sang render trong content của page/module để tăng tính ngữ cảnh và giảm phụ thuộc shell header.
- Giữ nguyên hành vi dữ liệu, sorting/filtering/action hiện có để giảm rủi ro regression.

**Non-Goals:**

- Không thay đổi schema dữ liệu, API contract, hoặc service logic.
- Không redesign toàn bộ layout shell cho các route khác ngoài phạm vi cần hỗ trợ breadcrumb placement.
- Không refactor lớn các component không liên quan trực tiếp đến trang data providers.

## Decisions

1. **Tách layout trang thành section-level composition trong module/page**

    - **Decision:** Tổ chức JSX theo 3 block rõ ràng trong `data-providers/page.tsx` (hoặc trích component module nếu vượt ngưỡng độ dài), mỗi block dùng semantic container (`section`, `header`) và spacing token nhất quán.
    - **Rationale:** Giải quyết trực tiếp vấn đề vỡ bố cục desktop, đồng thời giúp bảo trì và mở rộng action/filter/table độc lập.
    - **Alternatives considered:**
        - Giữ một `DataTableContainer` duy nhất và chỉ chỉnh CSS: nhanh nhưng khó kiểm soát hierarchy.
        - Tách toàn bộ sang custom wrapper mới: tốn công hơn cần thiết cho thay đổi scope nhỏ.

2. **Giữ `DataTableContainer` làm lõi data-grid, chỉ thay đổi vị trí và vùng bao quanh**

    - **Decision:** Không thay Refine/table hook; chỉ điều chỉnh vùng hiển thị title/actions/filter/table để đáp ứng UX mới.
    - **Rationale:** Hạn chế regression logic, giữ compatibility với luồng CRUD/filter hiện hữu.
    - **Alternatives considered:** Xây bảng mới hoàn toàn từ AntD Table thuần bị loại vì tăng rủi ro kỹ thuật.

3. **Breadcrumb render ở page content thay vì shell header**

    - **Decision:** Layout shell cho phép route/module tự render breadcrumb trong content; trang data providers chịu trách nhiệm hiển thị breadcrumb trên đầu nội dung.
    - **Rationale:** Breadcrumb trở thành ngữ cảnh theo trang cụ thể, tránh phụ thuộc vào header cố định.
    - **Alternatives considered:** Giữ breadcrumb ở header và truyền metadata theo route; phức tạp hơn, khó tùy biến module-level.

4. **Giữ i18n-first cho text mới**
    - **Decision:** Mọi label mới trong section heading/breadcrumb/action copy dùng i18n keys theo namespace scraping.
    - **Rationale:** Tuân thủ chuẩn project, tránh hardcoded text khi mở rộng đa ngôn ngữ.

## Risks / Trade-offs

- **[Risk]** Chuyển breadcrumb khỏi header có thể tạo khác biệt thị giác với các route khác → **Mitigation:** giới hạn scope cho route data providers trước, dùng spacing/token thống nhất với shell.
- **[Risk]** Tách section có thể làm duplicate một phần props truyền vào `DataTableContainer` → **Mitigation:** chuẩn hóa object props và giữ nguồn dữ liệu/hook tại một nơi.
- **[Risk]** Điều chỉnh desktop spacing gây lệch trên tablet/mobile → **Mitigation:** định nghĩa breakpoints rõ (`sm`, `md`, `lg`) và kiểm thử theo 3 nhóm viewport.

## Migration Plan

1. Cập nhật cấu trúc UI trang data providers theo section layout mới.
2. Bật cơ chế breadcrumb trong content cho route này, tắt/ẩn breadcrumb tương ứng ở header nếu đang render trùng.
3. Chạy lint + kiểm thử thủ công trên mobile/tablet/desktop cho luồng filter/action/table.
4. Nếu có regression UI, rollback bằng cách khôi phục layout cũ của page và bật lại breadcrumb tại header route này.

## Open Questions

- Route khác trong module scraping có cần cùng pattern breadcrumb-in-content ngay trong đợt này hay để follow-up change riêng?
- Có cần trích `PageSectionHeader` dùng chung cho nhiều page scraping hay giữ local để tránh mở rộng scope?
