import { describe, it, expect } from 'vitest';
import {
	getAllProvinces,
	getAllProvincesSorted,
	getProvinceById,
	getProvinceByCode,
	isValidProvinceId,
	searchProvinceByName,
	getAllCommunes,
	getCommuneById,
	getCommunesByProvinceId,
	searchCommuneByName,
} from '../v3';

describe('v3 API — NQ 202/2025/QH15', () => {
	// ==================== PROVINCES ====================
	describe('Provinces (34 tỉnh/thành phố)', () => {
		it('should return exactly 34 provinces', async () => {
			const provinces = await getAllProvinces();
			expect(provinces).toHaveLength(34);
		});

		it('should return sorted provinces', async () => {
			const sorted = await getAllProvincesSorted();
			expect(sorted).toHaveLength(34);
			// Check alphabetical order
			for (let i = 1; i < sorted.length; i++) {
				expect(sorted[i].name >= sorted[i - 1].name).toBe(true);
			}
		});

		it('should find Hà Nội by id "01"', async () => {
			const hn = await getProvinceById('01');
			expect(hn).toBeDefined();
			expect(hn!.name).toBe('Thành phố Hà Nội');
			expect(hn!.code).toBe('HNI');
			expect(hn!.placeType).toBe('Thành phố Trung Ương');
		});

		it('should find HCM by code "HCM"', async () => {
			const hcm = await getProvinceByCode('HCM');
			expect(hcm).toBeDefined();
			expect(hcm!.idProvince).toBe('79');
			expect(hcm!.name).toBe('Thành phố Hồ Chí Minh');
		});

		it('should be case-insensitive for code lookup', async () => {
			const hcm = await getProvinceByCode('hcm');
			expect(hcm).toBeDefined();
			expect(hcm!.idProvince).toBe('79');
		});

		it('should validate province id', async () => {
			expect(await isValidProvinceId('01')).toBe(true);
			expect(await isValidProvinceId('79')).toBe(true);
			// Old province codes that were merged should NOT be valid in v3
			expect(await isValidProvinceId('02')).toBe(false); // Hà Giang → merged into Tuyên Quang
			expect(await isValidProvinceId('27')).toBe(false); // Bắc Ninh cũ → merged
		});

		it('should NOT contain merged provinces', async () => {
			const provinces = await getAllProvinces();
			const ids = provinces.map((p) => p.idProvince);
			// These old provinces were merged
			expect(ids).not.toContain('02'); // Hà Giang
			expect(ids).not.toContain('06'); // Bắc Kạn
			expect(ids).not.toContain('49'); // Quảng Nam
			expect(ids).not.toContain('30'); // Hải Dương
		});

		it('should search provinces by name (accent-insensitive, NFD-safe, case-insensitive)', async () => {
			const hn = await searchProvinceByName('Hà Nội');
			expect(hn.length).toBeGreaterThan(0);
			expect(hn.some((p) => p.idProvince === '01')).toBe(true);

			// Unaccented
			const noAccent = await searchProvinceByName('ha noi');
			expect(noAccent.some((p) => p.idProvince === '01')).toBe(true);

			// Mixed case and spaces
			const mixed = await searchProvinceByName('  hÀ nỘi  ');
			expect(mixed.some((p) => p.idProvince === '01')).toBe(true);

			// NFD normalized input
			const nfd = await searchProvinceByName('Hà Nội'.normalize('NFD'));
			expect(nfd.some((p) => p.idProvince === '01')).toBe(true);

			// 2026 central cities by short or full name
			for (const query of [
				'Bắc Ninh',
				'bac ninh',
				'Đồng Nai',
				'dong nai',
				'Quảng Ninh',
				'quang ninh',
			]) {
				const res = await searchProvinceByName(query);
				expect(res.length).toBeGreaterThan(0);
			}
		});

		it('should have 9 TP trực thuộc TW (incl. Quảng Ninh, Bắc Ninh, Đồng Nai per 2026 resolutions)', async () => {
			const provinces = await getAllProvinces();
			const centralCities = provinces.filter(
				(p) => p.placeType === 'Thành phố Trung Ương'
			);
			expect(centralCities).toHaveLength(9);

			const cityIds = centralCities.map((c) => c.idProvince);
			expect(cityIds).toContain('01'); // Hà Nội
			expect(cityIds).toContain('22'); // Quảng Ninh (NQ 36/2026/QH16)
			expect(cityIds).toContain('24'); // Bắc Ninh (NQ 39/2026/QH16)
			expect(cityIds).toContain('31'); // Hải Phòng
			expect(cityIds).toContain('46'); // Huế
			expect(cityIds).toContain('48'); // Đà Nẵng
			expect(cityIds).toContain('75'); // Đồng Nai (NQ 30/2026/QH16)
			expect(cityIds).toContain('79'); // TP.HCM
			expect(cityIds).toContain('92'); // Cần Thơ
		});
	});

	// ==================== COMMUNES ====================
	describe('Communes (3,321 xã/phường)', () => {
		it('should return 3321 communes', async () => {
			const communes = await getAllCommunes();
			expect(communes).toHaveLength(3321);
		});

		it('should find commune by id', async () => {
			const commune = await getCommuneById('00004');
			expect(commune).toBeDefined();
			expect(commune!.name).toBe('Phường Ba Đình');
			expect(commune!.idProvince).toBe('01');
		});

		it('should get communes by province id', async () => {
			const communes = await getCommunesByProvinceId('01');
			expect(communes.length).toBeGreaterThan(0);
			// All communes should belong to province 01
			communes.forEach((c) => {
				expect(c.idProvince).toBe('01');
			});
		});

		it('should search communes by name', async () => {
			const results = await searchCommuneByName('Ba Đình');
			expect(results.length).toBeGreaterThan(0);
		});

		it('commune should have idProvince (not idDistrict)', async () => {
			const commune = await getCommuneById('00004');
			expect(commune).toBeDefined();
			expect(commune).toHaveProperty('idProvince');
			expect(commune).toHaveProperty('idCommune');
			expect(commune).toHaveProperty('name');
			// v3 communes do NOT have idDistrict
			expect(commune).not.toHaveProperty('idDistrict');
		});

		it('should have Ia Mơ with official NSO code 23938 (not 23737)', async () => {
			const iaMo = await getCommuneById('23938');
			expect(iaMo).toBeDefined();
			expect(iaMo!.name).toBe('Xã Ia Mơ');
			expect(iaMo!.idProvince).toBe('52');

			// Erroneous code 23737 must not exist as commune in v3
			const wrongCode = await getCommuneById('23737');
			expect(wrongCode).toBeUndefined();
		});

		it('should safely handle edge cases (empty strings, null, undefined)', async () => {
			expect(await getProvinceById('')).toBeUndefined();
			expect(await getProvinceById(null as any)).toBeUndefined();

			expect(await getProvinceByCode('')).toBeUndefined();
			expect(await getProvinceByCode(null as any)).toBeUndefined();

			expect(await searchProvinceByName('')).toEqual([]);
			expect(await searchProvinceByName('   ')).toEqual([]);

			expect(await getCommuneById('')).toBeUndefined();
			expect(await getCommuneById(null as any)).toBeUndefined();

			expect(await getCommunesByProvinceId('')).toEqual([]);
			expect(await getCommunesByProvinceId(null as any)).toEqual([]);

			expect(await searchCommuneByName('')).toEqual([]);
			expect(await searchCommuneByName('   ')).toEqual([]);
		});
	});
});
