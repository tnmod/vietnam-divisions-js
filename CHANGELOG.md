# Changelog

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
  - `Migration.getWardMappings()` — toàn bộ bảng ánh xạ (10,977 bản ghi)
- Tree-shakable imports: `vietnam-divisions-js/v3`, `vietnam-divisions-js/migration`
- **Package renamed** from `vietnam-provinces-js` to `vietnam-divisions-js`

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
