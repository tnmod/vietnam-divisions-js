'use strict';
const fs = require('fs');

const v2Provinces = JSON.parse(
	fs.readFileSync('./src/seeds/vietnam/province.json')
);
const v2Districts = JSON.parse(
	fs.readFileSync('./src/seeds/vietnam/district.json')
);
const v2Communes = JSON.parse(
	fs.readFileSync('./src/seeds/vietnam/commune.json')
);

const v3Provinces = JSON.parse(fs.readFileSync('./src/seeds/v3/province.json'));
const v3Communes = JSON.parse(fs.readFileSync('./src/seeds/v3/commune.json'));
const v3Mappings = JSON.parse(
	fs.readFileSync('./src/seeds/v3/ward_mappings.json')
);
const v3Merges = JSON.parse(
	fs.readFileSync('./src/seeds/v3/province_merges.json')
);

console.log('=== THỐNG KÊ TỔNG THỂ ===');
console.log('v2 Provinces:', v2Provinces.length);
console.log('v2 Districts:', v2Districts.length);
console.log('v2 Communes:', v2Communes.length);
console.log('v3 Provinces:', v3Provinces.length);
console.log('v3 Communes:', v3Communes.length);
console.log('v3 Mappings:', v3Mappings.length);

console.log('\n=== CƠ CẤU QUAN HỆ MAPPING (RELATIONS) ===');
const relCount = {};
for (const m of v3Mappings)
	relCount[m.relation] = (relCount[m.relation] || 0) + 1;
console.log(relCount);

console.log('\n=== ĐỐI CHIẾU CẤP TỈNH ===');
console.log('Tỉnh nhận sáp nhập (merges):', v3Merges.length);
const mergedOld = [];
for (const m of v3Merges) {
	for (const f of m.mergedFrom) {
		mergedOld.push(
			`${f.oldProvinceId} ${f.oldProvinceName} -> ${m.newProvinceId} ${m.newProvinceName}`
		);
	}
}
console.log('Tổng số tỉnh cũ sáp nhập:', mergedOld.length);

console.log('\n=== PHÂN BỐ XÃ THEO TỈNH ===');
const communeCountByProvince = {};
for (const c of v3Communes) {
	communeCountByProvince[c.idProvince] =
		(communeCountByProvince[c.idProvince] || 0) + 1;
}
const pMap = new Map(v3Provinces.map((p) => [p.idProvince, p.name]));
const sortedP = Object.entries(communeCountByProvince).sort(
	(a, b) => b[1] - a[1]
);
console.log('Top 5 tỉnh nhiều xã nhất:');
for (const [id, count] of sortedP.slice(0, 5)) {
	console.log(' ', id, pMap.get(id), ':', count, 'xã');
}
console.log('Top 5 tỉnh ít xã nhất:');
for (const [id, count] of sortedP.slice(-5)) {
	console.log(' ', id, pMap.get(id), ':', count, 'xã');
}

console.log('\n=== CHI TIẾT 6 TRƯỜNG HỢP NULL OLD CODE ===');
const nullOldMappings = v3Mappings.filter((m) => m.oldWardCode === null);
console.log(nullOldMappings);
