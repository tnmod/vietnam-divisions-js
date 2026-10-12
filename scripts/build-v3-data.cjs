#!/usr/bin/env node
'use strict';
/**
 * Rebuild v3 commune + ward-mapping seeds from the official NSO workbook.
 *
 * Source of truth:
 *   data-sources/nso/BangChuyendoiDVHCmoi_cu_final.xlsx
 *   (Cục Thống kê — "Chuyển đổi ĐVHC mới-cũ",
 *    https://danhmuchanhchinh.nso.gov.vn/ → "Chuyển đổi ĐVHC mới-cũ")
 *
 * Outputs (overwritten):
 *   src/seeds/v3/commune.json        canonical 3,321 communes (codes/provinces from NSO)
 *   src/seeds/v3/ward_mappings.json  one record per NSO row, typed by `relation`
 *   data-sources/nso/report.json     build report: counts + unresolved cases
 *
 * NOT generated here (maintained by hand, checked by scripts/validate-data.cjs):
 *   src/seeds/v3/province.json       province metadata incl. 2026 resolutions
 *   src/seeds/v3/province_merges.json
 *
 * Rules:
 *   - Never match by name. Codes come from NSO only.
 *   - Display names: keep the existing library spelling (NFC) when the code is
 *     unchanged, because the NSO sheet mixes tone styles/typos ("Xa Ea Kly").
 *   - Anything that cannot be classified fails the build.
 */
const fs = require('fs');
const path = require('path');
const { openWorkbook } = require('./lib/xlsx.cjs');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(
	ROOT,
	'data-sources/nso/BangChuyendoiDVHCmoi_cu_final.xlsx'
);
const SHEET = 'Tổng hợp_không merge';
const V3 = path.join(ROOT, 'src/seeds/v3');
const V2 = path.join(ROOT, 'src/seeds/vietnam');

const readJson = (p) =>
	JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
const writeJson = (p, data) =>
	fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');

const clean = (s) => {
	if (s == null) return null;
	const v = String(s).normalize('NFC').replace(/\s+/g, ' ').trim();
	return v === '' ? null : v;
};
/** Excel stores some codes as numbers and drops leading zeros. */
const padCode = (s, len) => {
	const v = clean(s);
	if (v == null) return null;
	if (!/^\d+$/.test(v)) throw new Error(`Non-numeric code: "${v}"`);
	return v.padStart(len, '0');
};
/** "Quận Ba Đình (001)" → { name: "Quận Ba Đình", code: "001" } */
const splitLabel = (s, len) => {
	const v = clean(s);
	if (v == null) return { name: null, code: null };
	const m = v.match(/^(.*?)\s*\((\d+)\)$/);
	return m
		? { name: m[1], code: m[2].padStart(len, '0') }
		: { name: v, code: null };
};

/**
 * Map the free-text "Ghi chú" column to a closed set of relation types.
 * @returns {'UNCHANGED'|'RENAMED'|'MERGED'|'PARTIAL'|'DISTRICT_CONVERTED'|'UNCODED_AREA'}
 */
const classify = (note, oldCode) => {
	const n = (note || '').toLowerCase();
	if (/^sắp xếp toàn bộ huyện/.test(n)) return 'DISTRICT_CONVERTED';
	if (oldCode == null) return 'UNCODED_AREA';
	if (/^giữ nguyên/.test(n)) return 'UNCHANGED';
	if (/một phần|phần còn lại/.test(n)) return 'PARTIAL';
	if (/^đổi tên|^đổi loại hình|^sắp xếp toàn bộ xã/.test(n)) return 'RENAMED';
	if (/^nhập toàn bộ/.test(n)) return 'MERGED';
	return null;
};

