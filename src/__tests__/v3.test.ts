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

		it('should search provinces by name', async () => {
			const results = await searchProvinceByName('Hà Nội');
			expect(results.length).toBeGreaterThan(0);
			expect(results.some((p) => p.idProvince === '01')).toBe(true);
		});

		it('should have 6 TP trực thuộc TW', async () => {
			const provinces = await getAllProvinces();
			const centralCities = provinces.filter(
				(p) => p.placeType === 'Thành phố Trung Ương'
			);
			expect(centralCities).toHaveLength(6);
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
	});
});

