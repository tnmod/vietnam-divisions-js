# BÁO CÁO ĐỐI SOÁT DỮ LIỆU ĐƠN VỊ HÀNH CHÍNH VIỆT NAM (V2 vs V3 vs NSO)

Báo cáo này đối chiếu dữ liệu hành chính giữa 3 tập dữ liệu:

1. **Bản cũ (v2)**: 63 tỉnh/thành, 696 quận/huyện, 10.051 xã/phường (snapshot kế
   thừa).
2. **Bản mới (v3)**: 34 tỉnh/thành, 3.321 xã/phường/đặc khu (theo Nghị quyết
   202/2025/QH15).
3. **Nguồn chính thống đối chuẩn**: Bảng chuyển đổi ĐVHC mới–cũ của Cục Thống kê
   (NSO) — `BangChuyendoiDVHCmoi_cu_final.xlsx` (10.571 dòng dữ liệu).

---

## 1. TỔNG QUAN ĐỐI SỐ

| Chỉ số                       | Bản cũ (v2) | Bản mới (v3) | Dữ liệu đối chiếu NSO | Chênh lệch / Thay đổi                               |
| :--------------------------- | :---------: | :----------: | :-------------------: | :-------------------------------------------------- |
| **Số đơn vị cấp tỉnh**       |     63      |      34      |          34           | Giảm 29 tỉnh do sáp nhập                            |
| **TP trực thuộc Trung ương** |      5      |      9       |           9           | Thêm Huế (46), Quảng Ninh (22), Bắc Ninh (24), Đồng Nai (75) |
| **Số đơn vị cấp huyện**      |     696     |      0       |           -           | Bỏ cấp huyện trung gian; 5 huyện đảo chuyển đặc khu |
| **Số đơn vị cấp xã**         |   10.051    |    3.321     |         3.321         | Giảm 6.730 đơn vị (~67%)                            |
| **Số dòng mapping mới-cũ**   |      -      |    10.571    |        10.571         | Khớp 100% dòng dữ liệu NSO                          |

---

## 2. ĐỐI CHIẾU CẤP TỈNH / THÀNH PHỐ

### 2.1. Danh sách 9 Thành phố trực thuộc Trung ương (Cập nhật theo Nghị quyết 2026 từ NSO)

1. **01** — Thành phố Hà Nội
2. **22** — Thành phố Quảng Ninh _(Nghị quyết 36/2026/QH16, hiệu lực từ
   01/09/2026)_
3. **24** — Thành phố Bắc Ninh _(Nghị quyết 39/2026/QH16, hiệu lực từ
   20/09/2026)_
4. **31** — Thành phố Hải Phòng _(sáp nhập thêm Hải Dương 30)_
5. **46** — Thành phố Huế _(chuyển từ Tỉnh Thừa Thiên Huế theo NQ 175/2024/QH15,
   hiệu lực 01/01/2025)_
6. **48** — Thành phố Đà Nẵng _(sáp nhập thêm Quảng Nam 49)_
7. **75** — Thành phố Đồng Nai _(Nghị quyết 30/2026/QH16, hiệu lực từ
   30/04/2026)_
8. **79** — Thành phố Hồ Chí Minh _(sáp nhập thêm Bà Rịa - Vũng Tàu 77, Bình
   Dương 74)_
9. **92** — Thành phố Cần Thơ _(sáp nhập thêm Hậu Giang 93, Sóc Trăng 94)_