const main = () => {
	const wb = openWorkbook(SOURCE);
	const rows = wb.readSheet(SHEET);

	const v3Provinces = readJson(path.join(V3, 'province.json'));
	const v3ProvinceById = new Map(v3Provinces.map((p) => [p.idProvince, p]));
	const prevCommunes = readJson(path.join(V3, 'commune.json'));
	const prevCommuneById = new Map(prevCommunes.map((c) => [c.idCommune, c]));
	const v2Provinces = new Map(
		readJson(path.join(V2, 'province.json')).map((p) => [p.idProvince, p])
	);
	const v2Districts = new Map(
		readJson(path.join(V2, 'district.json')).map((d) => [d.idDistrict, d])
	);
	const v2Communes = new Map(
		readJson(path.join(V2, 'commune.json')).map((c) => [c.idCommune, c])
	);

	const errors = [];
	const header = rows.find((r) => r.row === 2);
	const expectedHeader = [
		'Tỉnh, thành phố',
		'Tên Xã mới',
		'Mã Xã mới',
		'Tên Xã cũ',
		'Mã Xã cũ',
		'Ghi chú',
		'Quận/huyện',
		'Tỉnh cũ',
	];
	if (!header || expectedHeader.some((h, i) => clean(header.cells[i]) !== h)) {
		throw new Error(
			`Unexpected header in "${SHEET}": ${JSON.stringify(header && header.cells)}`
		);
	}

	// ---- parse NSO rows ----------------------------------------------------
	const records = [];
	for (const { row, cells } of rows) {
		if (row <= 2 || !clean(cells[2])) continue; // title/header/province banner rows
		const newProvince = splitLabel(cells[0], 2);
		const oldDistrict = splitLabel(cells[6], 3);
		const oldProvince = splitLabel(cells[7], 2);
		const rec = {
			row,
			newProvinceCode: newProvince.code,
			newWardName: clean(cells[1]),
			newWardCode: padCode(cells[2], 5),
			oldWardName: clean(cells[3]),
			oldWardCode:
				cells[4] == null || clean(cells[4]) == null
					? null
					: padCode(cells[4], 5),
			note: clean(cells[5]),
			oldDistrictCode: oldDistrict.code,
			oldDistrictName: oldDistrict.name,
			oldProvinceCode: oldProvince.code,
			oldProvinceName: oldProvince.name,
		};
		rec.relation = classify(rec.note, rec.oldWardCode);
		if (!rec.relation)
			errors.push(`row ${row}: cannot classify note "${rec.note}"`);
		if (!rec.newProvinceCode)
			errors.push(`row ${row}: missing new province code`);
		records.push(rec);
	}

	// ---- canonical communes ----------------------------------------------
	const nsoCommunes = new Map();
	const nsoNameVariants = [];
	for (const r of records) {
		const prev = nsoCommunes.get(r.newWardCode);
		if (prev) {
			if (prev.idProvince !== r.newProvinceCode)
				errors.push(
					`commune ${r.newWardCode} appears under provinces ${prev.idProvince} and ${r.newProvinceCode}`
				);
			if (prev.nsoName !== r.newWardName)
				nsoNameVariants.push({
					code: r.newWardCode,
					names: [prev.nsoName, r.newWardName],
				});
			continue;
		}
		nsoCommunes.set(r.newWardCode, {
			idProvince: r.newProvinceCode,
			idCommune: r.newWardCode,
			nsoName: r.newWardName,
		});
	}

	const nameDiffs = [];
	const communes = [...nsoCommunes.values()]
		.sort((a, b) => a.idCommune.localeCompare(b.idCommune))
		.map((c) => {
			const prev = prevCommuneById.get(c.idCommune);
			const name = prev ? clean(prev.name) : c.nsoName;
			if (prev && name !== c.nsoName)
				nameDiffs.push({ code: c.idCommune, library: name, nso: c.nsoName });
			if (!v3ProvinceById.has(c.idProvince))
				errors.push(`commune ${c.idCommune}: unknown province ${c.idProvince}`);
			return { idProvince: c.idProvince, idCommune: c.idCommune, name };
		});
	const communeById = new Map(communes.map((c) => [c.idCommune, c]));

	const removedCommunes = prevCommunes.filter(
		(c) => !nsoCommunes.has(c.idCommune)
	);
	const addedCommunes = communes.filter(
		(c) => !prevCommuneById.has(c.idCommune)
	);

	// ---- mappings ----------------------------------------------------------
	const oldNotInV2 = [];
	const mappings = records.map((r) => {
		const v2c = r.oldWardCode ? v2Communes.get(r.oldWardCode) : undefined;
		if (r.oldWardCode && !v2c)
			oldNotInV2.push({
				row: r.row,
				oldWardCode: r.oldWardCode,
				oldWardName: r.oldWardName,
			});
		const v2d = r.oldDistrictCode
			? v2Districts.get(r.oldDistrictCode)
			: undefined;
		const v2p = r.oldProvinceCode
			? v2Provinces.get(r.oldProvinceCode)
			: undefined;
		const newProvince = v3ProvinceById.get(r.newProvinceCode);
		return {
			oldWardCode: r.oldWardCode,
			oldWardName: v2c ? clean(v2c.name) : r.oldWardName,
			oldDistrictCode: r.oldDistrictCode,
			oldDistrictName: v2d ? clean(v2d.name) : r.oldDistrictName,
			oldProvinceCode: r.oldProvinceCode,
			oldProvinceName: v2p ? clean(v2p.name) : r.oldProvinceName,
			newWardCode: r.newWardCode,
			newWardName: communeById.get(r.newWardCode).name,
			newProvinceCode: r.newProvinceCode,
			newProvinceName: newProvince ? newProvince.name : null,
			relation: r.relation,
			note: r.note,
		};
	});

	const nsoOldCodes = new Set(
		records.map((r) => r.oldWardCode).filter(Boolean)
	);
	const v2NotInNso = [...v2Communes.values()]
		.filter((c) => !nsoOldCodes.has(c.idCommune))
		.map((c) => ({
			idCommune: c.idCommune,
			idDistrict: c.idDistrict,
			name: clean(c.name),
		}));

	if (errors.length) {
		console.error(errors.join('\n'));
		throw new Error(`Build failed with ${errors.length} error(s)`);
	}

	writeJson(path.join(V3, 'commune.json'), communes);
	writeJson(path.join(V3, 'ward_mappings.json'), mappings);

	const byRelation = {};
	for (const m of mappings)
		byRelation[m.relation] = (byRelation[m.relation] || 0) + 1;

	const report = {
		source: {
			file: path.relative(ROOT, SOURCE).replace(/\\/g, '/'),
			url: 'https://danhmuchanhchinh.nso.gov.vn/TAPTIN/BangChuyendoi%C4%90VHCmoi_cu_final.xlsx',
			sheet: SHEET,
			effectiveDate: '2025-07-01',
		},
		counts: {
			nsoRows: records.length,
			communes: communes.length,
			provinces: new Set(communes.map((c) => c.idProvince)).size,
			mappings: mappings.length,
			mappingsWithoutOldWardCode: mappings.filter((m) => !m.oldWardCode).length,
			byRelation,
		},
		communeChanges: { removed: removedCommunes, added: addedCommunes },
		unresolved: {
			oldWardCodesNotInV2Snapshot: oldNotInV2,
			v2CommunesWithoutNsoMapping: v2NotInNso,
		},
		nameDifferences: {
			libraryVsNso: nameDiffs,
			nsoInternalVariants: nsoNameVariants,
		},
	};
	writeJson(path.join(ROOT, 'data-sources/nso/report.json'), report);

	console.log(JSON.stringify(report.counts, null, 2));
	console.log('commune changes:', JSON.stringify(report.communeChanges));
	console.log('old codes not in v2 snapshot:', oldNotInV2.length);
	console.log('v2 communes without NSO mapping:', v2NotInNso.length);
};

main();
