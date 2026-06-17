# Các tình huống (Use Cases) của tính năng Giỏ Hàng (Cart)

Dưới đây là những tình huống thực tế của người dùng khi tương tác với giỏ hàng trên hệ thống TechShop:

## 1. Thêm đồ vào giỏ
- **Dạo quanh và nhặt đồ:** Thêm sản phẩm vào giỏ ngay từ trang chủ hoặc trang danh mục mà không cần vào xem chi tiết.
- **Mua số lượng lớn:** Nhập số lượng mong muốn (ví dụ: 3) tại trang chi tiết trước khi bấm "Thêm vào giỏ".
- **Mua nhanh (Buy Now):** Bấm "Mua ngay" để đưa sản phẩm vào giỏ và chuyển thẳng sang trang thanh toán.

## 2. Quản lý số lượng & Xóa sản phẩm
- **Tăng/Giảm số lượng:** Bấm nút `+` hoặc `-` trong giỏ hàng. Tổng tiền tự động cập nhật ngay lập tức.
- **Giảm về 0:** Giảm số lượng về 0 sẽ tự động xóa sản phẩm đó khỏi giỏ.
- **Xóa hẳn món đồ:** Bấm vào icon thùng rác để xóa nhanh một sản phẩm và giảm tổng tiền.

## 3. Lựa chọn mua một phần (Checkout Selected Items)
- **Chỉ thanh toán món đồ cần thiết:** Chọn (tick) hoặc bỏ chọn (uncheck) các sản phẩm trong giỏ. Hệ thống chỉ mang những món được chọn qua trang thanh toán. Những món chưa chọn vẫn lưu lại trong giỏ hàng cho lần mua sau.

## 4. Dùng thử mã giảm giá
- **Áp dụng thành công:** Nhập mã hợp lệ, hệ thống áp dụng và hiển thị số tiền được giảm giá.
- **Mã lỗi/Hết hạn:** Nhập mã sai hoặc hết hạn, hệ thống báo lỗi rõ ràng.

## 5. Mua sắm ẩn danh và Đăng nhập (Hybrid Cart & Merge)
- **Mua sắm ẩn danh (Guest):** Khách hàng chưa đăng nhập vẫn có thể thêm sản phẩm vào giỏ bình thường.
- **Đồng bộ giỏ hàng (Merge):** Khi khách hàng quyết định đăng nhập, các sản phẩm trong giỏ khách vãng lai sẽ được tự động gộp (merge) chung vào giỏ hàng thực tế của tài khoản đó (trên server) mà không bị mất đi.

## 6. Giới hạn tồn kho
- **Mua vượt quá tồn kho:** Nếu khách hàng nhập số lượng lớn hơn số hàng còn trong kho, hệ thống chặn lại và báo lỗi "Số lượng tồn kho không đủ".

## 7. Bỏ quên giỏ hàng (Cart Abandonment)
- **Lưu trữ phiên (Session Persistence):** Khách hàng đang chọn đồ nhưng thoát trang giữa chừng. Lần sau quay lại (hoặc ngày hôm sau), các sản phẩm vẫn nằm nguyên trong giỏ hàng nhờ vào Session Id hoặc lưu Database đối với user đã đăng nhập.
