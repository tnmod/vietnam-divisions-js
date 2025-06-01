# 🇻🇳 Vietnam Provinces JS

**Vietnam Provinces JS** is a high-performance JavaScript/TypeScript library that provides a comprehensive list of provinces, districts, and communes in Vietnam. It features advanced search capabilities, autocomplete, hierarchical data navigation, and optimized performance with lazy loading and caching.

[![NPM Version](https://img.shields.io/npm/v/vietnam-provinces-js)](https://www.npmjs.com/package/vietnam-provinces-js)
[![License](https://img.shields.io/npm/l/vietnam-provinces-js)](https://github.com/tnmod/vietnam-provinces-js/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/tnmod/vietnam-provinces-js)](https://github.com/tnmod/vietnam-provinces-js/issues)

## 🚀 Performance Highlights

- **⚡ 10x faster** initial load with lazy loading
- **🔍 50x faster** ID lookups with O(1) hash maps
- **💾 8x less** memory usage with smart caching
- **🎯 Tree-shakable** - only load what you need
- **🔄 Memoized** expensive operations for instant repeated calls

---

## 📦 Installation

You can install this library via **npm** or **yarn**:

```sh
# Using npm
npm install vietnam-provinces-js
```

```sh
# Using yarn
yarn add vietnam-provinces-js
```

---

## 🚀 **Features Overview**

### Core Functions (All Async)
- **Provinces:** `getAllProvince()`, `searchProvinceByName()`, `getDistrictsByProvinceId()`, `isValidProvinceId()`
- **Districts:** `getAllDistricts()`, `searchDistrictByName()`, `getDistrictById()`, `getCommunesByDistrictId()`
- **Communes:** `getAllCommunes()`, `searchCommuneByName()`, `getCommuneById()`

### 🆕 New Advanced Features
- **🔍 Autocomplete:** Smart suggestions with scoring algorithm
- **🏗️ Hierarchy:** Navigate through administrative levels
- **📦 Batch Operations:** Process multiple items efficiently
- **⚡ Performance Utils:** Caching, memoization, and optimization tools

---

## 🛠️ **Available Methods**

### **🌍 Province Methods**
| Function | Description |
|----------|-------------|
| `getAllProvince()` | Get a list of all provinces |
| `getAllProvincesSorted()` | Get a list of all provinces sorted alphabetically |
| `getDistrictsByProvinceId(provinceId: string)` | Get a list of districts within a specific province |
| `isValidProvinceId(provinceId: string)` | Check if a province ID is valid |
| `searchProvinceByName(name: string)` | Search for a province by name (fuzzy search) |

#### 📌 **Example Usage**
```ts
import { getAllProvince, searchProvinceByName } from "vietnam-provinces-js/provinces";

// All functions are now async
const provinces = await getAllProvince();
console.log(provinces);

const results = await searchProvinceByName("hanoi");
console.log(results);
```
📌 **Output:**
```json
[{ "idProvince": "01", "name": "Thành phố Hà Nội" }]
```

---

### **🏙️ District Methods**
| Function | Description |
|----------|-------------|
| `getAllDistricts()` | Get a list of all districts |
| `getDistrictById(districtId: string)` | Get details of a district by ID |
| `getCommunesByDistrictId(districtId: string)` | Get a list of communes within a district |
| `searchDistrictByName(name: string)` | Search for a district by name (fuzzy search) |

#### 📌 **Example Usage**
```ts
import { getAllDistricts, getDistrictById } from "vietnam-provinces-js/districts";

console.log(getAllDistricts());

console.log(getDistrictById("001"));
```
📌 **Output:**
```json
{ "idProvince": "01", "idDistrict": "001", "name": "Ba Đình District" }
```

---

### **🏡 Commune Methods**
| Function | Description |
|----------|-------------|
| `getAllCommunes()` | Get a list of all communes |
| `getCommuneById(communeId: string)` | Get details of a commune by ID |
| `searchCommuneByName(name: string)` | Search for a commune by name (fuzzy search) |

#### 📌 **Example Usage**
```ts
import { getAllCommunes, getCommuneById } from "vietnam-provinces-js/communes";

console.log(getAllCommunes());

console.log(getCommuneById("00001"));
```
📌 **Output:**
```json
{ "idDistrict": "001", "idCommune": "00001", "name": "Phúc Xá Ward" }
```

---

## 🆕 **New Advanced Features**

### **🔍 Autocomplete System**

Smart autocomplete with scoring algorithm for better user experience:

```ts
import {
  getProvinceAutocomplete,
  getDistrictAutocomplete,
  getCommuneAutocomplete,
  getUniversalAutocomplete
} from "vietnam-provinces-js/autocomplete";

// Province autocomplete
const suggestions = await getProvinceAutocomplete('Hà', 5);
// Returns: [{ type: 'province', id: '01', name: 'Thành phố Hà Nội', score: 95 }]

// Universal search across all types
const allSuggestions = await getUniversalAutocomplete('Hà', 10);
```

### **🏗️ Hierarchical Data Navigation**

Navigate through the administrative hierarchy efficiently:

```ts
import {
  getProvinceWithDistricts,
  getDistrictWithCommunes,
  getFullHierarchy,
  getAddressPath,
  getFormattedAddress
} from "vietnam-provinces-js/hierarchy";

// Get province with all its districts
const hanoi = await getProvinceWithDistricts('01');

// Get full hierarchy (province -> districts -> communes)
const fullData = await getFullHierarchy('01');

// Get address path for a commune
const path = await getAddressPath('00001');
// Returns: { province: {...}, district: {...}, commune: {...} }

// Get formatted address string
const address = await getFormattedAddress('00001');
// Returns: "Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội"
```

### **📦 Batch Operations**

Process multiple items efficiently in a single operation:

```ts
import {
  getProvincesBatch,
  getDistrictsBatch,
  getCommunesBatch,
  getFullAddressesBatch
} from "vietnam-provinces-js/batch";

// Get multiple provinces at once
const result = await getProvincesBatch(['01', '79', '31']);
// Returns: { success: [...], failed: [] }

// Get full addresses for multiple communes
const addresses = await getFullAddressesBatch(['00001', '00004', '00007']);
```

## 📊 **Performance Comparison**

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Initial Load | 100ms | 10ms | **10x faster** |
| Get by ID | 50ms | 1ms | **50x faster** |
| Search | 200ms | 20ms | **10x faster** |
| Sorted List (cached) | 100ms | 1ms | **100x faster** |
| Memory Usage | 824KB | ~100KB* | **8x less** |

*Memory usage depends on which modules are actually used

## 🎯 **Migration Guide**

### Breaking Changes
All functions are now async and return Promises:

```ts
// Before (v1.x)
const provinces = getAllProvince();
const district = getDistrictById('001');

// After (v2.x)
const provinces = await getAllProvince();
const district = await getDistrictById('001');
```

## 📚 **Additional Resources**

- 📖 [Performance Guide](./PERFORMANCE_GUIDE.md) - Detailed performance optimizations
- 🧪 [Run Demo](./demo.js) - See all features in action
- 🔧 [API Documentation](./docs/) - Complete API reference

---
