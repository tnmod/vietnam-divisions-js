# Changelog

## [3.0.1] - 2026-10-05

### Fixed
- `commune.json`: Xã Ia Mơ dùng đúng mã NSO `23938` (trước đây là `23737` — Xã Ia Mơ Nông đã sáp nhập vào Xã Ia Ly)
- `ward_mappings.json` được tái tạo từ bảng chuyển đổi chính thức của Cục Thống kê (10,571 bản ghi, kèm `relation`, `note`, mã huyện/tỉnh cũ)
- Chuẩn hoá Unicode NFC cho 32 tên xã/phường
- Các hàm tra cứu v3/migration trả về kết quả rỗng thay vì lỗi với đầu vào rỗng/`null`/`undefined`

### Changed
- Quảng Ninh (22), Bắc Ninh (24), Đồng Nai (75) là Thành phố trực thuộc Trung ương (NQ 36/2026/QH16, 39/2026/QH16, 30/2026/QH16) — tổng 9 TP trực thuộc TW
- `WardMapping.oldWardCode` có thể là `null` (5 đặc khu đảo + 1 khu vực chưa có mã); thêm type `WardMappingRelation`

### Added
- Scripts: `npm run validate`, `npm run rebuild:data`, `npm run fetch:legal`; `npm test` chạy validator dữ liệu trước vitest

## [3.0.0] - 2025-06-23

### Added
- **v3 API** — Dữ liệu hành chính mới theo Nghị quyết 202/2025/QH15 (34 tỉnh, 2 cấp: Tỉnh/TP → Xã/Phường)
  - `v3.getAllProvinces()`, `v3.getProvinceById()`, `v3.getProvinceByCode()`
  - `v3.getAllCommunes()`, `v3.getCommuneById()`, `v3.getCommunesByProvinceId()`
  - `v3.searchProvinceByName()`, `v3.searchCommuneByName()`
- **Migration module** — Chuyển đổi dữ liệu giữa hệ thống cũ (63 tỉnh) và mới (34 tỉnh)
  - `Migration.migrateWardCode()` — mã xã cũ → mới
  - `Migration.reverseMigrateWardCode()` — mã xã mới → cũ
  - `Migration.batchMigrateWardCodes()` — batch migrate
  - `Migration.getMergedProvince()` — tra cứu tỉnh sáp nhập
  - `Migration.getAllMergedProvinces()` — danh sách sáp nhập
  - `Migration.isProvinceMerged()` — kiểm tra tỉnh có bị sáp nhập
  - `Migration.getWardMappings()` — toàn bộ bảng ánh xạ (10,571 bản ghi)
- Tree-shakable imports: `vietnam-divisions-js/v3`, `vietnam-divisions-js/migration`
- **Package renamed** from `vietnam-divisions-js` to `vietnam-divisions-js`

### Unchanged
- API cũ (`Provinces`, `Districts`, `Communes`) hoạt động y nguyên — không breaking change
- Dùng được cả v2 + v3 trong cùng 1 app

## [2.0.0] - 2024-12-19

### Added
- Lazy loading, O(1) lookup, memoization
- Autocomplete, hierarchy, batch, analytics, validation, export, fuzzy search
- All functions now async

### Breaking Changes
- Tất cả functions chuyển sang async/await

## [1.1.2]

- Dữ liệu cơ bản: 63 tỉnh, 696 quận/huyện, 10,051 xã/phường
- Tìm kiếm đơn giản
