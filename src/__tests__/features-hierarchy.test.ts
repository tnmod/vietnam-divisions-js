import { describe, it, expect } from 'vitest';
import {
	getProvinceWithDistricts,
	getDistrictWithCommunes,
	getFullHierarchy,
	getAddressPath,
	getFormattedAddress,
	getProvincesWithStats,
	getDistrictsWithStats,
	validateAddressHierarchy,
	getNeighboringDistricts,
} from '../features/hierarchy';

describe('Hierarchy Features', () => {
	it('should get province with all its districts', async () => {
		const result = await getProvinceWithDistricts('01');
		expect(result).toBeDefined();
		expect(result?.idProvince).toBe('01');
		expect(result?.districts.length).toBeGreaterThan(0);
		expect(result?.districts[0].idProvince).toBe('01');
	});

	it('should return null for non-existent province in getProvinceWithDistricts', async () => {
		expect(await getProvinceWithDistricts('999')).toBeNull();
	});

	it('should get district with all its communes', async () => {
		const result = await getDistrictWithCommunes('001');
		expect(result).toBeDefined();
		expect(result?.idDistrict).toBe('001');
		expect(result?.communes.length).toBeGreaterThan(0);
		expect(result?.communes[0].idDistrict).toBe('001');
	});

	it('should return null for non-existent district in getDistrictWithCommunes', async () => {
		expect(await getDistrictWithCommunes('999')).toBeNull();
	});

	it('should get full 3-level hierarchy for a province', async () => {
		const result = await getFullHierarchy('01');
		expect(result).toBeDefined();
		expect(result?.idProvince).toBe('01');
		expect(result?.districts.length).toBeGreaterThan(0);
		expect(result?.districts[0].communes.length).toBeGreaterThan(0);
	});

	it('should return null for non-existent province in getFullHierarchy', async () => {
		expect(await getFullHierarchy('999')).toBeNull();
	});

	it('should get address path for a commune', async () => {
		const result = await getAddressPath('00001');
		expect(result).toBeDefined();
		expect(result?.commune?.idCommune).toBe('00001');
		expect(result?.district?.idDistrict).toBe('001');
		expect(result?.province?.idProvince).toBe('01');
	});

	it('should return null for non-existent commune in getAddressPath', async () => {
		expect(await getAddressPath('99999')).toBeNull();
	});

	it('should format address in full and short formats', async () => {
		const full = await getFormattedAddress('00001', 'full');
		expect(full).toBeDefined();
		expect(full?.includes(',')).toBe(true);

		const short = await getFormattedAddress('00001', 'short');
		expect(short).toBeDefined();
		expect(short?.includes(',')).toBe(true);

		expect(await getFormattedAddress('99999')).toBeNull();
	});

	it('should get provinces with district counts', async () => {
		const result = await getProvincesWithStats();
		expect(result).toHaveLength(63);
		expect(result[0].districtCount).toBeGreaterThan(0);
	});

	it('should get districts with commune counts', async () => {
		const result = await getDistrictsWithStats('01');
		expect(result.length).toBeGreaterThan(0);
		expect(result[0].communeCount).toBeGreaterThan(0);
	});

	it('should validate address hierarchy correctly', async () => {
		expect(await validateAddressHierarchy('01', '001', '00001')).toBe(true);
		expect(await validateAddressHierarchy('01', '002', '00001')).toBe(false);
		expect(await validateAddressHierarchy('99', '001', '00001')).toBe(false);
	});

	it('should get neighboring districts in the same province', async () => {
		const neighbors = await getNeighboringDistricts('001'); // Ba Đình
		expect(neighbors.length).toBeGreaterThan(0);
		// Should belong to the same province (01 - Hà Nội)
		neighbors.forEach((d) => expect(d.idProvince).toBe('01'));
		// Should NOT include district 001 itself
		expect(neighbors.some((d) => d.idDistrict === '001')).toBe(false);
	});

	it('should return empty list for non-existent district in getNeighboringDistricts', async () => {
		expect(await getNeighboringDistricts('999')).toEqual([]);
	});
});
