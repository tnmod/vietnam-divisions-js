#!/usr/bin/env node
'use strict';
/**
 * Data validation script for v3 seeds.
 *
 * Checks:
 *   - province.json: 34 provinces, 9 central cities, unique IDs and codes.
 *   - commune.json: 3,321 communes, valid province refs, Ia Mơ code 23938.
 *   - province_merges.json: valid references to new provinces and valid old province IDs.
 *   - ward_mappings.json: 10,571 mappings from official NSO data,
 *                         valid newWardCode refs, valid relation types,
 *                         exactly 6 null oldWardCode records (5 island districts + 1 uncoded area).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const V3 = path.join(ROOT, 'src/seeds/v3');

const readJson = (file) =>
	JSON.parse(
		fs.readFileSync(path.join(V3, file), 'utf8').replace(/^\uFEFF/, '')
	);

const ALLOWED_RELATIONS = new Set([
	'UNCHANGED',
	'RENAMED',
	'MERGED',
	'PARTIAL',
	'DISTRICT_CONVERTED',
	'UNCODED_AREA',
]);

const CENTRAL_CITIES = new Set([
	'01',
	'22',
	'24',
	'31',
	'46',
	'48',
	'75',
	'79',
	'92',
]);

const validate = () => {
	const errors = [];
	const warnings = [];

	console.log('🔍 Validating v3 administrative datasets...');

	// 1. Province validation
	const provinces = readJson('province.json');
	if (!Array.isArray(provinces) || provinces.length !== 34) {
		errors.push(
			`province.json: expected 34 provinces, got ${provinces.length}`
		);
	}

	const provinceIdSet = new Set();
	const provinceCodeSet = new Set();
	let centralCityCount = 0;

	for (const p of provinces) {
		if (!/^\d{2}$/.test(p.idProvince)) {
			errors.push(`province.json: invalid idProvince "${p.idProvince}"`);
		}
		if (provinceIdSet.has(p.idProvince)) {
			errors.push(`province.json: duplicate idProvince "${p.idProvince}"`);
		}
		provinceIdSet.add(p.idProvince);

		if (!p.code || provinceCodeSet.has(p.code.toUpperCase())) {
			errors.push(`province.json: duplicate or missing code "${p.code}"`);
		}
		provinceCodeSet.add(p.code.toUpperCase());

		if (p.placeType === 'Thành phố Trung Ương') {
			centralCityCount++;
			if (!CENTRAL_CITIES.has(p.idProvince)) {
				errors.push(
					`province.json: unexpected central city idProvince "${p.idProvince}" (${p.name})`
				);
			}
		}
	}

	if (centralCityCount !== 9) {
		errors.push(
			`province.json: expected 9 centrally-governed cities, got ${centralCityCount}`
		);
	}

	// 2. Commune validation
	const communes = readJson('commune.json');
	if (!Array.isArray(communes) || communes.length !== 3321) {
		errors.push(
			`commune.json: expected 3,321 communes, got ${communes.length}`
		);
	}

	const communeIdMap = new Map();
	for (const c of communes) {
		if (!/^\d{5}$/.test(c.idCommune)) {
			errors.push(`commune.json: invalid idCommune "${c.idCommune}"`);
		}
		if (communeIdMap.has(c.idCommune)) {
			errors.push(`commune.json: duplicate idCommune "${c.idCommune}"`);
		}
		communeIdMap.set(c.idCommune, c);

		if (!provinceIdSet.has(c.idProvince)) {
			errors.push(
				`commune.json: commune ${c.idCommune} references unknown idProvince "${c.idProvince}"`
			);
		}
	}

	// Check Ia Mơ
	const iaMo = communeIdMap.get('23938');
	if (!iaMo || iaMo.name !== 'Xã Ia Mơ' || iaMo.idProvince !== '52') {
		errors.push(
			`commune.json: Ia Mơ must have code 23938 in province 52, got: ${JSON.stringify(iaMo)}`
		);
	}
	if (communeIdMap.has('23737')) {
		errors.push(
			'commune.json: code 23737 must NOT exist in v3 (it was Ia Mơ Nông, merged into Ia Ly 23734)'
		);
	}

	// 3. Province merges validation
	const merges = readJson('province_merges.json');
	const mergedOldIds = new Set();
	for (const m of merges) {
		if (!provinceIdSet.has(m.newProvinceId)) {
			errors.push(
				`province_merges.json: unknown newProvinceId "${m.newProvinceId}"`
			);
		}
		for (const old of m.mergedFrom) {
			if (mergedOldIds.has(old.oldProvinceId)) {
				errors.push(
					`province_merges.json: duplicate oldProvinceId "${old.oldProvinceId}"`
				);
			}
			mergedOldIds.add(old.oldProvinceId);
			if (provinceIdSet.has(old.oldProvinceId)) {
				errors.push(
					`province_merges.json: merged old province "${old.oldProvinceId}" cannot exist in current province.json`
				);
			}
		}
	}

	// 4. Ward mappings validation
	const mappings = readJson('ward_mappings.json');
	if (!Array.isArray(mappings) || mappings.length !== 10571) {
		errors.push(
			`ward_mappings.json: expected 10,571 mappings, got ${mappings.length}`
		);
	}

	let nullOldCodeCount = 0;
	for (let i = 0; i < mappings.length; i++) {
		const m = mappings[i];
		const prefix = `ward_mappings.json [row ${i}]:`;

		if (!communeIdMap.has(m.newWardCode)) {
			errors.push(
				`${prefix} newWardCode "${m.newWardCode}" not in commune.json`
			);
		} else {
			const expectedProvince = communeIdMap.get(m.newWardCode).idProvince;
			if (m.newProvinceCode && m.newProvinceCode !== expectedProvince) {
				errors.push(
					`${prefix} newProvinceCode "${m.newProvinceCode}" mismatch with commune province "${expectedProvince}"`
				);
			}
		}

		if (!ALLOWED_RELATIONS.has(m.relation)) {
			errors.push(`${prefix} invalid relation "${m.relation}"`);
		}

		if (m.oldWardCode === null) {
			nullOldCodeCount++;
			if (
				m.relation !== 'DISTRICT_CONVERTED' &&
				m.relation !== 'UNCODED_AREA'
			) {
				errors.push(
					`${prefix} null oldWardCode must have relation DISTRICT_CONVERTED or UNCODED_AREA, got "${m.relation}"`
				);
			}
		} else if (!/^\d{5}$/.test(m.oldWardCode)) {
			errors.push(`${prefix} invalid oldWardCode format "${m.oldWardCode}"`);
		}
	}

	if (nullOldCodeCount !== 6) {
		errors.push(
			`ward_mappings.json: expected exactly 6 null oldWardCode entries (5 island districts + 1 uncoded area), got ${nullOldCodeCount}`
		);
	}

	// Print summary
	if (warnings.length > 0) {
		console.warn(`⚠️  ${warnings.length} warning(s):`);
		warnings.forEach((w) => console.warn(`   - ${w}`));
	}

	if (errors.length > 0) {
		console.error(`❌ Validation failed with ${errors.length} error(s):`);
		errors.forEach((e) => console.error(`   - ${e}`));
		process.exit(1);
	}

	console.log('✅ All data validations passed successfully!');
	console.log(`   - 34 provinces (9 central cities)`);
	console.log(`   - 3,321 canonical communes`);
	console.log(`   - 10,571 ward mappings (6 special null oldWardCode cases)`);
	console.log(`   - Ia Mơ: verified with official code 23938`);
};

validate();
