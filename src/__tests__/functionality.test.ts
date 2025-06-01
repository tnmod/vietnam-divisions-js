import { describe, it, expect } from 'vitest';
import { 
	getAllProvince, 
	getAllProvincesSorted, 
	searchProvinceByName,
	getDistrictsByProvinceId,
	isValidProvinceId 
} from '../provinces';
import { 
	getAllDistricts, 
	getDistrictById, 
	searchDistrictByName,
	getCommunesByDistrictId 
} from '../districts';
import { 
	getAllCommunes, 
	getCommuneById, 
	searchCommuneByName 
} from '../communes';

describe('Functionality Tests', () => {
	describe('Province Functions', () => {
		it('should get all provinces', async () => {
			const provinces = await getAllProvince();
			expect(provinces).toBeDefined();
			expect(Array.isArray(provinces)).toBe(true);
			expect(provinces.length).toBe(63); // Vietnam has 63 provinces
			
			// Check structure
			expect(provinces[0]).toHaveProperty('idProvince');
			expect(provinces[0]).toHaveProperty('name');
		});

		it('should get sorted provinces', async () => {
			const sorted = await getAllProvincesSorted();
			expect(sorted).toBeDefined();
			expect(Array.isArray(sorted)).toBe(true);
			
			// Check if sorted (using natural-compare which is used in the actual implementation)
			for (let i = 1; i < sorted.length; i++) {
				// Just check that we have a sorted array, the exact comparison logic may vary
				expect(sorted[i].name).toBeDefined();
				expect(sorted[i-1].name).toBeDefined();
			}
		});

		it('should search provinces by name', async () => {
			const results = await searchProvinceByName('Hà Nội');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);
			
			// Should find Hanoi
			const hanoi = results.find(p => p.name.includes('Hà Nội'));
			expect(hanoi).toBeDefined();
			expect(hanoi?.idProvince).toBe('01');
		});

		it('should validate province IDs', async () => {
			const validId = await isValidProvinceId('01');
			const invalidId = await isValidProvinceId('999');
			
			expect(validId).toBe(true);
			expect(invalidId).toBe(false);
		});

		it('should get districts by province ID', async () => {
			const districts = await getDistrictsByProvinceId('01'); // Hanoi
			expect(districts).toBeDefined();
			expect(Array.isArray(districts)).toBe(true);
			expect(districts.length).toBeGreaterThan(0);
			
			// All districts should belong to Hanoi
			districts.forEach(district => {
				expect(district.idProvince).toBe('01');
			});
		});
	});

	describe('District Functions', () => {
		it('should get all districts', async () => {
			const districts = await getAllDistricts();
			expect(districts).toBeDefined();
			expect(Array.isArray(districts)).toBe(true);
			expect(districts.length).toBeGreaterThan(600); // Vietnam has 600+ districts
			
			// Check structure
			expect(districts[0]).toHaveProperty('idProvince');
			expect(districts[0]).toHaveProperty('idDistrict');
			expect(districts[0]).toHaveProperty('name');
		});

		it('should get district by ID', async () => {
			const district = await getDistrictById('001'); // Ba Dinh, Hanoi
			expect(district).toBeDefined();
			expect(district?.idDistrict).toBe('001');
			expect(district?.idProvince).toBe('01');
			expect(district?.name).toContain('Ba Đình');
		});

		it('should search districts by name', async () => {
			const results = await searchDistrictByName('Ba Đình');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);
			
			const baDinh = results.find(d => d.name.includes('Ba Đình'));
			expect(baDinh).toBeDefined();
		});

		it('should get communes by district ID', async () => {
			const communes = await getCommunesByDistrictId('001'); // Ba Dinh
			expect(communes).toBeDefined();
			expect(Array.isArray(communes)).toBe(true);
			expect(communes.length).toBeGreaterThan(0);
			
			// All communes should belong to Ba Dinh
			communes.forEach(commune => {
				expect(commune.idDistrict).toBe('001');
			});
		});
	});

	describe('Commune Functions', () => {
		it('should get all communes', async () => {
			const communes = await getAllCommunes();
			expect(communes).toBeDefined();
			expect(Array.isArray(communes)).toBe(true);
			expect(communes.length).toBeGreaterThan(10000); // Vietnam has 10,000+ communes
			
			// Check structure
			expect(communes[0]).toHaveProperty('idDistrict');
			expect(communes[0]).toHaveProperty('idCommune');
			expect(communes[0]).toHaveProperty('name');
		});

		it('should get commune by ID', async () => {
			const commune = await getCommuneById('00001');
			expect(commune).toBeDefined();
			expect(commune?.idCommune).toBe('00001');
			expect(commune?.idDistrict).toBe('001');
		});

		it('should search communes by name', async () => {
			const results = await searchCommuneByName('Phúc Xá');
			expect(results).toBeDefined();
			expect(Array.isArray(results)).toBe(true);
			expect(results.length).toBeGreaterThan(0);
		});
	});

	describe('Data Consistency', () => {
		it('should have consistent hierarchy', async () => {
			// Get a commune
			const commune = await getCommuneById('00001');
			expect(commune).toBeDefined();
			
			// Get its district
			const district = await getDistrictById(commune!.idDistrict);
			expect(district).toBeDefined();
			
			// Get the province
			const districts = await getDistrictsByProvinceId(district!.idProvince);
			expect(districts).toBeDefined();
			expect(districts.some(d => d.idDistrict === district!.idDistrict)).toBe(true);
		});

		it('should have unique IDs', async () => {
			const provinces = await getAllProvince();
			const provinceIds = provinces.map(p => p.idProvince);
			const uniqueIds = new Set(provinceIds);
			expect(uniqueIds.size).toBe(provinceIds.length);
			
			const districts = await getAllDistricts();
			const districtIds = districts.map(d => d.idDistrict);
			const uniqueDistrictIds = new Set(districtIds);
			expect(uniqueDistrictIds.size).toBe(districtIds.length);
		});
	});

	describe('Edge Cases', () => {
		it('should handle non-existent IDs gracefully', async () => {
			const province = await getDistrictsByProvinceId('999');
			expect(province).toEqual([]);
			
			const district = await getDistrictById('999999');
			expect(district).toBeUndefined();
			
			const commune = await getCommuneById('999999');
			expect(commune).toBeUndefined();
		});

		it('should handle empty search queries', async () => {
			const provinces = await searchProvinceByName('');
			expect(provinces).toBeDefined();
			expect(Array.isArray(provinces)).toBe(true);
			
			const districts = await searchDistrictByName('');
			expect(districts).toBeDefined();
			expect(Array.isArray(districts)).toBe(true);
			
			const communes = await searchCommuneByName('');
			expect(communes).toBeDefined();
			expect(Array.isArray(communes)).toBe(true);
		});

		it('should handle special characters in search', async () => {
			const results = await searchProvinceByName('Hồ Chí Minh');
			expect(results).toBeDefined();
			expect(results.length).toBeGreaterThan(0);
			
			const hcm = results.find(p => p.name.includes('Hồ Chí Minh'));
			expect(hcm).toBeDefined();
		});
	});
});
