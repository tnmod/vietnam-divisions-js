# 🇻🇳 Vietnam Provinces JS

**Vietnam Provinces JS** is a JavaScript/TypeScript library that provides a comprehensive list of provinces, districts, and communes in Vietnam. It supports searching by name, ID, and provides structured data for web applications and APIs.

[![NPM Version](https://img.shields.io/npm/v/vietnam-provinces-js)](https://www.npmjs.com/package/vietnam-provinces-js)
[![License](https://img.shields.io/npm/l/vietnam-provinces-js)](https://github.com/tnmod/vietnam-provinces-js/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/tnmod/vietnam-provinces-js)](https://github.com/tnmod/vietnam-provinces-js/issues)

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

## 🚀 **Summary**
- **Provinces:** `getAllProvince()`, `searchProvinceByName()`, `getDistrictsByProvinceId()`, `isValidProvinceId()`
- **Districts:** `getAllDistricts()`, `searchDistrictByName()`, `getDistrictById()`, `getCommunesByDistrictId()`
- **Communes:** `getAllCommunes()`, `searchCommuneByName()`, `getCommuneById()`

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

console.log(getAllProvince());

console.log(searchProvinceByName("hanoi"));
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