> **Xác thực trực tiếp từ web NSO
> (https://danhmuchanhchinh.nso.gov.vn/NghiDinh.aspx)**: Dữ liệu 547 văn bản
> pháp lý đã được fetch và lưu trữ tại `data-sources/nso/resolutions.json`,
> khẳng định hiệu lực pháp lý của các Nghị quyết thành lập Thành phố Đồng Nai
> (30/04/2026), Thành phố Quảng Ninh (01/09/2026) và Thành phố Bắc Ninh
> (20/09/2026).

### 2.2. Danh sách 29 tỉnh cũ sáp nhập vào 23 tỉnh/thành mới

- **Tuyên Quang (08)** ← Hà Giang (02)
- **Lào Cai (15)** ← Lào Cai cũ (10), Yên Bái (15) _(giữ mã 15)_
- **Thái Nguyên (19)** ← Bắc Kạn (06)
- **Bắc Ninh (24)** ← Bắc Ninh cũ (27), Bắc Giang (24) _(giữ mã 24)_
- **Phú Thọ (25)** ← Vĩnh Phúc (26), Hòa Bình (17)
- **Hải Phòng (31)** ← Hải Dương (30)
- **Hưng Yên (33)** ← Thái Bình (34)
- **Ninh Bình (37)** ← Nam Định (36), Hà Nam (35)
- **Quảng Trị (44)** ← Quảng Trị cũ (45), Quảng Bình (44) _(giữ mã 44)_
- **Đà Nẵng (48)** ← Quảng Nam (49)
- **Quảng Ngãi (51)** ← Kon Tum (62)
- **Gia Lai (52)** ← Gia Lai cũ (64), Bình Định (52) _(giữ mã 52)_
- **Khánh Hòa (56)** ← Ninh Thuận (58)
- **Đắk Lắk (66)** ← Phú Yên (54)
- **Lâm Đồng (68)** ← Đắk Nông (67), Bình Thuận (60)
- **Đồng Nai (75)** ← Bình Phước (70)
- **TP. Hồ Chí Minh (79)** ← Bà Rịa - Vũng Tàu (77), Bình Dương (74)
- **Tây Ninh (80)** ← Tây Ninh cũ (72), Long An (80) _(giữ mã 80)_
- **Đồng Tháp (82)** ← Đồng Tháp cũ (87), Tiền Giang (82) _(giữ mã 82)_
- **Vĩnh Long (86)** ← Bến Tre (83), Trà Vinh (84)
- **An Giang (91)** ← An Giang cũ (89), Kiên Giang (91) _(giữ mã 91)_
- **Cần Thơ (92)** ← Hậu Giang (93), Sóc Trăng (94)
- **Cà Mau (96)** ← Bạc Liêu (95)

---

## 3. ĐỐI CHIẾU CẤP HUYỆN & 5 ĐẶC KHU ĐẢO

Theo mô hình 2 cấp, cấp huyện trung gian không còn trong danh mục hành chính v3.
Riêng 5 huyện đảo trước đây không có đơn vị cấp xã trực thuộc được sắp xếp thành
các **Đặc khu** (tương đương cấp xã):

|  Mã mới   | Tên đơn vị mới       |    Tỉnh mới     | Đơn vị cũ          | Mã huyện cũ | Tỉnh cũ |
| :-------: | :------------------- | :-------------: | :----------------- | :---------: | :-----: |
| **11948** | Đặc khu Bạch Long Vĩ | 31 (Hải Phòng)  | Huyện Bạch Long Vĩ |     318     |   31    |
| **19742** | Đặc khu Cồn Cỏ       | 44 (Quảng Trị)  | Huyện Cồn Cỏ       |     471     |   44    |
| **20333** | Đặc khu Hoàng Sa     |  48 (Đà Nẵng)   | Huyện Hoàng Sa     |     498     |   48    |
| **21548** | Đặc khu Lý Sơn       | 51 (Quảng Ngãi) | Huyện Lý Sơn       |     536     |   51    |
| **26732** | Đặc khu Côn Đảo      |   79 (TP.HCM)   | Huyện Côn Đảo      |     755     |   77    |

_(Lưu ý: Huyện Vân Đồn trước đây có 12 xã/thị trấn, nay sáp nhập toàn bộ 12 đơn
vị đó thành Đặc khu Vân Đồn — mã 06994, nên vẫn có đầy đủ 12 bản ghi mapping)._

---

## 4. ĐỐI CHIẾU CẤP XÃ & MAPPING MỚI–CŨ

### 4.1. Phân loại quan hệ mapping (10.571 dòng)

- `MERGED` (**9.464 dòng**): Sáp nhập toàn bộ diện tích & dân số của 1 hoặc
  nhiều xã cũ vào xã mới.
- `PARTIAL` (**969 dòng**): Sáp nhập một phần diện tích/dân số hoặc phần còn lại
  vào xã mới.
- `UNCHANGED` (**127 dòng**): Xã giữ nguyên địa giới và mã số (ví dụ: Xã Ia Mơ
  23938).
- `DISTRICT_CONVERTED` (**5 dòng**): Chuyển đổi toàn bộ huyện đảo thành đặc khu
  cấp xã.
- `RENAMED` (**5 dòng**): Đổi tên / đổi loại hình đơn vị hành chính.
- `UNCODED_AREA` (**1 dòng**): Khu vực bãi bồi ven biển huyện Kim Sơn nhập vào
  Xã Kim Đông (14698).

### 4.2. Trường hợp Xã Ia Mơ

- Trong file `commune.json` ban đầu của repo: Ghi nhận mã `23737` là "Xã Ia Mơ".
- Đối soát NSO:
  - Mã `23737` là **Xã Ia Mơ Nông** (Huyện Chư Păh), đã sáp nhập toàn bộ vào Xã
    Ia Ly (`23734`).
  - Mã chính thức của **Xã Ia Mơ** (Huyện Chư Prông) là **`23938`**, thuộc diện
    `UNCHANGED` (Giữ nguyên).
- Đã sửa canonical `commune.json` dùng đúng mã `23938`.

### 4.3. Đối chiếu 28 xã v2 không có trong mã cũ NSO

NSO sử dụng danh mục ĐVHC tại thời điểm ngay trước đợt sắp xếp 2025 làm mốc
"cũ". Trong khi đó, bản v2 của thư viện là snapshot từ các năm trước đó. 28 đơn
vị này là các xã đã trải qua sắp xếp trong giai đoạn 2019–2024:

- **Cao Bằng (1)**: `01651` Xã Mỹ Hưng sáp nhập theo NQ 897/NQ-UBTVQH14.
- **Tuyên Quang (1)**: `02482` Xã Phú Thịnh sáp nhập vào Xã Thái Bình.
- **Sơn La (7)**: Thuận Châu, Mộc Châu, Phù Yên, Yên Châu điều chỉnh địa giới
  khi thành lập thị xã Mộc Châu.
- **Bắc Giang (3)**: Tân An, Nham Sơn, Thắng Cương sáp nhập khi mở rộng TP Bắc
  Giang.
- **Thanh Hóa (2)**: Đông Khê, Đông Xuân thuộc huyện Đông Sơn khi sáp nhập vào
  TP Thanh Hóa.
- **Hà Tĩnh (1)**: Bình Lộc (Thạch Hà).
- **Thừa Thiên Huế (1)**: Hương Hòa (Phú Lộc / Nam Đông).
- **Quảng Nam (1)**: Quế Phước khi nhập huyện Nông Sơn vào Quế Sơn.
- **Lâm Đồng (4)**: Đạ M'ri, Mỹ Lâm, Tư Nghĩa, Phù Mỹ khi nhập 3 huyện Đạ Huoai,
  Đạ Tẻh, Cát Tiên.
- **TP. Hồ Chí Minh (7)**: Các phường tại Quận 3, Quận 10, Phú Nhuận, Bình Thạnh
  sắp xếp theo NQ 1111/NQ-UBTVQH14 (Phường 14 Bình Thạnh mã cũ 26935 thành
  26929, Phường 15 Phú Nhuận 27067 thành 27076, v.v.).

---

## 5. KẾT LUẬN & KIỂM ĐỊNH BẢO ĐẢM CHẤT LƯỢNG

1. **Tính chính thống**: 100% dữ liệu v3 và mapping được xây dựng tự động từ
   file gốc NSO `BangChuyendoiDVHCmoi_cu_final.xlsx`.
2. **Không heuristic**: Không có bất kỳ mapping nào được sinh ra bằng cách so
   khớp tên tự động.
3. **Kiểm tra tự động (CI Validation)**: Script `scripts/validate-data.cjs` kiểm
   tra toàn vẹn mọi ràng buộc khi chạy `npm test`.
4. **Trạng thái**: Toàn bộ 94/94 unit tests đạt 100%.
