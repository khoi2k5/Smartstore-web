# Danh sách Dữ liệu Hardcode (Chờ ghép API)

Tài liệu này dùng để theo dõi toàn bộ các dữ liệu hiện đang được "gắn cứng" (hardcode) trên giao diện frontend của bản MVP. 
Khi team Back-end bắt đầu ghép API, chúng ta sẽ mở file này ra và thay thế dần từng điểm dữ liệu bằng kết quả gọi từ Server.

## 1. Dữ liệu Danh sách Bàn (Tables / Entities)
- **Vị trí hiện tại:** `App.jsx` (Dòng map mảng `[1,2,3,4,5,6,7,8,9,10,11]`).
- **Mô tả:** Đang render cứng 11 bàn và 1 nút "Mang đi".
- **API tương lai cần:** `GET /api/tables` -> Trả về mảng danh sách bàn, trạng thái (trống/đang có khách) để render linh hoạt theo từng quán.

## 2. Dữ liệu Menu Sản phẩm (Products)
- **Vị trí hiện tại:** `App.jsx` (Biến state `products`).
- **Mô tả:** Đang gắn cứng Tên món, Giá tiền, Icon, Hình ảnh và Category.
- **API tương lai cần:** `GET /api/products` -> Trả về danh sách sản phẩm thực tế từ Database.

## 3. Dữ liệu Ghi chú Mặc định (Predefined Notes)
- **Vị trí hiện tại:** `App.jsx` (Biến state `predefinedNotes`).
- **Mô tả:** Mảng chứa các chuỗi ghi chú nhanh như "Ít đá", "Nhiều sữa".
- **API tương lai cần:** `GET /api/notes` -> Để chủ quán có thể tự cấu hình các nút ghi chú nhanh này.

## 4. Chức năng Thanh toán (Checkout / Quick Payment)
- **Vị trí hiện tại:** `App.jsx` (Nút "Hoàn tất & In Bill" trong Payment Modal).
- **Mô tả:** Hiện tại bấm Thanh toán chỉ hiển thị thông báo giả lập (`alert`) và reset Giỏ hàng (Cart).
- **API tương lai cần:** `POST /api/orders` -> Gửi cục data `cart` (gồm danh sách món, số lượng, topping, ghi chú, và tổng tiền) lên Server để lưu Database và in bill thật.

## 5. Dữ liệu Báo cáo Lợi nhuận (Dashboard)
- **Vị trí hiện tại:** `App.jsx` (Tab 'dashboard' - Mảng cứng `chartData`).
- **Mô tả:** Các con số Doanh thu, Chi phí, Tồn kho đang được điền cứng để làm biểu đồ đẹp mắt.
- **API tương lai cần:** `GET /api/reports/daily` -> Kéo dữ liệu thực từ tổng bill trong ngày.

## 6. Dữ liệu Nhân sự & Ca làm (HR/Shifts)
- **Vị trí hiện tại:** `App.jsx` (Tab 'hr', 'shifts').
- **Mô tả:** Gắn cứng lịch sử check-in và bảng lương.
- **API tương lai cần:** `GET /api/staff`, `POST /api/checkin` -> Để kết nối máy chấm công và tính lương thực tế.
