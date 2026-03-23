# Vietnam Divisions JS

Thư viện JavaScript/TypeScript cung cấp dữ liệu hành chính Việt Nam. Hỗ trợ cả hệ thống cũ (63 tỉnh, 3 cấp) và hệ thống mới theo Nghị quyết 202/2025/QH15 (34 tỉnh, 2 cấp).

> **Đã đổi tên** từ `vietnam-divisions-js` sang `vietnam-divisions-js` kể từ v3.0.0.

### NPMJS
LINK: [vietnam-divisions-js](https://www.npmjs.com/package/vietnam-divisions-js)
OLD: [vietnam-provinces-js](https://www.npmjs.com/package/vietnam-provinces-js)

```sh
npm install vietnam-divisions-js
```

## Sử dụng

### Dữ liệu cũ (v2) — 63 tỉnh, 3 cấp: Tỉnh → Quận/Huyện → Xã/Phường

```typescript
import { Provinces, Districts, Communes } from 'vietnam-divisions-js';

const provinces = await Provinces.getAllProvince();          // 63 tỉnh
const districts = await Districts.getAllDistricts();          // 696 quận/huyện
const communes  = await Communes.getAllCommunes();            // 10,051 xã/phường

const hanoi    = await Provinces.searchProvinceByName('Hà Nội');
const district = await Districts.getDistrictById('001');
const commune  = await Communes.getCommuneById('00001');
```

### Dữ liệu mới (v3) — 34 tỉnh, 2 cấp: Tỉnh/TP → Xã/Phường

Theo NQ 202/2025/QH15, hệ thống hành chính mới bỏ cấp quận/huyện.

```typescript
import { v3 } from 'vietnam-divisions-js';

const provinces = await v3.getAllProvinces();                 // 34 tỉnh
const hcm       = await v3.getProvinceByCode('HCM');         // tìm theo mã 3 ký tự
const communes  = await v3.getCommunesByProvinceId('79');     // xã/phường thuộc tỉnh
const search    = await v3.searchProvinceByName('Đà Nẵng');
```

### Migration — Chuyển đổi dữ liệu cũ ↔ mới

```typescript
import { Migration } from 'vietnam-divisions-js';

// Chuyển mã xã cũ → mới
const mapped = await Migration.migrateWardCode('26881');

// Tra cứu tỉnh sáp nhập
const merged = await Migration.getMergedProvince('02');
// → { oldProvinceId: '02', oldProvinceName: 'Hà Giang', newProvinceId: '08', newProvinceName: 'Tuyên Quang' }

// Batch migrate
const results = await Migration.batchMigrateWardCodes(['26881', '00004']);

// Xem toàn bộ danh sách sáp nhập
const allMerges = await Migration.getAllMergedProvinces();
```

### Dùng cả v2 + v3 trong cùng 1 app

```typescript
import { Provinces, v3, Migration } from 'vietnam-divisions-js';

// Hiển thị địa chỉ cũ từ database
const oldProvince = await Provinces.getProvinceById('02');     // Hà Giang

// Chuyển sang địa chỉ mới
const merged = await Migration.getMergedProvince('02');         // → Tuyên Quang
const newProvince = await v3.getProvinceById(merged.newProvinceId);
```

### Tree-shaking — Import trực tiếp

```typescript
import { getAllProvinces } from 'vietnam-divisions-js/v3';
import { migrateWardCode } from 'vietnam-divisions-js/migration';
```

## Dữ liệu

| | v2 (cũ) | v3 (NQ 202/2025) |
|---|---|---|
| Tỉnh/TP | 63 | 34 |
| Quận/Huyện | 696 | — (đã bỏ) |
| Xã/Phường | 10,051 | 3,321 |
| Ánh xạ cũ→mới | — | 10,977 |

## License

MIT — [tnmod](https://github.com/tnmod)
